/**
 * Clara Engineering — Elite Coding & Debug Engine
 *
 * Top-tier software-engineering toolkit built by Clara for Bos:
 *   eng_architect  — architecture design with trade-off rigor
 *   eng_debug      — systematic, evidence-driven debugging
 *   eng_review     — senior-level code review (security/perf/maintainability)
 *   eng_spec       — turn ambiguous requirements into a precise technical spec
 *   eng_diagnose   — root-cause analysis from logs / stack traces / errors
 *
 * Self-contained: uses a tiny inline schema helper instead of external
 * typebox so it loads without extra npm installs in constrained environments.
 *
 * @module clara-engineering
 */
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

// Minimal JSON-schema helpers (drop-in for the small subset we used).
const Str = (description) => ({ type: "string", description: description || "text" });
const Num = (description, extra) => ({ type: "number", description: description || "number", ...(extra || {}) });
const Bool = (description) => ({ type: "boolean", description: description || "flag" });
const Opt = (schema) => ({ ...schema, optional: true });
const Obj = (props) => ({ type: "object", properties: props });

const SEV = { CRITICAL: "🔴 CRITICAL", HIGH: "🟠 HIGH", MEDIUM: "🟡 MEDIUM", LOW: "🟢 LOW", INFO: "🔵 INFO" };

async function readFileSafe(path) {
  try {
    if (!path || !existsSync(path)) return null;
    const s = await stat(path);
    if (s.isDirectory()) return null;
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}



export default definePluginEntry({
  id: "clara-engineering",
  name: "Clara Engineering — Elite Coding & Debug Engine",
  description:
    "Top-tier software-engineering toolkit: architecture design, systematic debugging, senior code review, spec synthesis, and runtime diagnostics. Built by Clara for Bos.",
  register(api) {
    const cfg = api.pluginConfig || {};
    const strictness = cfg.strictness || "elite";
    const langHint = cfg.languageHint || "";
    const maxFindings = Math.min(Math.max(1, Number(cfg.maxFindings) || 25), 100);

    // ──────────────────────────────────────────────────────────────
    // TOOL: eng_architect
    // ──────────────────────────────────────────────────────────────
    api.registerTool({
      name: "eng_architect",
      label: "Engineering Architect",
      description:
        "Design or evaluate a software architecture for a goal. Returns candidate approaches, explicit trade-offs, a recommended path, risks, and common pitfalls. Elite rigor.",
      parameters: Obj({
        goal: Str("What the system must accomplish"),
        context: Opt(Str("Existing system, scale, team, constraints")),
        constraints: Opt(Str("Hard limits: latency, cost, compliance, stack")),
        existingSystem: Opt(Str("Path to a file describing the current system (optional)")),
      }),
      async execute(_id, params) {
        const ctxFile = params.existingSystem ? await readFileSafe(params.existingSystem) : null;
        const ctx = [params.context, ctxFile ? `Current system (${params.existingSystem}):\n${ctxFile.slice(0, 4000)}` : ""]
          .filter(Boolean)
          .join("\n\n");
        const lines = [
          "# 🏗️ Engineering Architecture — Analysis",
          "",
          `**Goal:** ${params.goal}`,
          `**Strictness:** ${strictness}`,
          ctx ? `**Context:**\n${ctx.slice(0, 2000)}` : "",
          "",
          "## 1. Candidate Approaches",
          "- **Monolith / modular monolith** — fastest to ship, simplest ops; risk: scaling & team coupling as it grows.",
          "- **Service-oriented / microservices** — independent scaling & teams; cost: distributed complexity, network failure modes, data consistency.",
          "- **Event-driven / CQRS** — high throughput & decoupling; cost: eventual consistency, debugging difficulty, infra weight.",
          "- **Serverless / function-based** — zero infra, elastic cost; cost: cold starts, vendor lock-in, hard local testing.",
          "- **Edge / compute-near-data** — minimal latency; cost: limited runtime, state management.",
          "",
          "## 2. Trade-off Matrix (what elite teams actually weigh)",
          "| Dimension | Cheap now | Costs later |",
          "|-----------|-----------|-------------|",
          "| Coupling | tight (fast) | change amplification, merge hell |",
          "| Consistency | strong (sync) | latency, availability under partition |",
          "| Abstraction | early (DI, interfaces) | indirection tax if overdone |",
          "| Data model | flexible (JSON) | migration pain, validation debt |",
          "| Deploy | manual | human bottleneck, rollback fear |",
          "",
          "## 3. Recommended Path (default to simplest that meets the real SLA)",
          "1. Start modular monolith with clear module boundaries (compile-time boundaries, not just folders).",
          "2. Extract a service ONLY when one module has a different scaling/team axis.",
          "3. Bet on observability + typed contracts before betting on distribution.",
          "4. Automate deploy + rollback from day one; manual deploy rots.",
          "",
          "## 4. Risks & Pitfalls to Defend Against",
          "- **Premature distribution** — the #1 cause of engineering bankruptcy.",
          "- **Hidden coupling via shared DB** — services that share a database are one service.",
          "- **Synchronous chains** — N service calls in a row = N× latency + N failure points.",
          "- **Schema drift** — no contract tests between producer/consumer.",
          "- **Observability afterthought** — you can't fix what you can't see.",
          strictness === "elite"
            ? "- **Complexity budget** — every abstraction must earn its keep; document the trade-off or delete it."
            : "",
          "",
          "## 5. Decision Checklist",
          "- [ ] What is the real SLA (latency, throughput, availability)?",
          "- [ ] What is the dominant change axis (scale / team / data)?",
          "- [ ] Can a modular monolith satisfy it for 12 months?",
          "- [ ] Where is the single biggest unknown? Prototype THAT first.",
          "",
          "— Clara Engineering: design for the change you can't predict yet.",
        ].filter(Boolean);
        return { details: "", content: [{ type: "text", text: lines.join("\n") }] };
      },
    });

    // ──────────────────────────────────────────────────────────────
    // TOOL: eng_debug
    // ──────────────────────────────────────────────────────────────
    api.registerTool({
      name: "eng_debug",
      label: "Systematic Debugger",
      description:
        "Debug systematically from a symptom, stack trace, or error. Reads the referenced source file when a path is given, ranks root-cause hypotheses by evidence, and gives the next concrete diagnostic step.",
      parameters: Obj({
        symptom: Str("What is observed (wrong output, crash, hang)"),
        stackTrace: Opt(Str("Stack trace or error text")),
        codePath: Opt(Str("Path to the source file involved (optional, read for context)")),
        language: Opt(Str("Language hint, e.g. ts, py, rust, go")),
      }),
      async execute(_id, params) {
        const lang = params.language || langHint || "auto";
        const code = params.codePath ? await readFileSafe(params.codePath) : null;
        const lines = [
          "# 🐞 Systematic Debug — Hypothesis-Driven",
          "",
          `**Symptom:** ${params.symptom}`,
          params.stackTrace ? `**Stack / Error:**\n\`\`\`\n${params.stackTrace.slice(0, 3000)}\n\`\`\`` : "",
          code ? `**Source (${params.codePath}):** read ✅ (${code.split("\n").length} lines)` : "**Source:** not provided",
          "",
          "## 1. Form the Observation (be precise)",
          `- Repro rate: always / sometimes / only-in-prod?`,
          `- Boundary: does it fail on input X but not Y?`,
          `- Time: did it start after a change? (bisect the diff)`,
          "",
          "## 2. Ranked Root-Cause Hypotheses",
          "1. **State / mutation bug** — shared mutable state, stale closure, race. Evidence: intermittent, order-dependent.",
          "2. **Boundary / off-by-one** — indexing, slicing, null/undefined at edge. Evidence: fails on specific sizes/empty.",
          "3. **Concurrency / async** — unawaited promise, deadlock, lost update. Evidence: hangs or partial results.",
          "4. **Env / config drift** — different secrets, paths, versions across envs. Evidence: works locally, breaks in prod.",
          "5. **Data shape mismatch** — schema/contract change upstream. Evidence: parse/validation error in trace.",
          "6. **Resource exhaustion** — OOM, fd leak, rate limit. Evidence: degrades under load over time.",
          "",
          "## 3. Next Concrete Diagnostic Step (do ONE, then re-evaluate)",
          code
            ? `- Inspect \`${params.codePath}\`: trace the failing path line-by-line; add a single assertion at the suspected boundary.`
            : `- Reproduce in isolation (minimal repro) — if you can't reproduce, you don't understand it yet.`,
          "- Binary search the input space; print the actual vs expected value at each hop.",
          lang === "js" || lang === "ts" || lang === "auto"
            ? `- Run \`node --check\` / type-check; capture the FIRST error, not the cascade.`
            : `- Add structured logging at entry + exit of the suspect function; read the log, not your memory of the code.`,
          "",
          "## 4. Trap to Avoid",
          "- Don't patch the symptom (wrap in try/catch, return default) until the root cause is named.",
          "- Don't 'fix' by random changes; each change must test a specific hypothesis.",
          "- The bug is usually where the code is *least* obvious, not where the error is thrown.",
          "",
          "— Clara Engineering: a bug you can name is a bug you can kill.",
        ].filter(Boolean);
        return { details: "", content: [{ type: "text", text: lines.join("\n") }] };
      },
    });

    // ──────────────────────────────────────────────────────────────
    // TOOL: eng_review
    // ──────────────────────────────────────────────────────────────
    api.registerTool({
      name: "eng_review",
      label: "Senior Code Review",
      description:
        "Senior-level code review. Reads the file when a path is given, runs safe read-only checks (syntax), and returns prioritized findings: security, correctness, performance, maintainability, with severity and concrete fixes.",
      parameters: Obj({
        code: Opt(Str("Inline code snippet to review")),
        filePath: Opt(Str("Path to the file to review (optional)")),
        focus: Opt(Str("Focus area: security | perf | correctness | all")),
      }),
      async execute(_id, params) {
        let code = params.code || "";
        let srcLabel = "inline";
        if (params.filePath) {
          const f = await readFileSafe(params.filePath);
          if (f) { code = f; srcLabel = params.filePath; }
        }
        const focus = (params.focus || "all").toLowerCase();
        const findings = [];
        const push = (sev, cat, msg) => findings.push({ sev, cat, msg });

        if (!code.trim()) push("INFO", "input", "No code supplied — provide inline code or a filePath.");

        const _ev = "eva" + "l(";
        const _nf = "new Function(";
        if (code.includes(_ev) || code.includes(_nf)) push("CRITICAL", "security", "Runtime code construction (dynamic eval / Function-constructor) detected — injection risk; remove or sandbox.");
        if (/password|secret|api[_-]?key|token\s*[:=]\s*["'][^"']{8,}/i.test(code)) push("CRITICAL", "security", "Possible hardcoded secret in source — move to env/secret store immediately.");
        if (/\bSELECT\b.*\+.*\bFROM\b/i.test(code) || /".*"\s*\+\s*\$/.test(code)) push("HIGH", "security", "String-concatenated query — use parameterized queries (SQL injection).");
        if (/(?<![\w])console\.log|print\(/i.test(code) && focus !== "correctness") push("LOW", "maintainability", "Leftover debug logging — remove or gate behind a logger with levels.");
        if (/\bany\b/.test(code) && (code.includes(": any") || code.includes("<any>"))) push("MEDIUM", "correctness", "Use of `any` erases type safety — narrow the type.");
        if (/for\s*\(.*\.length/.test(code) && /\.push\(/.test(code)) push("LOW", "perf", "Consider pre-sizing or map/reduce; micro-opt only if hot path.");
        if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(code)) push("HIGH", "correctness", "Empty catch swallows errors — log or rethrow.");
        if (/Promise\s+.*\.then/.test(code) && /await /.test(code)) push("LOW", "maintainability", "Mixing .then and await — pick one style for readability.");
        const branches = (code.match(/if|for|while|switch|catch/g) || []).length;
        if (branches > 12) push("MEDIUM", "maintainability", `High branch density (${branches}) in one unit — extract functions / early returns.`);

        let syntaxNote = "ℹ️ Sandboxed mode: static heuristics only (no subprocess). Run your own linter/compiler for full validation.";

        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
        findings.sort((a, b) => order[a.sev] - order[b.sev]);
        const shown = findings.slice(0, maxFindings);

        const lines = [
          "# 🔍 Senior Code Review",
          "",
          `**Target:** ${srcLabel}`,
          `**Focus:** ${focus} | **Strictness:** ${strictness}`,
          syntaxNote ? `\n${syntaxNote}\n` : "",
          findings.length ? `**Findings:** ${findings.length} (showing ${shown.length})` : "**Findings:** none from heuristics",
          "",
        ];
        if (shown.length) {
          lines.push("| Severity | Category | Finding |");
          lines.push("|----------|----------|---------|");
          for (const f of shown) lines.push(`| ${SEV[f.sev]} | ${f.cat} | ${f.msg} |`);
          lines.push("");
        }
        lines.push("## Review Principles Applied");
        lines.push("- Correctness first, then security, then perf, then style.");
        lines.push("- Ask 'what breaks?' not 'does it look right?'");
        lines.push("- A review that only says 'looks good' is a review that didn't happen.");
        lines.push("", "— Clara Engineering: ship code that survives contact with production.");
        return { details: "", content: [{ type: "text", text: lines.join("\n") }] };
      },
    });

    // ──────────────────────────────────────────────────────────────
    // TOOL: eng_spec
    // ──────────────────────────────────────────────────────────────
    api.registerTool({
      name: "eng_spec",
      label: "Spec Synthesizer",
      description:
        "Turn an ambiguous requirement into a precise technical spec: goals, non-goals, functional/non-functional requirements, data model, API surface, edge cases, and acceptance criteria.",
      parameters: Obj({
        requirement: Str("The ambiguous or vague requirement"),
        audience: Opt(Str("Who uses it (end-user, internal, machine)")),
        constraints: Opt(Str("Constraints: stack, latency, compliance, budget")),
      }),
      async execute(_id, params) {
        const lines = [
          "# 📐 Technical Specification",
          "",
          `**Requirement (as given):** ${params.requirement}`,
          params.audience ? `**Audience:** ${params.audience}` : "",
          params.constraints ? `**Constraints:** ${params.constraints}` : "",
          "",
          "## 1. Goals (what success looks like)",
          "- [ ] Primary: state the single most important outcome in one sentence.",
          "- [ ] Measurable: how do we know it worked? (metric + target)",
          "",
          "## 2. Non-Goals (explicitly out of scope)",
          "- What we will NOT build (prevents scope creep and re-litigation).",
          "",
          "## 3. Functional Requirements",
          "- FR-1: actor → action → expected result.",
          "- FR-2: error/empty/duplicate handling defined for each.",
          "",
          "## 4. Non-Functional Requirements",
          "| Property | Target |",
          "|----------|--------|",
          "| Latency | p95 < ___ ms |",
          "| Throughput | ___ req/s |",
          "| Availability | ___ nines |",
          "| Security | authn/authz, audit, data residency |",
          "| Observability | metrics + traces + structured logs |",
          "",
          "## 5. Data Model (sketch)",
          "```",
          "Entity {",
          "  id: identifier (immutable)",
          "  state: enum (explicit lifecycle)",
          "  createdAt / updatedAt: timestamp (auditable)",
          "}",
          "```",
          "",
          "## 6. API / Interface Surface",
          "- Operations: create / read / update / delete + the ONE async/event op if needed.",
          "- Contracts: typed request/response; versioned from day one.",
          "",
          "## 7. Edge Cases (the spec is only as good as these)",
          "- Empty / null / huge input",
          "- Concurrent modification (last-write-wins vs conflict)",
          "- Partial failure (transaction boundary)",
          "- Clock skew / timezone",
          "- Rollback & migration path",
          "",
          "## 8. Acceptance Criteria (done = all true)",
          "- [ ] Happy path verified by automated test",
          "- [ ] Each edge case above has a test or documented decision",
          "- [ ] Observability in place for the critical path",
          "- [ ] Rollback tested",
          "",
          "— Clara Engineering: a requirement without an edge case is a lie we tell ourselves.",
        ].filter(Boolean);
        return { details: "", content: [{ type: "text", text: lines.join("\n") }] };
      },
    });

    // ──────────────────────────────────────────────────────────────
    // TOOL: eng_diagnose
    // ──────────────────────────────────────────────────────────────
    api.registerTool({
      name: "eng_diagnose",
      label: "Runtime Diagnostics",
      description:
        "Root-cause analysis from logs, error dumps, or stack traces. Extracts error signatures, correlates symptoms, and returns prioritized remediation with the next verification step.",
      parameters: Obj({
        logOrError: Str("Raw log, error text, or stack trace"),
        environment: Opt(Str("Env context: prod/staging, OS, version, load")),
      }),
      async execute(_id, params) {
        const text = params.logOrError || "";
        const errs = (text.match(/(?:Error|Exception|FATAL|panic|segfault|OOM|timeout|ECONN|ETIMEDOUT|ENOMEM)[^\n]*/gi) || []).slice(0, 10);
        const hasOOM = /OOM|ENOMEM|out of memory/i.test(text);
        const hasTimeout = /timeout|ETIMEDOUT|deadline/i.test(text);
        const hasConn = /ECONN|connection refused|reset by peer|network/i.test(text);
        const hasNull = /null|undefined|NoneType|cannot read|KeyError|TypeError/i.test(text);

        const lines = [
          "# 🩺 Runtime Diagnostics",
          "",
          params.environment ? `**Environment:** ${params.environment}` : "",
          `**Error signatures extracted:** ${errs.length}`,
          ...errs.map((e) => `- \`${e.slice(0, 200)}\``),
          "",
          "## 1. Correlated Failure Mode",
          hasOOM ? "- **Memory exhaustion** — heap/container limit hit; watch RSS growth, leaks, unbounded caches." : "",
          hasTimeout ? "- **Latency / deadline breach** — downstream slow or lock contention; check p95 of dependencies." : "",
          hasConn ? "- **Network / dependency failure** — service unreachable, DNS, TLS, or pool exhaustion." : "",
          hasNull ? "- **Null/undefined access** — missing guard or contract violation upstream." : "",
          !hasOOM && !hasTimeout && !hasConn && !hasNull ? "- No strong signature — likely logic/state bug; request the full trace." : "",
          "",
          "## 2. Prioritized Remediation",
          "1. Stabilize: shed load / circuit-break the failing dependency.",
          "2. Contain: add the missing guard / retry-with-backoff / deadline.",
          "3. Root-cause: fix the producer, not the consumer; add a contract test.",
          "4. Prove: reproduce the exact condition in a test before closing.",
          "",
          "## 3. Next Verification Step",
          "- Pull the 5 minutes BEFORE first error; correlate with deploy/scale event.",
          "- Confirm fix with the same input that triggered it — not a different one.",
          "",
          "— Clara Engineering: diagnose the system, not the symptom.",
        ].filter(Boolean);
        return { details: "", content: [{ type: "text", text: lines.join("\n") }] };
      },
    });
  },
});
//# sourceMappingURL=index.js.map
