# oxc_estree_ts-ast-diff-viewer

Simple app for viewing AST differences between TS-ESLint and OXC.

## How to use

```sh
# Clone OXC repo next to this repo and prepare typescript fixtures by `just submodules`
# - oxc
#   - tasks
#     - coverage
#       - typescript
# - oxc_estree_ts-ast-diff-viewer
#   - README.md
#   - ...

# Install Bun js runtime

cd oxc_estree_ts-ast-diff-viewer

# Then, create index
bun ./bun-create-index.js

# Run app
bun i
bun run dev
# Open http://localhost:5173
```
