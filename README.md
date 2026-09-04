# Cookie Guard

A local-first WebExtension that removes cookies, periodically repeats the cleanup, and conservatively clicks explicit rejection controls on supported consent dialogs. It stores only its settings and counters in the browser.

## What version 0.1.0 does

- Deletes non-whitelisted cookies on install, browser start, and every 30 minutes.
- Provides a per-site allowlist from the popup.
- Rejects visible consent dialogs only when an explicit reject/decline button is found inside a known CMP or modal dialog. It never clicks accept controls.
- Builds from one TypeScript codebase for Chrome, Firefox, and Safari Web Extension packaging.

## Limits

The browser `cookies` API can list and remove cookies but does not offer a portable way for a Manifest V3 extension to prevent every `Set-Cookie` response. Chrome's Manifest V3 restrictions mean response-header interception is unavailable. Deletion is therefore immediate at the scheduled cleanup boundary, rather than a network-level block. Third-party-cookie policy remains browser-controlled.

Cookie consent banners are not standardized. The content script intentionally does nothing when it cannot find an explicit reject action in a scoped dialog, rather than risk breaking a page.

## Development

```sh
npm install
npm run check
npm run dev
```

Load `.output/chrome-mv3` as an unpacked extension in Chrome. For Firefox development, run `npm run dev:firefox`.

## Packages

```sh
npm run zip
npm run zip:firefox
npm run build:safari
```

Safari distribution requires macOS and Xcode. Build the Safari target, then package `.output/safari-mv3` with `xcrun safari-web-extension-packager` and distribute the containing app through Apple tooling.

## Existing Tools

This project occupies an existing problem space. Cookie AutoDelete provides mature cleanup for Chrome/Firefox but has an older release cadence and no Safari support. Consent-O-Matic is the established open-source consent resolver, supporting more than 200 CMPs across Chrome, Firefox, and Safari. Cookie Guard is useful only as a small, transparent experiment that combines cleanup with a conservative local rejection policy; it should not claim better CMP coverage than Consent-O-Matic.

## Updates

Dependabot opens weekly dependency and GitHub Actions update pull requests. Every pull request runs TypeScript compilation plus Chrome and Firefox builds in GitHub Actions.