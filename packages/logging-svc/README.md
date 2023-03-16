# logging-svc

[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/logging-bc.svg?style=flat)](https://github.com/mojaloop/logging-bc/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/logging-bc.svg?style=flat)](https://github.com/mojaloop/logging-bc/releases)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/logging-bc.svg?style=flat)](https://www.npmjs.com/package/@mojaloop-poc/logging-bc)
[![CircleCI](https://circleci.com/gh/mojaloop/logging-bc.svg?style=svg)](https://circleci.com/gh/mojaloop/logging-bc)

Mojaloop Logging Service


## Starting the Logging Service

Prerequisites:
- Run the installation procedure below
- Make sure ElasticSeach and Kafka are running - see `docker-compose` [Readme](../../docker-compose/README.md) file
- Make sure the constants in `src/application/index.ts` are correct

Run the following command to start the service:

```shell
yarn run start:logging-svc
```
> Note: run this command in the base directory of the repo

## Install

### Install Node version

More information on how to install NVM: https://github.com/nvm-sh/nvm

```bash
nvm install
nvm use
```

### Install Yarn

```bash
npm -g yarn
```

### Install Dependencies

```bash
yarn
```

## Build

```bash
yarn build
```

## Run

```bash
yarn start
```

## Unit Tests

```bash
yarn test:unit
```

## Known Issues

- added `typescript` to [.ncurc.json](./.ncurc.json) as the `dep:update` script will install a non-supported version of typescript
