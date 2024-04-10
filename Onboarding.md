# Onboarding

>*Note:* Before completing this guide, make sure you have completed the _general_ onboarding guide in the [base mojaloop repository](https://github.com/mojaloop/mojaloop/blob/main/onboarding.md#mojaloop-onboarding).

## Contents

<!-- vscode-markdown-toc -->
1. [Prerequisites](#1-prerequisites)
2. [Service Overview](#2-service-overview)
3. [Installing and Building](#3-installing-and-building)
4. [Running Locally](#4-running-locally-dependencies-inside-of-docker)
5. [Running Inside Docker](#5-running-inside-docker)
6. [Testing](#6-testing)
7. [Common Errors/FAQs](#7-common-errorsfaqs)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->
##  1. Prerequisites

If you have followed the [general onboarding guide](https://github.com/mojaloop/mojaloop/blob/main/onboarding.md#mojaloop-onboarding), you should already have the following cli tools installed:

* `brew` (macOS), [todo: windows package manager]
* `curl`, `wget`
* `docker` + `docker-compose`
* `node`, `npm` and (optionally) `nvm`

## 2. Service Overview 
The Logging BC consists of the following packages;

`client-lib`
Client library types.
[README](./packages/client-lib/README.md)
 
`logging-svc`
Logging Service.
[README](packages/logging-svc/README.md) 

`public-types-lib`
Public shared types.
[README](./packages/public-types-lib/README.md)




## 3. <a name='InstallingandBuilding'></a>Installing and Building

Firstly, clone your fork of the `logging-bc` onto your local machine:
```bash
git clone https://github.com/<your_username>/logging-bc.git
```

Then `cd` into the directory and install the node modules:
```bash
cd logging-bc
```

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

#### Build

```bash
npm run build
``` 

## 4. Running Locally (dependencies inside of docker)

In this method, we will run all of the core dependencies inside of docker containers, while running the `logging-bc` server on your local machine.

### Startup supporting services

Use https://github.com/mojaloop/platform-shared-tools/tree/main/packages/deployment/docker-compose-infra 
Follow instructions in the docker-compose-infra `README.md` to run the supporting services. 

This will do the following:
* `docker pull` down any dependencies defined in each `docker-compose.yml` file, and the services.
* run all of the containers together
* ensure that all dependencies have started for each services.

### 4.2 Run the server

```bash
npm run start:logging-svc
```

## 5. Running Inside Docker


## 6. Testing
We use `npm` scripts as a common entrypoint for running the tests. Tests include unit, functional, and integration.

```bash
# unit tests:
npm run test:unit

# check test coverage
npm run test:coverage

# integration tests
npm run test:integration
```

### 6.1 Testing the `logging-bc` API with Postman

[Here](https://github.com/mojaloop/platform-shared-tools/tree/main/packages/postman) you can find a complete Postman collection, in a json file, ready to be imported to Postman.


## Common Errors/FAQs 

### Unable to load dlfcn_load
```bash
error:25066067:DSO support routines:dlfcn_load:could not load the shared library
```
Fix: https://github.com/mojaloop/security-bc.git  `export OPENSSL_CONF=/dev/null`