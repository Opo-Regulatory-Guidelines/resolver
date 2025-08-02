Legaldoc, shortened as ldoc, is a system used by ORG to resolve and organize dependencies of a document. As stupid as it sounds, it is helpful in many situations.

In legaldoc, the first thing of a document should be the legaldoc version, like this:
@ldv 0.1.0

'ldv' stands for Legaldoc Version

Next, you can @require or @import another document. The difference is that @require is used to apply jurisdiction. On a document that is defined under ORG, you should @require ORG instead of @importing it. @import is better suited for use. If you are talking about an item and directly referencing things from it, you should @import it.

Both are used like this:
@require ORG

@import ORG as ORG

In the case of the import, we can then use ORG and reference items from it like this: ORG:[1.1A]

When importing a group of items, or a subset within a group, we can do the following:
@import #ORG

@import #ORG/Extra

We can then mention things from said documents: ORG # Extra / National

Legaldoc also enforces how you organize your document. While organizing a document differently does not make it invalid Legaldoc, it is recommended to structure your document like the following:

# [1] This is a section
## [1.1] This is a subsection
[1.1A] This is a clause
  [1.1AB] This is a directly related clause
[1.1B] This is another clause
That's it!

The main Legaldoc registry is at https://raw.githubusercontent.com/Opo-Regulatory-Guidelines/registry/refs/heads/main/registry.toml (registry.toml) and contains:
```
[registry]
org = "https://raw.githubusercontent.com/Opo-Regulatory-Guidelines/guidelines/refs/heads/main/ldoc.toml"
```
All keys in the registry have links to ldoc.toml files. These files define packages, like this:
```
[meta]
org = "./Regulations.md"
extra = "./Extra/*"
extra/national = "./Extra/National.md"
extra/antitrust = "./Extra/Antitrust.md"
extra/brook = "./Extra/Brook.md"
```
We can then find those files. 
org = ./Regulations.md
So, Regulations.md is at https://raw.githubusercontent.com/Opo-Regulatory-Guidelines/guidelines/refs/heads/main/Regulations.md
We can then download all files found in a document with input for the resolver that are required or imported. Simple as pie.