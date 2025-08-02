import { Glob } from "bun";
import { exit } from "process";

const glob = new Glob("*");

async function main() {
  if (process.argv.length < 3) {
    console.error("Please provide a file or folder as input.");
    exit(1);
  }
  const inputPath = process.argv[2];
  const isFile = await Bun.file(inputPath).exists();
  if (isFile) {
    await processFile(inputPath);
  } else {
    for await (const file of glob.scan(inputPath)) {
      await processFile(file);
    }
  }
}

async function processFile(filePath: string) {
  const fileContent = await Bun.file(filePath).text();
  const statements = fileContent.match(/`([^`]+)`/g) || [];
  const ldvLine = statements.find((line) => line.includes("@ldv"));
  if (!ldvLine) {
    console.error(`${filePath} is not a valid Legaldoc file.`);
    return;
  }
  const version = ldvLine.split(" ")[1];
  const requireStatements = statements.filter((line) => line.includes("@require"));
  const importStatements = statements.filter((line) => line.includes("@import"));
  await processStatements(requireStatements, "require");
  await processStatements(importStatements, "import");
}

async function processStatements(statements: string[], type: "require" | "import") {
  for (const statement of statements) {
    const cleanedStatement = statement.replace(/`/g, "");
    const parts = cleanedStatement.split(" ");
    const rawPackageName = parts[1]; 
    const rootPackageName = rawPackageName.startsWith("#")
      ? rawPackageName.substring(1).split("/")[0]
      : rawPackageName;
    const registryUrl = "https://raw.githubusercontent.com/Opo-Regulatory-Guidelines/registry/refs/heads/main/registry.toml";
    const registryResponse = await fetch(registryUrl);
    const registryText = await registryResponse.text();
    const registry = Bun.TOML.parse(registryText) as { registry: Record<string, string> };
    const registryKey = Object.keys(registry.registry).find(
      (key) => key.toLowerCase() === rootPackageName.toLowerCase()
    );
    if (!registryKey) {
      console.error(`Package '${rootPackageName}' not found in the registry.`);
      continue;
    }
    const packageUrl = registry.registry[registryKey];
    const packageResponse = await fetch(packageUrl);
    const packageText = await packageResponse.text();
    const packageToml = Bun.TOML.parse(packageText) as { meta: Record<string, string> };
    let resourcePath = rawPackageName;
    if (rawPackageName.startsWith("#")) {
      resourcePath = rawPackageName.substring(1);
    }
    const resourceKey = resourcePath.includes("/")
      ? resourcePath.split("/").pop()!
      : resourcePath;
    const ldocTomlKey = Object.keys(packageToml.meta).find(
      (key) => key.toLowerCase() === resourceKey.toLowerCase()
    );

    if (!ldocTomlKey) {
      console.error(`Resource '${resourceKey}' not found in ldoc.toml for package '${rootPackageName}'.`);
      continue;
    }
    const filePath = packageToml.meta[ldocTomlKey];
    const fileUrl = new URL(filePath, packageUrl).toString();
    const fileResponse = await fetch(fileUrl);
    const fileContent = await fileResponse.text();
    const localFilePath = `./resolved/${rawPackageName.replace("#", "").replace("/", "-")}.md`;
    await Bun.write(localFilePath, fileContent);
    console.log(`Dependencies downloaded to ${localFilePath}.`);
  }
}
main();