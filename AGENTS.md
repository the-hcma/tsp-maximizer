# AGENTS.md — Ground Rules for tsp-maximizer

This file defines the non-negotiable standards for all contributors (human or AI) working on this codebase. Every change must comply with these rules before it is considered complete.

---

## Session Startup & Cleanup

- At the **start of every agent session**, before acting from assumed conventions, read this `AGENTS.md` in full, then read every `alwaysApply: true` rule under `.agents/rules/*.md` (plus any whose `globs` match files you will touch) — `AGENTS.md` and `.agents/rules/` together are the contract (`.cursor/rules/*.mdc` are Cursor injection shims only). `CLAUDE.md` (a `@AGENTS.md` import), `.github/copilot-instructions.md` and `.github/instructions/agents-rules.instructions.md` are thin shims so Claude Code and Copilot reach the same guidance.
- Markdown files you commit, this one included, use one physical line per paragraph, list item and blockquote, with no hard line breaks (see `.agents/rules/github-content-formatting.md`).
- **Mandatory Action**: At the beginning of every session (before starting any task), run `/a_star/home/hcma/work/ai/repository-helpers/scripts/dev/start-development`.
- This script cleans up merged worktrees, prunes stale metadata, and runs `gh stack sync` to keep your local environment synchronized with the remote.
- By default it prompts for a new stack name and creates a new worktree under `.worktrees/<stack-name>-wt` ready for work.
- Pass `--resume` to instead pick up an existing in-progress worktree: it lists pending worktrees and lets you select one (or creates a new one if none exist).
- Pass `--refresh` to pull latest main and ensure the systemd service is installed and running, then exit.
- After `start-development` finishes, **`cd` into the stack worktree** (`.worktrees/<stack-name>-wt`) before any other work. Do not stay in the primary clone.

### Main worktree is off-limits (agents)

The **primary clone** (repo root — first entry in `git worktree list`, usually on branch `main`) is the **main worktree**. Treat it as **read-only** unless the user explicitly authorizes touching it in the current conversation.

**Never on the main worktree** (without explicit user authorization):

- Edit, create, or delete source files, config, or lockfiles
- Run `pnpm install`, `pnpm test`, `pnpm run check`, builds, or formatters
- Run `dep-updater` with `--dir` pointing at the primary clone (it may fast-forward `main` and mutate git state)
- Run `gh stack init`, `gh stack add`, `gh stack submit`, `gh stack sync`, `gh stack rebase`, or other stack/git write operations
- Leave uncommitted changes, stray branches, or detached HEAD state

**Always** do implementation, investigation that mutates state, and validation in a **stack worktree** under `.worktrees/<stack-name>-wt`. Pass that path to tools (`--dir`, `cd`, etc.).

`start-development` may update the main worktree for environment sync only; that is not permission to work there. If you need to inspect `main` without changing it, use read-only commands (`git log`, `git show`, `gh pr view`) or a **detached temporary worktree** — not the primary clone.

---

## Language & Runtime

- TypeScript **strict mode** is always on — `"strict": true` in `tsconfig.app.json`, no exceptions.
- This is a purely browser-targeted application (React + Vite). All source files compile under `tsconfig.app.json`. The Vite config compiles under `tsconfig.node.json`. Never mix browser and Node globals in the same compilation unit.
- All source files use `.ts` or `.tsx` extension. No `.js` files in `src/`.

---

## Formatting

- **Prettier** is the single source of truth for formatting. No manual style debates.
- Configuration is in `.prettierrc` at the repo root. Do not override it inline.
- Required settings:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2,
    "arrowParens": "always"
  }
  ```
- Run `pnpm run format` before committing. A CI check will fail on unformatted files.
- Do not suppress Prettier with `// prettier-ignore` unless the block is machine-generated (e.g. an embedded binary blob).

---

## Linting

- **ESLint** with the TypeScript plugin is mandatory. Config lives in `eslint.config.js` (flat config).
- Required rule sets:
  - `eslint:recommended`
  - `plugin:@typescript-eslint/strict-type-checked`
  - `plugin:@typescript-eslint/stylistic-type-checked`
  - `eslint-plugin-react-hooks` (recommended)
  - `eslint-plugin-react-refresh` (vite)
- Rules that are **errors** (never warnings):
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/no-unsafe-assignment`
  - `@typescript-eslint/no-unsafe-call`
  - `@typescript-eslint/no-unsafe-member-access`
  - `@typescript-eslint/no-unsafe-return`
  - `@typescript-eslint/no-floating-promises`
  - `@typescript-eslint/await-thenable`
  - `@typescript-eslint/no-unused-vars`
  - `no-console`
- Run `pnpm run lint` and resolve all errors before opening a PR. Do not use `eslint-disable` comments unless absolutely unavoidable, and every suppression must include a comment explaining why.

---

## Testing

- **Vitest** is the test framework. All tests live co-located as `*.test.ts` or `*.test.tsx`.
- **Coverage threshold** (enforced in CI): lines ≥ 80%, branches ≥ 73%, functions ≥ 80%.
- Every public function in `src/` must have at least one unit test.
- Tests must be **deterministic**: no `Math.random()`, no un-mocked `Date.now()`.
- Fixed-delay sleeps in tests are prohibited (e.g. `setTimeout(50)`, `await new Promise((r) => setTimeout(r, n))`) because they are a flake smell. Use condition-based synchronization (`vi.waitFor`, explicit events, observable state transitions) instead.
- Test file naming: `<module>.test.ts` mirrors the source file it covers.
- Each test must have a descriptive name that reads as a sentence: `it('returns zero remaining periods when all pay periods are exhausted', ...)`.
- Do not write tests that only assert that a mock was called — assert the observable output or side effect.

---

## Repository

- Remote: `https://github.com/the-hcma/tsp-maximizer` (public).
- Never commit secrets, credentials, or API keys — use environment variables.

---

## Commits, Stacking & Pull Requests

> See [`.agents/skills/gh-stack/SKILL.md`](https://github.com/the-hcma/repository-helpers/blob/main/.agents/skills/gh-stack/SKILL.md) in repository-helpers for the full stacking workflow, and `.agents/rules/stacking-tool.md` for the marker contract.

- This project stacks branches with **GitHub Stacked PRs** (`gh stack`), as declared in `.github/stacking-tool`.
- **Worktree-per-Stack**: Every new stack/PR must be created in its own Git worktree to ensure isolation. Use `/a_star/home/hcma/work/ai/repository-helpers/scripts/dev/start-development` — it handles worktree creation and stack setup automatically.
- All work is done in stacked branches via `gh stack init` / `gh stack add`, and submitted with `scripts/dev/submit-stack` (or `gh stack submit --auto --open --remote origin`).
- Never work directly on `main`. Always create a stack branch with `gh stack init <stack>/<topic>`.
- Keep each branch in the stack focused on exactly one logical change. Stacks should map 1-to-1 with milestones or sub-tasks from [plan.md](./plan.md).
- Sync regularly via `start-development` (or `gh stack sync` / `gh stack rebase` from a **stack worktree**, never as ad-hoc writes on the main worktree).
- Submit stacks with `scripts/dev/submit-stack` — do not open PRs manually via the GitHub UI. Submitted PRs are published, not drafts.
- Merge only after the user explicitly confirms, and only with `${REPOSITORY_HELPERS_DIR:-$HOME/work/ai/repository-helpers}/scripts/dev/merge-stack --pr <n>` from the PR's worktree: it picks the right command for the repository's merge setup (`gh stack merge` for a stacked PR, the merge queue or auto-merge otherwise) and confirms the enqueue. For a PR in a gh stack it lands the top PR and every open PR below it, so name those PRs and get confirmation for the whole stack first. Do not call `gh pr merge` or `gh stack merge` by hand, do not add the `merge-it` label, and do not pipe the command through `tail` or `head`: read its exit status and output.
- Follow **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- **All commits must be GPG-signed.** Ensure `commit.gpgsign = true` is set in git config and the signing key is uploaded to GitHub (Settings → SSH and GPG keys) so commits show as "Verified".
- Each commit must pass `pnpm run check` (type-check + lint) and `pnpm test`.
- Keep commits focused. One logical change per commit.
- PR descriptions must reference the relevant milestone from [plan.md](./plan.md).
- Before starting a new PR or branch, confirm the current PR is either merged or that all CI checks pass (lint, format, tests, coverage). Never start new work on a broken base.

---

## Shell Scripts

- **No `.sh` extension.** Shell scripts in `scripts/` have no file extension (e.g. `scripts/build`, not `scripts/build.sh`). The shebang line declares the interpreter.
- **`shellcheck`** is mandatory for all shell scripts. CI runs `shellcheck` against all extension-less files in `scripts/` on every push (relying on the no-extension convention to identify shell scripts).
- **`readonly`** must be used for every script-level variable that is assigned once and never modified. Declare and assign separately to avoid masking exit codes (SC2155):
  ```bash
  var="$(some_command)"
  readonly var
  ```
- **Non-exported variables must be lowercase.** Uppercase is reserved for exported environment variables (`export FOO=bar`). Script-level constants, loop variables, and function locals all use `snake_case`.
- **Use `local` for all function-scoped variables.** For parameters or literal assignments that won't change, prefer `local -r`:
  ```bash
  my_func() {
    local -r mode="${1:-default}"   # parameter — safe to combine
    local result                    # command substitution — declare separately
    result=$(some_command)          # assign after to preserve exit code
  }
  ```
- Do not use `local -r var=$(cmd)` — shellcheck SC2155 flags it because `local` masks the command's exit code.

---

## Security

- Never embed real financial data (account numbers, SSNs, actual contribution amounts) in source code or tests — use placeholder/example values only.
- No dynamic `eval`, `new Function`, or `innerHTML` assignments with user-controlled strings.
- All user inputs must be validated and sanitised before use in computations (reject NaN, Infinity, and out-of-range values at the boundary).
- Dependencies must be reviewed before adding. Run `pnpm audit` after every `pnpm install`.
- **Remote timeouts and bounded retries:** `.cursor/rules/remote-timeouts-retries.mdc` (`alwaysApply`, org rule — template sync [repository-helpers#570](https://github.com/the-hcma/repository-helpers/issues/570)). This repo does no network I/O today; the rule is a forward guardrail for the first `fetch()` / HTTP client added — explicit timeout, bounded/backed-off transient-only retries, no re-send of non-idempotent writes.

---

## Dependencies

- Prefer well-maintained, typed packages. Avoid packages with no TypeScript types and no `@types/*` available.
- Do not add a dependency for something trivially implementable in ~10 lines of TypeScript.
- Separate `dependencies` (runtime) from `devDependencies` strictly.
- Lock file (`pnpm-lock.yaml`) must always be committed.

---

## Dependency release age (dep-updater 9 days, Dependabot 10 days)

New dependency versions are adopted on a staggered schedule so **dep-updater** (repository-helpers) lands updates before Dependabot (see [repository-helpers](https://github.com/the-hcma/repository-helpers) `AGENTS.md`).

| Layer | Mechanism |
|-------|-----------|
| **pnpm** | `minimumReleaseAge: 12960` (9 days) in `pnpm-workspace.yaml`. `minimumReleaseAgeExclude: ["*"]` grandfathers the **existing lockfile at cutover** so CI keeps working. |
| **dep-updater** | 9-day gate for npm, Python/PyPI, and GitHub Actions bumps. |
| **Dependabot** | Weekly scan + `cooldown: default-days: 10` on **version-update** PRs in `.github/dependabot.yml` (one day after dep-updater). Do **not** set `open-pull-requests-limit: 0` — version updates stay enabled as a backup. |

### Dependabot: version bumps vs security

- **Version updates** — Dependabot checks on the weekly schedule; each proposed bump must pass the **10-day cooldown** (release age). dep-updater usually lands the same bump first (9-day gate); Dependabot version PRs after that are redundant and can be closed.
- **Security updates** — **not** subject to the version-update cooldown. Dependabot may open a security PR as soon as GitHub has an alert and a fix; merge these promptly.
- **dep-updater CVE bypass** — when `npm audit` or `pip-audit` reports CVE IDs with an available fix, dep-updater skips the 9-day gate for that package only (`--security-only` mode is available).

**Day-to-day:** merge dep-updater batch PRs for routine bumps; close duplicate Dependabot version PRs when dep-updater already has the change. Re-run `scripts/grandfather-pnpm-release-age --wildcard` only if `pnpm-workspace.yaml` was lost after a major lockfile reset.

---

## CI Checks (all must pass)

```
pnpm run check    # tsc -b && eslint .
pnpm run format:check  # prettier --check src/
pnpm test         # vitest run --coverage
```

No PR may be merged with a failing CI check. No exceptions.
