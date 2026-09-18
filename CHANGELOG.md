# Change Log

All notable changes to the "blade-color" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-09-18

### Added
- Continuous integration: manifest/theme validation and extension packaging on
  every push and pull request.
- Marketplace publishing workflow on version tags (see `RELEASING.md`).

### Changed
- Add a `license` field to the manifest.
- Exclude dev-only assets (`.github`, `scripts`, `package-lock.json`,
  `node_modules`) and the 1.4 MB `screenshot.gif` (loaded from GitHub by the
  README) from the published extension.

## [0.1.3] - 2021-03-20

- Initial release.
