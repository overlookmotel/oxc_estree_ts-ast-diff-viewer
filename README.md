# oxc_estree_ts-ast-diff-viewer

> Align JS-side AST with standard for TypeScript · Issue #9705 · oxc-project/oxc 
> https://github.com/oxc-project/oxc/issues/9705

Simple app for viewing AST differences between TS-ESLint and OXC.

![](./ss.avif)

## How to use

1. Clone OXC repo next to this repo and prepare typescript fixtures by `just submodules`.

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

2. Install Bun js runtime

3. Setup and run app

```sh
cd oxc_estree_ts-ast-diff-viewer

# create or update index
bun ./bun-create-index.js

# Run app
bun i
bun run dev
```

4. Open http://localhost:5173

## Notes

Some of the results in this app may not be identical to the ones on the `tasks/coverage`.

- Not specified the exact options
- Not done every tweaking for the ASTs
- etc...

Just use it for simple checking.
