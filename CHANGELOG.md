# Changelog

## [1.4.2](https://github.com/the-hcma/tsp-maximizer/compare/v1.4.1...v1.4.2) (2026-08-13)


### Bug Fixes

* **ci:** harden Graphite restack guard push dedup ([#87](https://github.com/the-hcma/tsp-maximizer/issues/87)) ([ebb743e](https://github.com/the-hcma/tsp-maximizer/commit/ebb743eda41e5a55a253479ac5a91d8c278f457b))
* **ci:** key CI concurrency on head SHA ([#71](https://github.com/the-hcma/tsp-maximizer/issues/71)) ([10bb3b3](https://github.com/the-hcma/tsp-maximizer/commit/10bb3b365d194f36c3b87cd49b224d848e47875b))
* **ci:** key CI concurrency on head SHA ([#99](https://github.com/the-hcma/tsp-maximizer/issues/99)) ([5dd2b6f](https://github.com/the-hcma/tsp-maximizer/commit/5dd2b6fc9250c471f07622aaab3959d01d649e9d))
* **ci:** run CI on Graphite restack (push fallback + guard dedup) ([#76](https://github.com/the-hcma/tsp-maximizer/issues/76)) ([45bb82d](https://github.com/the-hcma/tsp-maximizer/commit/45bb82d79538bbc5e3af4a10d44f2fea81829ab4))
* **ci:** skip duplicate push CI when open PR exists ([#84](https://github.com/the-hcma/tsp-maximizer/issues/84)) ([95e3c8b](https://github.com/the-hcma/tsp-maximizer/commit/95e3c8b16d7d2f3ec06a2253a035551327abee1a))
* **ci:** sync canonical secret-scan script ([#136](https://github.com/the-hcma/tsp-maximizer/issues/136)) ([c47fc27](https://github.com/the-hcma/tsp-maximizer/commit/c47fc2724c3da7d53087ec35284ded8394c7a26f))
* **ci:** trigger CI on merge_group for GitHub MQ ([#145](https://github.com/the-hcma/tsp-maximizer/issues/145)) ([6393811](https://github.com/the-hcma/tsp-maximizer/commit/63938116542a5c7614e256fde02027c5dfd6006f))

## [1.4.1](https://github.com/the-hcma/tsp-maximizer/compare/v1.4.0...v1.4.1) (2026-06-11)


### Bug Fixes

* **ci:** delete Graphite MQ staging branches when PR closes ([#69](https://github.com/the-hcma/tsp-maximizer/issues/69)) ([a547404](https://github.com/the-hcma/tsp-maximizer/commit/a547404566da59ee3eb94aca41f9b2ad64d6d257))
* **ci:** sync canonical secret-scan script ([#65](https://github.com/the-hcma/tsp-maximizer/issues/65)) ([403bc20](https://github.com/the-hcma/tsp-maximizer/commit/403bc201df135227455a8ae84403b762846ce06b))
* **ci:** sync canonical secret-scan script ([#68](https://github.com/the-hcma/tsp-maximizer/issues/68)) ([69db324](https://github.com/the-hcma/tsp-maximizer/commit/69db324ee4ea5c6395cab12cbb0d14dda1ba1482))
* **ci:** use canonical secret-scan job ([#66](https://github.com/the-hcma/tsp-maximizer/issues/66)) ([4170aca](https://github.com/the-hcma/tsp-maximizer/commit/4170acaaf257bad7c13a32aa8a0a3cb1cd2b71a0))

## [1.4.0](https://github.com/the-hcma/tsp-maximizer/compare/v1.3.0...v1.4.0) (2026-04-29)


### Features

* add OS-specific terminal instructions to README and use absolute path for agent script ([bbe9b57](https://github.com/the-hcma/tsp-maximizer/commit/bbe9b57c63a0bdc42fd3c6eb7420ad2c4c2cc97a))

## [1.3.0](https://github.com/the-hcma/tsp-maximizer/compare/v1.2.0...v1.3.0) (2026-04-29)


### Features

* auto-inject version from package.json and add documentation footer link ([#14](https://github.com/the-hcma/tsp-maximizer/issues/14)) ([b3264b8](https://github.com/the-hcma/tsp-maximizer/commit/b3264b8c29068d357b01f8f867d6f5823cba3e66))
* bump APP_VERSION to 1.2.0 and add help link to README ([cf90280](https://github.com/the-hcma/tsp-maximizer/commit/cf902803be2560d6a8a954d1e5d916be66d1e50f))

## [1.2.0](https://github.com/the-hcma/tsp-maximizer/compare/v1.1.0...v1.2.0) (2026-04-29)


### Features

* add Clear All button to reset user input fields to zero ([e04034a](https://github.com/the-hcma/tsp-maximizer/commit/e04034a12ea233e7615c10b349f59cdb15b7257f))
* add disclaimer tooltip to hero and clear YTD inputs button ([#10](https://github.com/the-hcma/tsp-maximizer/issues/10)) ([3eb64dd](https://github.com/the-hcma/tsp-maximizer/commit/3eb64dd6878c28a22e74be775085f59ade1e46d5))
* add global CLI (tsp-maximizer) and npx support via bin entry point ([390ef10](https://github.com/the-hcma/tsp-maximizer/commit/390ef10c224d0488a92686e98ed4fd12234a9cd2))
* auto-install dependencies when running pnpm dev in a fresh worktree ([#12](https://github.com/the-hcma/tsp-maximizer/issues/12)) ([41faa4a](https://github.com/the-hcma/tsp-maximizer/commit/41faa4abf9cbfb9476efd3e5e5209e9bd2e3b9bb))
* auto-open browser on dev start with headless display detection ([9422b63](https://github.com/the-hcma/tsp-maximizer/commit/9422b63c18e766f1ec792ee9cd79fa7da8691032))
* version badge, comma-formatted numbers, text inputs without spinners ([4a41b25](https://github.com/the-hcma/tsp-maximizer/commit/4a41b25c0f07aab99cda71023e2e3f26b12d0f32))


### Bug Fixes

* add repository metadata, prettier devdep, format:check CI step ([#11](https://github.com/the-hcma/tsp-maximizer/issues/11)) ([85e22df](https://github.com/the-hcma/tsp-maximizer/commit/85e22dfe7ee2e8d165c0be6e2034e01e61c077c7))
* lower default contribution rate from 33% to 20% ([#13](https://github.com/the-hcma/tsp-maximizer/issues/13)) ([431a007](https://github.com/the-hcma/tsp-maximizer/commit/431a0072cf81ae838cef3377bb34e172d505ca7c))

## [1.1.0](https://github.com/the-hcma/tsp-maximizer/compare/v1.0.0...v1.1.0) (2026-04-28)


### Features

* add dark/light mode toggle ([2a0de13](https://github.com/the-hcma/tsp-maximizer/commit/2a0de137aaf3baea71cd1d8ca755df6ea90115c6))
* dark/light mode toggle, README badges & npx quick-start ([abe8274](https://github.com/the-hcma/tsp-maximizer/commit/abe8274c5a27bcfe4fd5bec91cbc770fcd6163f4))


### Bug Fixes

* **ci:** use env vars in assert step to avoid shell injection from PR JSON ([457125a](https://github.com/the-hcma/tsp-maximizer/commit/457125ab4de7bad162917b03e898c2a02aa46276))
* **ci:** use env vars in assert step to avoid shell injection from PR JSON ([da7a64d](https://github.com/the-hcma/tsp-maximizer/commit/da7a64dd3c03d6db633e54dae5b010288a156805))
* rename package to @the-hcma/tsp-maximizer, fix smoke test and publish workflow ([d70bb47](https://github.com/the-hcma/tsp-maximizer/commit/d70bb47c30f9db6a91ca8b598e3a29dd4390e58b))

## 1.0.0 (2026-04-28)


### Bug Fixes

* contribution rate field/slider sync, extract computations, add unit tests ([c2ce583](https://github.com/the-hcma/tsp-maximizer/commit/c2ce5833f9b1c3aaae135afc6af08c74a64d136f))
* contribution rate field/slider sync, extract computations, add unit tests ([df946ae](https://github.com/the-hcma/tsp-maximizer/commit/df946ae50a10adb6470077713ae1d863dde0047a))
* remove unused import and use vitest/config for test config types ([6dffa03](https://github.com/the-hcma/tsp-maximizer/commit/6dffa0336eddec867f4f6568ea95a66d897326dc))
