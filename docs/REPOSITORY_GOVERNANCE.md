# Repository Governance

## Canonical branch

`main` is the canonical integration branch. New work starts from current `main` and returns through pull requests.

## Branch lifecycle

1. Create a focused branch from current `main`.
2. Open a pull request targeting `main`.
3. Keep the pull request draft while incomplete.
4. Run all required frontend and backend checks.
5. Resolve review conversations.
6. Merge using the method appropriate to the change.
7. Archive or remove merged branches after confirming no unique work remains.

Do not reuse old merged branches for new work.

## Recommended repository settings

Set `main` as the repository default branch.

Protect `main` with a GitHub ruleset or branch protection rule requiring:

- changes through pull requests;
- successful Frontend and Backend CI jobs;
- resolved review conversations;
- blocked force pushes;
- blocked branch deletion.

For a single-maintainer repository, required approving reviews may remain optional initially, while pull-request and CI requirements stay enabled.

## Merge strategy

- Use merge commits for large feature histories, coordinated migrations, and repository consolidation.
- Use squash merge for small maintenance, documentation, and isolated fixes when one logical commit improves history.
- Avoid rewriting accepted shared history.

## Release strategy

Release only from `main`.

1. Create `release/<version>` from `main` only when stabilization is required.
2. Apply release-only fixes through pull requests.
3. Merge the release branch back into `main`.
4. Create a version tag from the accepted `main` commit.
5. Publish release notes containing migrations, deployment steps, breaking changes, and rollback instructions.

## Generated artifacts

Generated browser reports, traces, coverage output, build output, dependency directories, and temporary deployment bundles must not be committed. Store CI diagnostics as GitHub Actions artifacts instead.

Tracked historical generated artifacts should be removed in a dedicated cleanup pull request so source changes and repository-size cleanup remain reviewable.

## Next active branch

After governance is merged, continue frontend architecture work from:

```text
refactor/workspace-route-layout
```

That branch should move protected pages under a shared App Router workspace layout and remove repeated page-level shell and auth wrappers without changing public URLs or backend behavior.
