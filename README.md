# logging-bc

**EXPERIMENTAL** vNext Logging Bounded Context Mono Repository

{{DESCRIPTION}}

## Modules

### logging-svc

{{DESCRIPTION}}

[README](./modules/logging-svc/README.md)

#### Run

```bash
npm run start:logging-svc
```

## Usage

### Install Node version

More information on how to install NVM: https://github.com/nvm-sh/nvm

```bash
nvm install
nvm use
```

### Install Dependencies

```bash
npm install
```

## Build

```bash
npm run build
```

## Unit Tests

```bash
npm run test:unit
```

## Run the services 

### Startup supporting services

Use https://github.com/mojaloop/platform-shared-tools/tree/main/packages/deployment/docker-compose-infra

Follow instructions in the docker-compose-infra README.md to run the supporting services.  


## After running the docker-compose-infra we can start logging-bc:
```shell
npm run start:logging-svc
```

## Integration Tests
```bash
npm run test:integration
```

## Troubleshoot 

### Unable to load dlfcn_load
```bash
error:25066067:DSO support routines:dlfcn_load:could not load the shared library
```
Fix: https://github.com/mojaloop/security-bc.git  `export OPENSSL_CONF=/dev/null`

