# Harness — Workflow

**Repo type:** `frontend`  ← init fills this. Apply only lines tagged with your type. `testing` repos match neither `[frontend]` nor `[backend]` lines (run the generic flow; a "feature" is a test scenario, `test.cjs` runs the suite).

**Scripts are Node** (`.claude/scripts/*.cjs`), run as `node .claude/scripts/<name>.cjs [args]` — same command on Windows/macOS/Linux, no shell-specific wrapper. `.cjs` forces CommonJS regardless of this repo's own `package.json` `"type"` field.

Defines HOW work is done. This is the only flow instruction; read it fully at start.

---

## System files

All under `.claude/` except this `CLAUDE.md` (repo root).

- `features/{n}_{slug}.md` — Feature intent. **Immutable.** Source of truth for feature *content*, not current system state.
- `history.md` — Live task state. **Scripts manage it; never edit by hand.**
- `handoff.md` — Relay scratch state, for resuming mid-feature under a **different agent** (possibly a different CLI). The opposite of the two files above: ephemeral, agent-written, overwritten each leg, deleted by `mark-ended.cjs` when a feature finishes. Header stamped by `write-handoff.cjs`; body sections are yours. Recommend gitignoring it.
- `relay.json` — Cross-CLI + cloud/local relay config (see *Agent relay*). `enabled: false` by default = relay off. `relay.pid` / `relay.state` / `relay.log` / `relay.prompt.txt` / `relay.launch.*` are supervisor runtime files. Gitignore all of them (keep `relay.json`).
- `notes.md` — Project constraints + learnings. Append via `add-note.cjs`.
- `project.md` — Project brief (init interview). Read for general context.
- `endpoints.md` — Endpoint contract. `[backend]` you write it; `[frontend]` read-only copy from the API.
- `DESIGN.md` — `[frontend]` Design system rules. Read before building/changing any UI.
- File tree — regen with `tree.cjs` to navigate. Don't read the whole project to orient.
- `status.html` — Live dashboard reading `history.md` + `features/` (auto-refreshes every 5s); each `ENDED` feature's commit hash links out to the commit on the remote host, when one was recorded. File-serve it (`file://` is blocked by its own fetch guard — serve the project root over http, e.g. `npx serve .` / `python -m http.server`) to watch feature state and read feature content without leaving the browser.

---

## Roles

v1: three roles in **one session**, not subagents.

- **Orchestrator** (main session): picks the feature, drives the flow. **Writes no code.**
- **Dev**: implements the feature.
- **Tester**: runs the test command, reads output.

> Promote Dev/Tester to subagents in `/agents` only when one feature's cycle (implement + test + iterate) starts saturating session context. That's the trigger — not project size.

---

## Playwright E2E architecture

`[frontend]` Keep E2E suites feature/journey-oriented and make UI knowledge reusable. Follow the project's existing Playwright `testDir` and layout; in a new suite, the logical shape is:

```text
e2e/
  components/        # reusable Component Objects, e.g. header.ts, toast.ts
  pages/             # Page Objects composed from component objects
  specs/             # business journeys, e.g. settings.spec.ts
```

- A **Component Object** owns locators and meaningful operations for one shared or complex UI component. Create one for a component reused across pages, or when its interaction is complex enough to repeat. Example: `Header.goToSettings()`.
- A **Page Object** owns navigation and page-specific operations, and composes component objects: `this.header = new Header(page)`. Do not copy header locators into every page object.
- A **spec** states the user journey and asserts its outcome. It calls page/component operations; it does not know CSS selectors, DOM structure, or duplicate setup steps.
- Prefer accessible role/name locators. Use a stable `data-testid` only when an accessible locator is not sufficient. Never use CSS classes, XPath, or implementation-driven selectors.
- Keep objects small and behavior-oriented. No generic `BasePage`, locator passthrough wrappers, inheritance tree, or object for a component used once. Add a Playwright fixture only for setup genuinely shared by multiple specs (such as authenticated state).
- Do not add Cucumber/Gherkin by default. Playwright specs are the executable source of truth. Add Gherkin only when non-engineering stakeholders maintain scenarios or the same scenario must drive multiple platforms.

Choose the cheapest automated proof that covers the change. Add or update an E2E test for a critical journey, real navigation, permissions, integration, or interaction across components. Test isolated logic, visual variants, and component states at the unit/component layer instead of manufacturing an E2E test for every small feature.

---

## Flow

1. Confirm Node is available: run `node --version`. If missing/not found, tell the user the harness scripts require Node and ask whether to install it now (don't install without a yes). If they agree, install with the OS-appropriate tool (winget/choco on Windows, `brew install node` on macOS, distro package manager or nvm on Linux), then re-check. If they decline, stop — the flow below can't run without Node.
2. **Relay check (cross-CLI handoff).** Run `node .claude/scripts/relay-up.cjs`.
   - `relay.json` missing or `enabled: false` → it prints one line and exits; the flow runs single-agent, as normal. Nothing else to do.
   - `enabled: true` → it starts the relay supervisor (detached) if it isn't already up and prints the rotation. From now on, if you stop mid-feature (see *Stopping mid-feature*) the supervisor launches the next CLI in the rotation to continue from your `handoff.md`.
   - `enabled: true` but the config is unusable → it exits non-zero and lists what's wrong. Fix `relay.json` (or set `enabled: false`) before continuing.
   - The user asked for the relay but `relay.json` is still `enabled: false` → run `node .claude/scripts/relay-detect.cjs`, then the interview in *Agent relay* (cloud/local/hybrid, backends, agents, route, fallback), write the config, then re-run this step.
3. Run `node .claude/scripts/check-remote.cjs`. Fetches remote refs, prints `CHANGED|...` or `UNCHANGED|...`, exits 0 (changed) or 1 (unchanged/error) — the orchestrator must select and build from the latest known state, not a stale local view. On `CHANGED`, tell the user the remote moved (commit count in `behind=`) and ask before pulling — never auto-pull over uncommitted work.
4. Run `node .claude/scripts/get-current.cjs`. Returns the `IN PROCESS` feature (resume) or the next pending one.
   - If it also prints a `HANDOFF|present|...` line: read `.claude/handoff.md` **first**. It's the previous agent's relay note — what it did this leg, the next concrete step, commands already run (don't redo them), landmines, and uncommitted files. It may have been written by a different CLI.
   - Resuming: also check `git status` / `git diff` for half-done work. The prior attempt's session context is gone; `handoff.md` plus half-written code are your only trace.
5. Read that feature file and `notes.md`.
6. Run `node .claude/scripts/start-feature.cjs <id>` before changing code.
7. Check `git status` / `git diff` for any pre-existing work in the tree (not just on resume) and preserve unrelated user changes — never fold them into this feature's commit.
8. **Dev** implements per the feature's `requirements`.
   - Reuse what `notes.md` says (e.g. existing components). Don't reinvent what exists.
   - `[frontend]` Read `endpoints.md` to call the API. Building/changing UI: read `DESIGN.md` and use its tokens + canonical components. Never hardcode colors/spacing or hand-roll a component that already exists.
   - `[backend]` Creating/changing an endpoint = update **route + `endpoints.md` + Bruno request as one unit**. If they drift, the tester validates a contract that no longer exists. For a new or broad API suite, run `/generate-api-test`; it uses `api-spec-reader` → `api-flow-connector` → `bruno-request-builder` → `bruno-test-engineer`.
9. **Dev** writes or updates automated coverage proving the feature's observable behavior before advancing.
   - `[frontend]` Apply *Playwright E2E architecture* above. Use Playwright through the real UI when the change affects a critical journey, navigation, permissions, integration, or cross-component interaction; cover the happy path and introduced failure/edge case. Otherwise use the appropriate unit/component test. Never duplicate component selectors in page objects or specs.
   - `[backend]` The updated/added Bruno request (previous bullet) **is** this feature's test — no separate test file needed.
   - `[testing]` The scenario/suite itself is the feature; this step is redundant with step 8.
10. **Tester** runs the repo's `node .claude/scripts/test.cjs`, reads exit code + log.
   - `[backend]` Old request fails: check the feature's `requirements`. Did it intentionally touch that endpoint? → contract changed, update the Bruno request (not a regression). Didn't touch it? → regression, fix the code.
   - Test fails → return the log to Dev, iterate. Don't advance. Fix the source code, not the assertion (unless the assertion is genuinely wrong — say so explicitly).
11. Run `node .claude/scripts/mark-ended.cjs <id>`. Re-runs the test, writes `ENDED` **only on exit code 0**. On failure it refuses. On success it also clears `.claude/handoff.md`.
12. Create one Git commit for the completed feature. Stage only the files belonging to it — never bundle in unrelated user changes caught in step 7. Concise message identifying the feature (id/slug).
13. Record that commit: `git rev-parse --short HEAD`, then `node .claude/scripts/set-commit.cjs <id> <hash>`. Writes the hash (and, if `origin` resolves to a known git host, its web URL) into `history.md` so `status.html` can link the feature to it.
14. After every feature or task in the current request is done (whether working a single feature or a whole goal), ask the user whether to push the new commits to the remote. Never push without explicit confirmation; keep commits local until then.

---

## Kanban

Board: Plane workspace `scouttech`, project Scouttech (SCOUT), label `repo:scouttech-ui`. Use the `kanban` skill (config in `.claude/kanban.json`, credentials profile `scouttech`). Move the card at every step; cards are assigned to the board user; never duplicate a card (look it up by `{id} {slug}`).

| Flow moment | Stage |
|---|---|
| Feature requested (`add-feature` discuss) | `idea` |
| Card refined + feature file written | `ready` |
| Step `start-feature.cjs` | `doing` |
| Dev finished, before tests | `testing` |
| Tests fail | `doing` (or `ready` if no agent available) |
| Tests OK + `mark-ended` + commit | `pre` |
| Push + tag pushed (user-confirmed) | `pro` |

`done` only when the user confirms an app consumes the release. A board failure never blocks the flow; report the stale card.

---

## Stopping mid-feature (relay handoff)

The harness is designed so a fresh agent — a new session, or a **different CLI** (Claude Code, Codex, Antigravity) — can pick up an unfinished feature. `history.md` already records which feature is `IN_PROCESS`; `handoff.md` carries the part that isn't in code yet.

If you stop while a feature is `IN_PROCESS` for **any** reason — running low on context/tokens, hitting a per-agent budget, being interrupted, or getting blocked — do this **before** you stop:

1. `node .claude/scripts/write-handoff.cjs <reason>` — `reason` is `near-limit` | `budget` | `manual` | `blocked` | `error`. This stamps the header of `.claude/handoff.md` (timestamp, your agent id from `HARNESS_AGENT`, the in-flight feature).
2. Fill every section in `.claude/handoff.md`: what you did this leg, the next concrete step, commands already run (so the next agent doesn't redo setup), landmines, and which files are touched but uncommitted.
3. Do **not** commit or `mark-ended` a half-done feature. Leave the working tree as-is; the note plus the diff are the handoff.

The next agent's step 4 (`get-current.cjs`) will surface the note and it reads `handoff.md` before touching anything. `mark-ended.cjs` deletes the note once the feature lands.

**When the relay is enabled** (step 2): the supervisor polls `handoff.md`. A reason of `near-limit`, `blocked`, `budget`, or `error` makes it launch another agent (per `route` / `rotation`) to resume this feature. `manual` does not trigger a relay — use it when you're stopping and a human will resume. So: approaching your own context/token limit → `write-handoff.cjs near-limit`, fill the note, stop. If you stopped because of a **quota / rate-limit / usage cap**, use `write-handoff.cjs blocked` and say so in the note — that is what triggers cloud→local fallback.

---

## Agent relay (cross-CLI + cloud/local, config)

Optional. Lets a stalled feature continue under another agent — a different CLI (Claude Code ↔ Codex ↔ Antigravity ↔ opencode) and/or a different **model backend** (cloud API ↔ local model via LM Studio / Ollama / any OpenAI-compatible endpoint) — with no human in the loop. Off unless `.claude/relay.json` has `enabled: true`.

Two independent axes:
- **Agent** = the CLI that drives the harness (runs the `.cjs` scripts, follows this file). Listed in `agents`.
- **Backend** = what that CLI talks to. `"cloud"` = the CLI's own login (claude, codex). A named entry in `backends` = a local runtime the supervisor can start and load models into.

`opencode` is the usual local driver: point it at a local endpoint via `agents.<name>.env`.

**How it runs:** step 2 (`relay-up.cjs`) starts `relay-supervisor.cjs` detached. Each poll (`poll_seconds`):
- `get-current` → `NONE` (backlog done) → supervisor stops.
- `handoff.md` shows a relay-triggering reason not yet serviced → pick the next agent (below), if its backend is local run `relay-backend.cjs up <backend> <model>` first (start server, load model, evict LRU models to stay under `vram_total_gb − vram_headroom_gb`), then launch it in a fresh terminal (launcher table) with a bootstrap prompt (`relay.prompt.txt`) to resume from `handoff.md`.
- Launched agent makes no commit and doesn't touch `handoff.md` for `budget_minutes` → assumed dead; supervisor stamps an `error` handoff and advances.
- No commit across a full rotation/chain lap → `on_all_exhausted`: `wait` sleeps `reset_wait_minutes` then retries; `stop` halts for a human.

**Which agent next** — per-feature *phase* decides the chain:
- phase = `bugfix` if the feature file's `type: change`, else `implementation` (`planning` isn't auto-detected in the build loop).
- `route.<phase>.chain` is the ordered agent list to try for that feature; the supervisor walks it as legs relay. No `route` entry → falls back to `rotation`.
- **Fallback filters** applied while walking the chain:
  - `fallback.cloud_exhausted: "advance-to-local"` + a `blocked` handoff whose note mentions quota/rate-limit (or the same in `relay.log`) → skip cloud agents for the rest of the session.
  - `fallback.local_unstable: { after_failures: N, action }` → after N capability failures (`blocked`/`error`/budget-timeout) by local agents on this feature, skip local agents (`advance-to-cloud`) or `stop`.
  - `route.<phase>.fallback_on: "test-fail"` — documents that this chain's ordering exists to escalate on capability failure; the walk already advances on every trigger.
- Leaving a local agent for a cloud one with `fallback.free_vram_on_leave_local: true` → `relay-backend.cjs down <backend>` unloads its models.

Control manually: `relay-supervisor.cjs status | stop`, `relay-backend.cjs status|up|swap|down <backend> [model]`, `relay-config.cjs [--validate|--launcher]`, `relay-detect.cjs`. Runtime files: `relay.state`, `relay.log`, `relay.prompt.txt`, `relay.launch.*`.

**Launcher resolution** (`launcher: "auto"`, or force one): `$TMUX` set → tmux new-window; Windows + `wt` → Windows Terminal tab; Windows without `wt` → new `cmd` console; macOS + iTerm → iTerm; macOS → Terminal.app; Linux → `gnome-terminal`/`konsole`/`xfce4-terminal`/`xterm` (first found); otherwise → `headless` (output to `relay.log`).

**`relay.json` schema:**

```jsonc
{
  "enabled": true,
  "launcher": "auto",           // auto | wt | tmux | headless | iterm | apple-terminal | gnome-terminal | konsole | xfce4-terminal | xterm | win-console
  "poll_seconds": 30,
  "budget_minutes": 40,         // per-leg no-progress timeout
  "on_all_exhausted": "wait",   // wait (sleep reset_wait_minutes) | stop
  "reset_wait_minutes": 60,
  "mode": "hybrid",             // cloud | local | hybrid  (interview hint; behaviour follows per-agent `backend`)

  "backends": {
    "lmstudio": { "kind": "lmstudio", "url": "http://127.0.0.1:1234/v1",
                  "server_start": ["lms","server","start"], "gpu": "max",
                  "vram_total_gb": 16, "vram_headroom_gb": 1.5, "context_length": 16384 },
    "ollama":   { "kind": "ollama", "url": "http://127.0.0.1:11434",
                  "server_start": ["ollama","serve"], "vram_total_gb": 16 },
    "remote":   { "kind": "openai-endpoint", "url": "http://gpu-box.lan:8000/v1" }  // externally managed: health-check only
  },

  "agents": {
    "claude-code":    { "cmd": "claude",   "fresh": ["{prompt}"],          "backend": "cloud" },
    "codex":          { "cmd": "codex",    "fresh": ["exec","{prompt}"],   "backend": "cloud" },
    "opencode-local": { "cmd": "opencode", "fresh": ["run","{prompt}"],
                        "backend": "lmstudio", "model": "lmstudio-community/qwen3-coder-30b-a3b-instruct",
                        "env": { "OPENAI_BASE_URL": "http://127.0.0.1:1234/v1", "OPENAI_API_KEY": "lm-studio" } }
  },

  "rotation": ["claude-code", "codex"],          // fallback when no route matches

  "route": {
    "implementation": { "chain": ["opencode-local", "claude-code"], "fallback_on": "test-fail" },
    "bugfix":         { "chain": ["claude-code", "codex"] }
  },

  "fallback": {
    "cloud_exhausted": "advance-to-local",        // advance-to-local | wait | stop
    "local_unstable": { "after_failures": 3, "action": "advance-to-cloud" },  // action: advance-to-cloud | stop
    "free_vram_on_leave_local": true
  }
}
```

Rules: `agents.<name>.cmd` on PATH; `fresh` argv contains `{prompt}` (replaced with a one-line "read relay.prompt.txt"); `agents.<name>.env` is extra environment for that launch (base URL + key for a local endpoint); an agent on a `lmstudio`/`ollama` backend needs a `model`; `backends.<name>` of those kinds need the CLI (`lms` / `ollama`) on PATH. `relay-config.cjs --validate` checks all of it.

**Interview (run once — when the user wants the relay and `relay.json` is still `enabled: false`):**
1. Run `node .claude/scripts/relay-detect.cjs` — reports installed agent CLIs, local runtimes + their models, GPU VRAM, cloud availability.
2. **Cloud, local, or hybrid?** (`mode`)
3. **Backends** — for each local runtime to use: kind (`lmstudio`/`ollama`/`openai-endpoint`), URL, `server_start`, and for a GPU runtime `vram_total_gb` + `vram_headroom_gb` (from the detect report).
4. **Agents** — which CLIs; exact non-interactive launch argv for each (`claude "<prompt>"`, `codex exec "<prompt>"`, `opencode run "<prompt>"` — confirm); for each local agent its `backend`, `model` (an exact key from the detect report), and `env` (base URL + key).
5. **Route** — for `implementation` and `bugfix`, the ordered `chain` of agents to try. (e.g. local model first, cloud as the escalation.)
6. **Fallback** — `cloud_exhausted` action; `local_unstable.after_failures` + action; `free_vram_on_leave_local`.
7. `budget_minutes`, `poll_seconds`, `on_all_exhausted`, `launcher` (`auto` recommended).

Write the answers into `.claude/relay.json`, set `enabled: true`, run `relay-config.cjs --validate`, then re-run step 2. Each CLI still exports `HARNESS_AGENT=<its agent name>` (the launch wrapper does this) so `handoff.md` records who wrote each leg.

---

## Context budget (ScoutTech-wide rule: ~200k tokens)

Sessions get much more expensive once the conversation passes ~200k tokens of context. This applies to **every** ScoutTech project (api, frontends, tools). Keep each conversation under that line:

- **Check before starting anything big.** After each feature lands (`ENDED`, committed, commit recorded) check how much context this conversation uses (`/context`, or the status line). Also check before starting a feature and while implementing a long one.
- **Threshold.** If usage is at or above ~150k, or the next feature would plausibly push the conversation past ~200k (large UI + tests + several long file reads), **do not start it here**. Prefer finishing the current feature cleanly over stopping half-way.
- **Hand over to a fresh conversation** instead of continuing:
  1. Get to a clean boundary: current feature `ENDED` + committed (or, if truly mid-feature, leave the tree as is).
  2. `node .claude/scripts/write-handoff.cjs near-limit` and fill `.claude/handoff.md` (what's done, the next concrete step: "run the Flow from step 3; `get-current.cjs` returns the next PENDING feature", landmines). `history.md` + `notes.md` remain the source of truth.
  3. **Do not open other terminals or launch other `claude` processes** (no external terminal windows, no relay auto-launch, no `--dangerously-skip-permissions` sessions). The agent cannot run `/clear` itself — it is a user command.
  4. Tell the user in one short line: "Contexto cerca de 200k: haz `/clear` y escribe 'continúa'." Then stop; the next conversation resumes from `handoff.md` + `history.md`.
- **Never** push through a feature "just because it is almost done" when the next one won't fit; the handover is cheap, a 200k+ conversation is not.
- Prefer cheap context habits: read only the files a feature touches, avoid dumping long logs (pipe test output through `grep`/`tail`), and keep scratch scripts outside the repo.

## Hard rules

- **Never** mark `ENDED` by hand or "because it looks fine." Only via `mark-ended.cjs`, which verifies first — and that verification includes the automated test suite, not just build/lint.
- `[frontend]` A feature isn't done without passing automated coverage proving its observable behavior. Playwright is required for changed critical journeys and UI integrations; unit/component coverage is valid for isolated behavior.
- Ownership: **state** lives in `history.md` (scripts write it). Feature **content** in its file. **Current system state** in the code.
- Feature files are **immutable**; they describe intent at their moment, not the present. To change shipped work (e.g. add OAuth to an existing login), **create a new feature**; don't edit the old one. Leave a breadcrumb in the new feature's `requirements` ("extends/replaces feature N").
- Don't reread the whole project to orient: use the tree, `notes.md`, and open only the files the feature touches.
- One commit per `ENDED` feature, scoped to that feature's files only. Commits stay local until the user explicitly confirms a push.
- Never stop on an `IN_PROCESS` feature without writing `handoff.md` (see *Stopping mid-feature*). A stale or missing note forces the next agent to reverse-engineer your half-done work from the diff alone.

---

## Model routing

When the CLI lets you pick a model or delegate to a sub-agent, split by role, not by CLI:

- **Feature definition and planning** (turning approved requirements into a precise, testable plan): the most capable model available (Claude: Opus; Codex: its top-tier model).
- **Implementation and routine testing** (writing the approved code, E2E coverage, running the normal test loop): the fastest/cheapest capable model (Claude: Haiku; Codex: its lightweight model).
- **Bugs, corrections, refactors** (fixing shipped work, judgment-heavy changes): the balanced mid-tier model (Claude: Sonnet; Codex: its mid-tier model).

Never use routing to skip the feature cycle: requirements still need approval before a `PENDING` feature starts, and `mark-ended.cjs` stays the completion gate regardless of which model did the work. If the CLI exposes no model selection, follow the same role split with whatever single model is available.

**With the relay enabled**, this same split is also expressed *across* agents: `route.<phase>.chain` in `relay.json` orders which agent (hence which CLI + model, cloud or local) takes a feature of that phase, and `fallback` escalates local→cloud on repeated failure or cloud→local on quota exhaustion. In-session model picking (above) and the relay's cross-agent routing are complementary — the relay only acts when a leg stops; within a leg you still pick your own model by role.

---

## Scripts

All under `.claude/scripts/`, run as `node .claude/scripts/<name>.cjs [args]` (Node required — see Flow step 1).

- `check-remote.cjs` — `git fetch --prune`, reports `CHANGED`/`UNCHANGED` vs upstream. Exit 0=changed, 1=unchanged/error.
- `get-current.cjs` — `IN_PROCESS` feature, else next `PENDING`. Prints a second `HANDOFF|present|...` line when `.claude/handoff.md` holds an unconsumed relay note.
- `write-handoff.cjs <reason>` — Stamps `.claude/handoff.md`'s header for a relay handoff (`reason`: `near-limit`|`budget`|`manual`|`blocked`|`error`). You fill the body sections. Run before stopping on an `IN_PROCESS` feature.
- `start-feature.cjs <id>` — Marks a feature `IN_PROCESS`.
- `set-state.cjs <id> <state>` — Engine: rewrites a feature's state (also used for `TESTING`).
- `test.cjs` — Runs the repo test (build+typecheck+lint+E2E for frontend, Bruno for backend). Exit 0 = pass.
- `mark-ended.cjs <id>` — Runs `test.cjs`; marks `ENDED` only on pass. Deletes `.claude/handoff.md` on success (nothing in flight).
- `set-commit.cjs <id> <hash>` — Records a feature's commit hash (+ web URL from `origin`, if resolvable) into `history.md`.
- `add-note.cjs "text"` — Appends to `notes.md`.
- `tree.cjs` — Regenerates the project file tree.
- `relay-up.cjs` — Flow step 2. Starts the relay supervisor (detached) if `relay.json` is `enabled` and it isn't already running. No-op when relay is off.
- `relay-supervisor.cjs start|status|stop|tick` — The relay loop (normally started by `relay-up.cjs`, not by hand). `status` / `stop` to inspect or halt it; `tick --dry` shows the next decision without launching.
- `relay-detect.cjs [--json]` — Scan this machine for agent CLIs, local runtimes + models, GPU VRAM, cloud availability. Feeds the relay interview.
- `relay-config.cjs [--validate|--launcher]` — Inspect / validate `relay.json`; `--launcher` prints what `auto` resolves to here.
- `relay-backend.cjs up|swap|down|status <backend> [model]` — Bring a local model backend's server up, load/unload models, keep VRAM under budget (LRU). Called by the supervisor before launching a local agent; also usable by hand.
- `_lib.cjs`, `relay-lib.cjs` — Shared helpers (not run directly).
- `status.html` — Not a script; open (via a local http server) to watch `history.md` + feature content live.

## Branches, versions and releases

This repo is a **library**, not a deployed app: no Dokploy, no PRE/PRO environments.

- Work and commit on `main`.
- Distribution is a git dependency pinned to a tag: `"scouttech-ui": "github:hectorrdez/scouttech-ui#vX.Y.Z"`. No npm registry.
- Semver. Every release = bump `package.json` `version` + `CHANGELOG.md` entry + annotated tag `vX.Y.Z`. Push and tag only with explicit user confirmation.
- Consumer apps never patch a local copy: a change an app needs becomes a new feature here and a new `v0.x.y` tag.
- Kanban: `pre` stage = committed on `main` (tests green); `pro` stage = pushed + tag pushed; `done` = user confirms an app consumes the tag.

## Library rules

- Every new or changed exported component must be added to `demo/App.tsx` with all its variants, sizes and states (disabled, loading, hint/error, focus). Run it locally with `npm run demo` (no deploy).
