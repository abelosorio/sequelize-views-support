## [4.0.2](https://github.com/sugarandmagic/sequelize-mv-support/compare/v4.0.1...v4.0.2) (2020-06-01)


### Bug Fixes

* **deps:** setting to minor to auto publish dep bumps ([3a21f2e](https://github.com/sugarandmagic/sequelize-mv-support/commit/3a21f2ee4473b512a10d5501e2ce43a57ee8d4fe))

## [4.0.1](https://github.com/sugarandmagic/sequelize-mv-support/compare/v4.0.0...v4.0.1) (2020-02-17)


### Bug Fixes

* **drone:** fix pg docker image to image: 'postgres:10.7' ([cce3a9b](https://github.com/sugarandmagic/sequelize-mv-support/commit/cce3a9bd4345f2dfc1d0a03a351c9d9fda6e123b))

# [4.0.0](https://github.com/sugarandmagic/sequelize-mv-support/compare/v3.0.3...v4.0.0) (2020-02-03)


### Features

* **node12:** use node 12 internally and bump deps ([7c6a601](https://github.com/sugarandmagic/sequelize-mv-support/commit/7c6a6010143dddd76d84e779383b5a6bc6921076))
* **node12:** use node 12 internally and bump deps ([ae3267b](https://github.com/sugarandmagic/sequelize-mv-support/commit/ae3267b656f03c341e211d457460215d48b1fb54))


### BREAKING CHANGES

* **node12:** node 12 internally may not be compatible
* **node12:** node 12 internally may not be compatible

## [3.0.3](https://github.com/sugarandmagic/sequelize-mv-support/compare/v3.0.2...v3.0.3) (2020-01-09)


### Bug Fixes

* **sequelize:** expose the options opject publicly ([9870435](https://github.com/sugarandmagic/sequelize-mv-support/commit/9870435228f5a2a642e88b4df1d3b34ef26a8bca))

## [3.0.2](https://github.com/sugarandmagic/sequelize-mv-support/compare/v3.0.1...v3.0.2) (2020-01-09)


### Bug Fixes

* **sequelize:** add missing datatypes to Sequelize class ([d93ee08](https://github.com/sugarandmagic/sequelize-mv-support/commit/d93ee0890c2880e0f0be7c9c19100e9b6cea4eb9))

## [3.0.1](https://github.com/sugarandmagic/sequelize-mv-support/compare/v3.0.0...v3.0.1) (2020-01-08)


### Bug Fixes

* **schema:** fix garbled schema names ([64a78b6](https://github.com/sugarandmagic/sequelize-mv-support/commit/64a78b60895cbfd375864067db27add9a1878b0b))

# [3.0.0](https://github.com/sugarandmagic/sequelize-mv-support/compare/v2.2.0...v3.0.0) (2020-01-08)


### Features

* add support for both views and materialized views ([59d9c4e](https://github.com/sugarandmagic/sequelize-mv-support/commit/59d9c4eabdd87e9a22000bbc1fe10bf7a1c0d6ae))
* view definitions are now just the regular sql query ([53402c8](https://github.com/sugarandmagic/sequelize-mv-support/commit/53402c8d591c5a9404f74ed9b61bd43c85f8a78d))
* **schema:** add support for custom schemas in views ([13bb753](https://github.com/sugarandmagic/sequelize-mv-support/commit/13bb753a4fa7281e5f30992f30f547e3b23e84f2))
* **types:** export all types at module, default, and Sequelize ([510ddf7](https://github.com/sugarandmagic/sequelize-mv-support/commit/510ddf7bf1ca774b68d158cadfd84f06a9fa5f65))


### BREAKING CHANGES

* View definition no longer includes CREATE ... AS component
* View methods now refer to regular views. Materialized views have new function and
option names.

# [2.2.0](https://github.com/sugarandmagic/sequelize-mv-support/compare/v2.1.0...v2.2.0) (2020-01-07)


### Features

* migrate to typescript ([c117d44](https://github.com/sugarandmagic/sequelize-mv-support/commit/c117d444f6b20da124249a3c8aa41a8fb87921bc))

# [2.1.0](https://github.com/sugarandmagic/sequelize-mv-support/compare/v2.0.1...v2.1.0) (2019-12-20)


### Features

* **deps:** remove broken dep ([8c0b48c](https://github.com/sugarandmagic/sequelize-mv-support/commit/8c0b48cda8f0c94e876303b492e7cd2d3c3f2c42))

## [2.0.1](https://github.com/sugarandmagic/sequelize-mv-support/compare/v2.0.0...v2.0.1) (2019-11-07)


### Bug Fixes

* **babel:** fix es6 default export ([253d261](https://github.com/sugarandmagic/sequelize-mv-support/commit/253d261eef15d5eafe668268c6be5c1aee9dd02a))

# [2.0.0](https://github.com/sugarandmagic/sequelize-mv-support/compare/v1.0.2...v2.0.0) (2019-11-06)


### Features

* **tooling:** upgrade to babel 7 ([2fb9777](https://github.com/sugarandmagic/sequelize-mv-support/commit/2fb97774462d11347930ffdfb1a7220a1023bba9))


### BREAKING CHANGES

* **tooling:** Babel upgrade as yet untested

## [1.0.2](https://github.com/sugarandmagic/sequelize-mv-support/compare/v1.0.1...v1.0.2) (2019-11-02)

## [1.0.1](https://github.com/sugarandmagic/sequelize-mv-support/compare/v1.0.0...v1.0.1) (2019-11-02)

# 1.0.0 (2019-11-02)


### Features

* **views:** make view sync not throw ([e356a32](https://github.com/sugarandmagic/sequelize-mv-support/commit/e356a3281c861f8e7716d2e3846c9c0572bf3c1e))
