# oxc_estree_ts-ast-diff-viewer

> Align JS-side AST with standard for TypeScript · Issue #9705 · oxc-project/oxc 
> https://github.com/oxc-project/oxc/issues/9705

Simple app for viewing AST differences between TS-ESLint and OXC.

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

2. Prepare typescript fixtures by `just submodules`
3. Run `pnpm run build` in `/napi/parser`
4. Install Bun js runtime
5. Setup and run app

```sh
cd oxc_estree_ts-ast-diff-viewer

# create or update index
# This may take about 2-3 mins...
bun ./bun-create-index.js

# Run app
bun i
bun run dev
```

6. Open http://localhost:5173

## Notes

Some of the results in this app may not be identical to the ones on the `tasks/coverage`.

- Not specified the exact options
- Not done every tweaking for the ASTs
- etc...

Just use it for simple checking.
