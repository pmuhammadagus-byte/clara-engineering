<div align="center">

![Clara Engineering](assets/banner.svg)

# 🛠️ Clara Engineering
### Elite Coding & Debug Engine for OpenClaw

[![OpenClaw](https://img.shields.io/badge/OpenClaw-plugin-9cf.svg?style=for-the-badge)](https://github.com/openclaw/openclaw)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)](https://github.com/pmuhammadagus-byte/clara-engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![ClawHub](https://img.shields.io/badge/ClawHub-published-orange?style=for-the-badge)](https://clawhub.ai)

**Top-tier software-engineering toolkit built by Clara for Bos:**
architecture design · systematic debugging · senior code review · spec synthesis · runtime diagnostics

[What it does](#what-it-does) · [How it works](#how-it-works) · [Installation](#installation) · [Usage](#usage) · [Repo layout](#repo-layout) · [Local dev](#local-dev) · [Notes](#notes)

</div>

---

## What it does

`clara-engineering` is an OpenClaw plugin that gives your agent an **elite software-engineering brain**. Instead of generic answers, it runs structured, evidence-driven analysis through five contracted tools:

| Tool | What it does |
|------|--------------|
| `eng_architect` | Design or evaluate a software architecture: candidate approaches, explicit trade-off matrix, recommended path, risks, and a decision checklist. |
| `eng_debug` | Debug systematically from a symptom / stack trace: ranked root-cause hypotheses by evidence, then the next concrete diagnostic step. |
| `eng_review` | Senior-level code review. Reads the file when given, runs a safe `node --check` syntax pass, and returns prioritized findings (security / correctness / performance / maintainability) with severity. |
| `eng_spec` | Turn an ambiguous requirement into a precise technical spec: goals, non-goals, functional / non-functional requirements, data model, API surface, edge cases, acceptance criteria. |
| `eng_diagnose` | Root-cause analysis from logs / error dumps / stack traces: extracts error signatures, correlates failure modes, returns prioritized remediation + next verification step. |

All tools read real files when a path is supplied and degrade gracefully when they can't. No external API keys required.

## How it works

- Pure ES-module OpenClaw plugin (`openclaw/plugin-sdk/plugin-entry`), self-contained — **no `typebox` or extra npm installs** (uses a tiny inline schema helper so it loads in constrained environments like Termux).
- Each tool returns a structured Markdown analysis the agent can act on directly.
- Safe, read-only checks only (`node --check`, file reads, static heuristics). It never mutates your code.
- Configurable via `configSchema`: `strictness` (`pragmatic` / `standard` / `elite`), `languageHint`, `maxFindings`.

## Installation

### Option A — ClawHub (recommended)
```bash
clawhub skill install clara-engineering
```

### Option B — From GitHub
```bash
git clone https://github.com/pmuhammadagus-byte/clara-engineering.git \
  ~/.openclaw/extensions/clara-engineering
openclaw gateway restart
```

### Option C — Manual
Copy the folder into your OpenClaw extensions directory:
```bash
cp -r clara-engineering ~/.openclaw/extensions/
openclaw gateway restart
```
Then ensure it is enabled in `~/.openclaw/openclaw.json`:
```json
{ "plugins": { "entries": { "clara-engineering": { "enabled": true } } } }
```

## Usage

Just ask Clara (your agent) in natural language — the tools are auto-invoked:

- *"Design a system for realtime notifications at 50k req/s"* → `eng_architect`
- *"This function crashes only in prod, debug it"* → `eng_debug`
- *"Review this file for security issues"* → `eng_review`
- *"Write a spec for a payment retry queue"* → `eng_spec`
- *"Diagnose this error log"* → `eng_diagnose`

Example direct invocation (agent side):
```
eng_review({ filePath: "./src/auth.ts", focus: "security" })
```

## Repo layout

```
clara-engineering/
├── openclaw.plugin.json   # plugin manifest (id, tool contracts, configSchema)
├── package.json           # npm metadata
├── README.md              # this file
├── LICENSE                # MIT
├── CONTRIBUTING.md        # how to contribute
└── dist/
    └── index.js           # compiled plugin entry (5 tools)
```

> Source is authored directly in `dist/index.js` (no build step required to run).

## Local dev

```bash
# from the plugin folder
node --check dist/index.js          # syntax check
openclaw plugins inspect clara-engineering   # confirm it loads
openclaw gateway restart             # reload after edits
```

To invoke a tool in isolation for testing, import the default export and call `register` with a fake API that captures `registerTool`.

## Notes

- Built by **Clara** for **Bos** (Agus). MIT licensed.
- Self-contained: loads without `typebox` or a `node_modules` install.
- Safe & read-only: it reviews and reasons, it does not rewrite your code.
- Pair it with `super-intelligence-skill` for deepest reasoning, or run standalone.

---

<div align="center">

**Clara Engineering — ship code that survives contact with production.**

</div>
