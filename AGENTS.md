# AGENTS.md — Ground Rules for tsp-maximizer

This file defines the non-negotiable standards for all contributors (human or AI) working on this codebase. Every change must comply with these rules before it is considered complete.

---

## Session Startup & Cleanup

- **Mandatory Action**: At the beginning of every session (before starting any task), run `/a_star/home/hcma/work/ai/repository-helpers/scripts/dev/start-development`.
- This script cleans up merged worktrees, prunes stale metadata, and runs `gt sync --force` to keep your local environment synchronized with the remote.
- By default it prompts for a new stack name and creates a new worktree under `.worktrees/<stack-name>-wt` ready for work.
- Pass `--resume` to instead pick up an existing in-progress worktree: it lists pending worktrees and lets you select one (or creates a new one if none exist).
- Pass `--refresh` to pull latest main and ensure the systemd service is installed and running, then exit.

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

> See [GRAPHITE.md](./GRAPHITE.md) for the full Graphite workflow reference (branch naming, stack creation, navigation, submission, troubleshooting, and advanced rebasing).

- This project uses **Graphite** (`gt`) for branch stacking.
- **Worktree-per-Stack**: Every new stack/PR must be created in its own Git worktree to ensure isolation. Use `/a_star/home/hcma/work/ai/repository-helpers/scripts/dev/start-development` — it handles worktree creation and Graphite tracking automatically.
- All work is done in stacked branches via `gt create`, `gt modify`, and `gt submit`.
- Never work directly on `main`. Always create a stack branch: `gt create -m "feat: description"`.
- Keep each branch in the stack focused on exactly one logical change. Stacks should map 1-to-1 with milestones or sub-tasks from [plan.md](./plan.md).
- Sync regularly: `gt sync` before starting new work; `gt restack` after upstream changes land.
- Submit stacks with `gt submit --no-interactive` — do not open PRs manually via the GitHub UI.
- After submitting, always mark PRs as ready for review: `gh pr ready <number>`. `gt submit --no-interactive` creates drafts by default.
- To merge a PR, add the `merge-it` label: `gh pr edit <number> --add-label merge-it`. Never use `gh pr merge` directly.
- **Always ask the user for confirmation before adding the `merge-it` label.** Adding it triggers an automated merge; it must not be applied without explicit user approval.
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

---

## Dependencies

- Prefer well-maintained, typed packages. Avoid packages with no TypeScript types and no `@types/*` available.
- Do not add a dependency for something trivially implementable in ~10 lines of TypeScript.
- Separate `dependencies` (runtime) from `devDependencies` strictly.
- Lock file (`pnpm-lock.yaml`) must always be committed.

---

## CI Checks (all must pass)

```
pnpm run check    # tsc -b && eslint .
pnpm run format:check  # prettier --check src/
pnpm test         # vitest run --coverage
```

No PR may be merged with a failing CI check. No exceptions.
