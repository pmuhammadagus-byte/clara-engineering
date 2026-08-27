# Contributing to Clara Engineering

Thanks for wanting to help make Clara's engineering brain sharper. 🛠️

## How the plugin is structured

- `dist/index.js` is the **runtime entry** — it is the source of truth (no build step). Edit it directly.
- `openclaw.plugin.json` declares the plugin id, tool contracts, and `configSchema`.
- `package.json` holds npm metadata.

## Adding or changing a tool

1. Add a new `api.registerTool({ name, label, description, parameters, async execute })` block in `dist/index.js`.
2. Register the tool name in `openclaw.plugin.json` → `contracts.tools`.
3. Keep it **safe & read-only**: reviews and reasons, never rewrites user code.
4. Keep it **self-contained**: do not add `typebox` or other npm deps (use the inline schema helper `Str/Num/Bool/Opt/Obj`).

## Local verification

```bash
node --check dist/index.js
openclaw plugins inspect clara-engineering
openclaw gateway restart
```

## Pull requests

- Fork, branch (`feat/...`, `fix/...`), and open a PR against `main`.
- Update `README.md` if behavior changes.
- Bump `version` in `openclaw.plugin.json` and `package.json` for any publish.

## Publishing

Maintainer only:

```bash
# GitHub
git push origin main

# ClawHub (bump version first if re-publishing same slug)
clawhub skill publish ./clara-engineering --version <new-version>
```

## Code of conduct

Be respectful. Keep tool output structured and actionable. When in doubt, optimize for correctness over cleverness.
