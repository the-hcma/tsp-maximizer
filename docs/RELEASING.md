# Releasing tsp-maximizer

`@the-hcma/tsp-maximizer` uses [Release Please](https://github.com/googleapis/release-please-action) for versioning, changelog generation, and npm publishing.

## Merge strategy (avoid duplicate changelog lines)

Release Please walks **every** commit on `main` since the last tag. If a PR is merged with **Create a merge commit**, GitHub records both the branch commit (e.g. `fix(scope): …`) and a merge commit whose body repeats that line. Release Please treats them as two changes, so the release PR lists the same item twice in **`CHANGELOG.md` and the PR description** ([upstream discussion](https://github.com/googleapis/release-please/issues/2476)).

This repository allows **squash merge only** (merge commits and rebase merges are disabled in GitHub settings). Squash uses the PR title as the commit subject and an empty squash body (`squash_merge_commit_message: BLANK`), which matches the assert step in `.github/workflows/release-please.yml`.

The Graphite merge queue on `main` must use **squash** as its merge strategy (not merge commits).

## Contributor flow

1. Land changes on `main` with [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, …).
2. Release Please opens or updates a **release PR** that bumps `package.json` and `CHANGELOG.md`.
3. Merge the release PR. GitHub creates a version tag and the publish workflow runs on npm.
