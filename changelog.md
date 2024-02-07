# [2.0.0](https://github.com/bent10/headless-route/compare/v1.2.1...v2.0.0) (2024-02-07)


### Features

* add `isMatch`, `matchParams`, and `generatePath` props to dynamic route ([6ce0009](https://github.com/bent10/headless-route/commit/6ce0009d96022e6d18b478e003c09c968d7ad96f))
* provides async api ([1a45d9a](https://github.com/bent10/headless-route/commit/1a45d9ae0b4d964866db39c9ce51d51e57925cd5))
* segments may now include file names ordered numerically ([372498f](https://github.com/bent10/headless-route/commit/372498f6a7d6404dc7feff2a868c2b0580890b4d))


### BREAKING CHANGES

* The `params` prop has been removed from the dynamic route component. Code relying
on this prop will need to be updated to use the new props: `isMatch`, `matchParams`, and
`generatePath`.

## [1.2.1](https://github.com/bent10/headless-route/compare/v1.2.0...v1.2.1) (2024-02-05)


### Bug Fixes

* ensure consistent order of routes ([53909b6](https://github.com/bent10/headless-route/commit/53909b6c947ff9a769ba69d7acbce1597e343f12))

# [1.2.0](https://github.com/bent10/headless-route/compare/v1.1.0...v1.2.0) (2024-02-05)


### Features

* add navigation `handler` to the `createNavigation` fn ([28b86a5](https://github.com/bent10/headless-route/commit/28b86a57a3213909d0b969e62b8e44115e1cca2e))
* allows for using the `$` prefix as a dynamic route indicator ([5ad902f](https://github.com/bent10/headless-route/commit/5ad902f060564b34249272bec0db4a660cff8e1a))

# [1.1.0](https://github.com/bent10/headless-route/compare/v1.0.0...v1.1.0) (2024-02-03)


### Features

* renames optional route `data` prop to `context` ([af65d88](https://github.com/bent10/headless-route/commit/af65d88b7624edb7d3f83e5e5eff0d43c54fdf62))

# 1.0.0 (2024-02-03)


### Features

* init ([442a9b9](https://github.com/bent10/headless-route/commit/442a9b9e7efc4f97bfd7235fb21ad2b2f1b3f2f5))
