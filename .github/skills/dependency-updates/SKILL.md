---
name: dependency-updates
description: 'Use when updating npm dependencies, WXT, TypeScript, GitHub Actions, Dependabot configuration, security advisories, or release tooling in Cookie Guard. Keeps versions current through reviewable automated pull requests and focused validation.'
---

# Dependency Updates

## Procedure
1. Inspect Dependabot pull requests and release notes for breaking changes.
2. Update one compatibility group at a time. Never use forced audit fixes without reviewing the resulting lockfile and changelog.
3. Run `npm ci` followed by `npm run check`.
4. Verify both Chrome and Firefox build outputs; also run `npm run build:safari` when changing WXT or manifest configuration.
5. Keep package and lockfile in sync. Record only user-visible or migration-relevant version changes in release notes.

## Automation
`.github/dependabot.yml` opens weekly npm and GitHub Actions pull requests. `.github/workflows/verify.yml` validates every update before merge.