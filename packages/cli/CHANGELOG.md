# Changelog

# [0.12.0](https://github.com/educlopez/codevator/compare/v0.11.0...v0.12.0) (2026-03-15)


### Features

* **web:** update website and docs for v0.11.0 features ([2a2a1df](https://github.com/educlopez/codevator/commit/2a2a1df919f78ec3136cc5047842ea21d5943f00))

# [0.11.0](https://github.com/educlopez/codevator/compare/v0.10.1...v0.11.0) (2026-03-15)


### Features

* **cli:** add category-based sound gallery with random mode and grouped UX ([50b0586](https://github.com/educlopez/codevator/commit/50b0586cce5f616f73a1a3f40c8b2fbcda7ab6ea))
* **cli:** add Gemini CLI, Copilot CLI, Cursor, and Windsurf adapters ([69a1bcd](https://github.com/educlopez/codevator/commit/69a1bcdd2d75ea098a69ec4638e514d3784b854f))
* **cli:** add user engagement features with duration tracking, streaks, and feedback links ([80b9db0](https://github.com/educlopez/codevator/commit/80b9db0581e7f9658459a03a2a2b8efc01a89428))
* **web:** add 9 new sounds across 3 categories with Pixabay attribution ([9eb89e4](https://github.com/educlopez/codevator/commit/9eb89e44f7632610ab7c6486cd63128012aca024))
* **web:** update website to reflect CLI v0.10.x features ([c3190ea](https://github.com/educlopez/codevator/commit/c3190ea541ba7d7346d132b0ce339e73a6095e57))

## [0.10.1](https://github.com/educlopez/codevator/compare/v0.10.0...v0.10.1) (2026-03-11)


### Bug Fixes

* replace npx hook with shell fast-path to prevent process accumulation ([bb75064](https://github.com/educlopez/codevator/commit/bb750641cbd0cbda2fc424edca995806fdd4e894))

# [0.10.0](https://github.com/educlopez/codevator/compare/v0.9.1...v0.10.0) (2026-03-11)


### Bug Fixes

* **cli:** add getConfigDir mock to commands-runtime tests ([729ffde](https://github.com/educlopez/codevator/commit/729ffde2e67f782e3a292c4744f8fd92cde053ad))
* **menubar:** address CodeRabbit review feedback ([ea700a4](https://github.com/educlopez/codevator/commit/ea700a441f7f58934512c494d77371d21cfedad2)), closes [#if](https://github.com/educlopez/codevator/issues/if)
* **menubar:** native macOS UI, direct daemon protocol, and config sync ([370159d](https://github.com/educlopez/codevator/commit/370159d8b130e3b8916887e55c4a2436feea137a))


### Features

* **cli:** add install-menubar and uninstall-menubar commands ([a2536ab](https://github.com/educlopez/codevator/commit/a2536abbd4910212b6fd7864e9808f41f5a47e41))
* **menubar:** add SwiftUI macOS menu bar app ([e5d6374](https://github.com/educlopez/codevator/commit/e5d6374fec6909bf1f8d5699e7cae028e943c4fc))
* **web:** add 3D retro Macintosh Classic hero with CRT terminal ([cbe8888](https://github.com/educlopez/codevator/commit/cbe8888ee470e159edcfa9be0c75f3380d64054f))

## [0.9.1](https://github.com/educlopez/codevator/compare/v0.9.0...v0.9.1) (2026-03-07)

# [0.9.0](https://github.com/educlopez/codevator/compare/v0.8.0...v0.9.0) (2026-03-07)


### Features

* add custom sound import, profiles, and multi-agent support ([5d24e79](https://github.com/educlopez/codevator/commit/5d24e79a99d65be6a9e98ec0fb194cbee61f45c3))

# [0.8.0](https://github.com/educlopez/codevator/compare/v0.7.0...v0.8.0) (2026-03-07)


### Features

* add doctor, preview, list, and stats commands ([c19ee5d](https://github.com/educlopez/codevator/commit/c19ee5d6a799a31ac8d72bebf24af5d2f75ab019))

# [0.7.0](https://github.com/educlopez/codevator/compare/v0.6.1...v0.7.0) (2026-03-01)


### Bug Fixes

* improve audio playback reliability and harden player inputs ([2956bc4](https://github.com/educlopez/codevator/commit/2956bc4d43c399ebb847ef4eaa50416ec53d423e))
* restore Spotify volume on session exit via SessionEnd hook ([2d153d8](https://github.com/educlopez/codevator/commit/2d153d8e991b92b17b7dad9066d4d7e93532a0d8))
* use stable session_id from Claude Code hooks instead of process.ppid ([e80d165](https://github.com/educlopez/codevator/commit/e80d165827dd78c9cbc2213029e262d50d61d4df))


### Features

* add spotify mode to control Spotify desktop volume ([0f11ada](https://github.com/educlopez/codevator/commit/0f11adaee3507b0350a853d53a3e070084b5e929))
* per-track playback, async shutdown, variant sound migration ([b1dc8fc](https://github.com/educlopez/codevator/commit/b1dc8fc4e92807c1a0bec4e69f8775e30f12bd36))
* persistent audio daemon with fade, position memory, file rotation, and multi-session support ([e74231c](https://github.com/educlopez/codevator/commit/e74231cf747e768e7f6ddb76794c098a9a645f81)), closes [#3](https://github.com/educlopez/codevator/issues/3) [#2](https://github.com/educlopez/codevator/issues/2) [#1](https://github.com/educlopez/codevator/issues/1) [#4](https://github.com/educlopez/codevator/issues/4)

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
