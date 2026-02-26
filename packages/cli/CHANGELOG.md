# Changelog

## [0.6.1](https://github.com/educlopez/codevator/compare/v0.6.0...v0.6.1) (2026-02-26)


### Bug Fixes

* prevent duplicate player processes with atomic lock file ([9f2e640](https://github.com/educlopez/codevator/commit/9f2e640be91cab9043efada110dee6aa35ffe5cb))

# [0.6.0](https://github.com/educlopez/codevator/compare/v0.5.0...v0.6.0) (2026-02-25)


### Bug Fixes

* add fetch timeout and manifest validation in registry ([dcf70d8](https://github.com/educlopez/codevator/commit/dcf70d8bb9b4bec2291ce7cf1844a71d98e0adff))
* address PR review feedback ([39c0cba](https://github.com/educlopez/codevator/commit/39c0cba4b31629300bf0f43c38c39ad95fa5e3da)), closes [#get-started](https://github.com/educlopez/codevator/issues/get-started) [#get-started](https://github.com/educlopez/codevator/issues/get-started)
* bundle elevator.mp3 instead of typewriter as default fallback ([3014e43](https://github.com/educlopez/codevator/commit/3014e430258929099f24a1bddc3bad5c07a2932c))
* harden registry validation and path traversal guards ([1e0c0f8](https://github.com/educlopez/codevator/commit/1e0c0f842057f37b0eb1c6d8a0dce5478c8f2a3f))
* skip redundant download when elevator.mp3 is already bundled ([23d03f7](https://github.com/educlopez/codevator/commit/23d03f7c1256c0ed4c904e1d891a9bbffa560d2d))


### Features

* sound registry, custom sounds, and new web pages ([02cc01c](https://github.com/educlopez/codevator/commit/02cc01cf6fde481ef45a78fc38b9cf35f9fc06f0))

# [0.5.0](https://github.com/educlopez/codevator/compare/v0.4.1...v0.5.0) (2026-02-24)


### Bug Fixes

* **cli:** always use npx in hooks to prevent command not found errors ([4b00cce](https://github.com/educlopez/codevator/commit/4b00cce4a0b4176778666e46c3cc44c632c4562c))
* **web:** allow mobile users to unmute and show mute button on all devices ([ad8f447](https://github.com/educlopez/codevator/commit/ad8f4473ef0ae3eefc4f6a7d3eecd5d16f8d80fb))
* **web:** initialize muted state at module load so icon is correct from first render ([48a2837](https://github.com/educlopez/codevator/commit/48a2837aba5cd7651ab3bbe63c29c94f47ee9027))
* **web:** link logo to home page ([51c4252](https://github.com/educlopez/codevator/commit/51c42522fee4e654269fd022c42446b3522ba554))
* **web:** show correct muted icon on initial render for mobile ([ae68a76](https://github.com/educlopez/codevator/commit/ae68a760ca8ae260afe906f998e84e4114db0657))


### Features

* **web:** add roadmap page with timeline and shared header/footer ([f30442b](https://github.com/educlopez/codevator/commit/f30442b76db21bd4e44ec465df70b95fa8f0e493))
* **web:** add skeleton loading and group roadmap items by status ([1e545e9](https://github.com/educlopez/codevator/commit/1e545e9c6299bf1f16ecacb2cbffee39ef634717))

## [0.4.1](https://github.com/educlopez/codevator/compare/v0.4.0...v0.4.1) (2026-02-24)

# [0.4.0](https://github.com/educlopez/codevator/compare/v0.3.0...v0.4.0) (2026-02-24)


### Bug Fixes

* **cli:** disable GitHub release in release-it, create via gh CLI ([41d92f4](https://github.com/educlopez/codevator/commit/41d92f49021b89370e3963cbfcb75734cf967632))


### Features

* show available commands after setup, update help and web terminal examples ([367f3ad](https://github.com/educlopez/codevator/commit/367f3ad12e99db89ed6db7363efc3cc903e266cc))

# [0.3.0](https://github.com/educlopez/codevator/compare/v0.2.2...v0.3.0) (2026-02-23)


### Bug Fixes

* **cli:** disable npm publish in release-it, publish manually ([d1ff715](https://github.com/educlopez/codevator/commit/d1ff715bbf0f1d86b3c1f8dec31d4f674c045037))
* **cli:** skip GitHub auth pre-check in release-it ([9d18240](https://github.com/educlopez/codevator/commit/9d18240520c1b4ccc36c50349a2e8e49e04b0d29))
* **cli:** use web auth for npm publish ([370d40d](https://github.com/educlopez/codevator/commit/370d40d149a2a6c81704733681bf4d1c8a72104a))


### Features

* **cli:** add polished TUI with @clack/prompts and picocolors ([559677f](https://github.com/educlopez/codevator/commit/559677fa27a9890aaf7e94201f2eeed27b9d23c9))

## [0.2.2](https://github.com/eduardcalvet/codevator/compare/v0.2.1...v0.2.2) (2025-06-13)

- Fix retro.mp3 not included in published package

## [0.2.1](https://github.com/eduardcalvet/codevator/compare/v0.2.0...v0.2.1) (2025-06-13)

- Add Umami analytics and launch content

## [0.2.0](https://github.com/eduardcalvet/codevator/compare/v0.1.0...v0.2.0) (2025-06-12)

- Initial public release
