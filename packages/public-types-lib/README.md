# logging-types-lib

[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/logging-bc.svg?style=flat)](https://github.com/mojaloop/logging-bc/commits/main)
[![Git Releases](https://img.shields.io/github/release/mojaloop/logging-bc.svg?style=flat)](https://github.com/mojaloop/logging-bc/releases)
[![Npm Version](https://img.shields.io/npm/v/@mojaloop/logging-bc-public-types-lib.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/logging-bc-public-types-lib)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/logging-bc-public-types-lib.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/logging-bc-public-types-lib)
[![CircleCI](https://circleci.com/gh/mojaloop/logging-bc.svg?style=svg)](https://circleci.com/gh/mojaloop/logging-bc)

Mojaloop Logging Service's Types Lib (and minimal console logger)


This library provides stable logging related types to be used in code that does not require actual implementations of a logger, i.e., code that can use the ILogger interface and expect a concrete implementation to be injected by calling components.

It also provides a minimal ILogger implementation for tests/development purposes only.

Types:
- **LogLevel** - This enumeration lists the official log levels for the platform;
- **ILogger** - This is the interface that all Logger implementations must implement, it specifies the mandatory level of functionaly between all implementations;
- **LogEntry** - This type defines a server side log entry object. Only for advanced usage.
- **ConsoleLogger** - This is the simplest possible ILogger implementation, that logs to the nodejs/js console. 

## How to use in components without depending on concrete logger implementations

In the code that doesn't need to be aware of concrete implementations, usually valuable domain code:

```Typescript
import {ILogger} from "@mojaloop/logging-bc-public-types-lib";

// Notice how this code has no knowledge of any concret logger implementations

class MyDomainThing {
    private _logger: ILogger;

    constructor(logger: ILogger) {
        this._logger = logger;
    }
    
    doAction():void{
        //... do stuff
        
        this._logger.log("Did stuff");
    }
}
```

In the application code that usually calls the domain code:

```Typescript
import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";
import { DefaultLogger } from "@mojaloop/logging-bc-client-lib";
import { MyDomainThing } from "../domain/my_domain_class";

const BC_NAME = "your_bounded_context_name";
const APP_NAME = "your_app_name";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;

const loggerImplementation: ILogger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

// Now we do the dependency injection part by injecting
// the actual implementation via the constructor

const myThing = new MyDomainThing(loggerImplementation);

myThing.doAction();
```


## How to use the console logger



In the application code that usually calls the domain code:

```Typescript
import { ConsoleLogger, ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";

const logger: ILogger = new ConsoleLogger();

logger.debug("debug message");
```

### See also

For more interesting logger implementations, like the DefaultLogger that logs to the console and to a file, or the KafkaLogger that also sends the logs to the central services, see the `@mojaloop/logging-bc-client-lib` library [here](https://www.npmjs.com/package/@mojaloop/logging-bc-client-lib)


### Install

To install this library use:

```shell
yarn add @mojaloop/logging-bc-client-lib

OR 

npm install @mojaloop/logging-bc-client-lib
```
