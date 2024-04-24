## @headless-route/vite [1.3.4](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.3.3...@headless-route/vite@1.3.4) (2024-04-24)


### Bug Fixes

* ensure proper handling of `outDir` when `root` differs from default and `outDir` is unset by the user ([3a6fc6a](https://github.com/bent10/headless-route/commit/3a6fc6ab33e310ba34948c96810656a5ea69ec19))

## @headless-route/vite [1.3.3](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.3.2...@headless-route/vite@1.3.3) (2024-04-23)


### Bug Fixes

* resolve missing file specifier error by adjusting Vite `base` URL configuration ([528254c](https://github.com/bent10/headless-route/commit/528254c78fdb37fb91fa842c89ebbb0420a16167))

## @headless-route/vite [1.3.2](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.3.1...@headless-route/vite@1.3.2) (2024-04-21)


### Bug Fixes

* add some missing fields ([735b02c](https://github.com/bent10/headless-route/commit/735b02ce7fa83cbb08678b564d384c54c7be0004))

## @headless-route/vite [1.3.1](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.3.0...@headless-route/vite@1.3.1) (2024-04-20)


### Bug Fixes

* update `urlPrefix` to fit with Vite configuration ([32c6f5a](https://github.com/bent10/headless-route/commit/32c6f5aef388ae5f5b93ca0ba33dea6e0a13ca6d))

# @headless-route/vite [1.3.0](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.2.1...@headless-route/vite@1.3.0) (2024-04-20)


### Bug Fixes

* **deps:** update `headless-route` to `v2.5.0` ([8bea3ce](https://github.com/bent10/headless-route/commit/8bea3ceda05b41c16a94ff3e69b5bf415a561897))


### Features

* wrap built-in data within `context.env` object ([507e093](https://github.com/bent10/headless-route/commit/507e0933e0e79871dd15a66a69d0d6fefdb17c79))

## @headless-route/vite [1.2.1](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.2.0...@headless-route/vite@1.2.1) (2024-04-20)





### Dependencies

* **headless-route:** upgraded to 2.5.0

# @headless-route/vite [1.2.0](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.1.1...@headless-route/vite@1.2.0) (2024-04-20)


### Features

* provide `prevRoute` and `nextRoute` to the route `context` for simplified pagination ([fb8be85](https://github.com/bent10/headless-route/commit/fb8be85334ad5bc1d850e8a89ea322e47b24dcc8))

## @headless-route/vite [1.1.1](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.1.0...@headless-route/vite@1.1.1) (2024-04-19)


### Bug Fixes

* expose `route.id` for runtime usage ([8d2b1b4](https://github.com/bent10/headless-route/commit/8d2b1b4086b93160e1efff3fb46f4c6330bd4736))

# @headless-route/vite [1.1.0](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.0.4...@headless-route/vite@1.1.0) (2024-04-15)


### Features

* enhance `createRouteContext` method to support route filtering in `getNavigation` ([ab6ec55](https://github.com/bent10/headless-route/commit/ab6ec55e7f132cc9a9a1236922399522e5c97129))

## @headless-route/vite [1.0.4](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.0.3...@headless-route/vite@1.0.4) (2024-04-06)


### Bug Fixes

* avoid opinionated `matter.layout` value ([456ae36](https://github.com/bent10/headless-route/commit/456ae36611c2ecca95d39fd7cdfac55c3336bf3a))
* expose `context.baseDir` ([9ae4c8d](https://github.com/bent10/headless-route/commit/9ae4c8d90b43e699fecf57999f766fae9c0c412f))
* improved the clarity and conciseness of the comments ([7b6483f](https://github.com/bent10/headless-route/commit/7b6483f6423d96f85cb4387dc7568d92861d0481))

## @headless-route/vite [1.0.3](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.0.2...@headless-route/vite@1.0.3) (2024-04-06)


### Bug Fixes

* **deps:** update dependency loadee to v3.1.1 ([e5ebc1e](https://github.com/bent10/headless-route/commit/e5ebc1e1a2b9a48c645aa99bd6205e8fdac9b9b0))

## @headless-route/vite [1.0.2](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.0.1...@headless-route/vite@1.0.2) (2024-04-01)


### Bug Fixes

* correct incorrect link ([9ff979b](https://github.com/bent10/headless-route/commit/9ff979bd754271889fa3410e6be5e2604f2d5714))
* remove `log`, `dump`, and `escape` helpers ([90d6995](https://github.com/bent10/headless-route/commit/90d69959f65e40164773e2d05e26095ae7d71121))
* update route context `getNavigation()` types ([c433dda](https://github.com/bent10/headless-route/commit/c433ddac31d668b89412cc4e2f6510e428f57a8e))

## @headless-route/vite [1.0.1](https://github.com/bent10/headless-route/compare/@headless-route/vite@1.0.0...@headless-route/vite@1.0.1) (2024-04-01)


### Bug Fixes

* add `headless-route` as an external dep ([09fe740](https://github.com/bent10/headless-route/commit/09fe7400dc62e5d7449f257f5587625eedd9f99a))

# @headless-route/vite 1.0.0 (2024-04-01)


### Features

* init `@headless-route/vite` ([0ac5cbc](https://github.com/bent10/headless-route/commit/0ac5cbccc05aa33bfd6e8d323314bea65a33c9df))
