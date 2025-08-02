#!/bin/bash
cp -a index.ts ldr
cat > temp_ldr <<EOF
#!/usr/bin/env bun
EOF
cat ldr >> temp_ldr
mv temp_ldr ldr
chmod +x ldr