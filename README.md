# oxc_estree_ts-ast-diff-viewer

> Align JS-side AST with standard for TypeScript · Issue #9705 · oxc-project/oxc
> https://github.com/oxc-project/oxc/issues/9705

Simple app for browsing AST differences between TS-ESLint and OXC.

![](./ss.avif)

## How to use

1. Clone OXC repo next to this repo

```
- oxc
  - tasks
    - coverage
      - typescript
  - ...
- oxc_estree_ts-ast-diff-viewer
  - README.md
  - ...
```

2. Prepare typescript fixtures by `just submodules` and `pnpm run build` in `/napi/parser`

```sh
cd oxc
just submodules

cd napi/parser
pnpm run build
```

3. Install Bun js runtime for setup script
4. Create index files and run app

```sh
cd oxc_estree_ts-ast-diff-viewer

# create or update index in `./generated`
# This may take about 20~30 sec...
bun ./bun-create-index.js

# Run app(You can use `npm` this time if you want)
bun i
bun run dev
```

5. Open http://localhost:5173

## Notes

- A few test files are ignored for now
  - See `bun-create-index.js` and find `ignored` keyword
