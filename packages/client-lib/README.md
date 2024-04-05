# Mojaloop vNext Nodejs Logging Client Library

[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/logging-bc.svg?style=flat)](https://github.com/mojaloop/logging-bc/commits/main)
[![Git Releases](https://img.shields.io/github/release/mojaloop/logging-bc.svg?style=flat)](https://github.com/mojaloop/logging-bc/releases)
[![Npm Version](https://img.shields.io/npm/v/@mojaloop/logging-bc-client-lib.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/logging-bc-client-lib)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mojaloop/logging-bc-client-lib.svg?style=flat)](https://www.npmjs.com/package/@mojaloop/logging-bc-client-lib)
[![CircleCI](https://circleci.com/gh/mojaloop/logging-bc.svg?style=svg)](https://circleci.com/gh/mojaloop/logging-bc)

This library provides usable implementations of the ILogger interface defined in `@mojaloop/logging-bc-public-types-lib`.

Current implementations:
- **DefaultLogger** - Does structured colored logging to the console as well as to a combined.log file;
- **KafkaLogger** - Does everything DefaultLogger does and also sends the logs via Kafka to the central logging services.


## Do not depend on specific client logging implementations when not needed

All logger implementations like `DefaultLogger` of `KafkaLogger` implement the `ILogger` interface from `@mojaloop/logging-bc-public-types-lib`.

**It is best to only use the public and stable `ILogger`** dependency in important (domain layer) code and not real logger implementations.

Only application layer code should depended on `@mojaloop/logging-bc-client-lib`.

This way, domain code only depends on the stable `@mojaloop/logging-bc-public-types-lib` and any concrete implementations as passed via dependency injection.

For very simple logging needs the `@mojaloop/logging-bc-public-types-lib` library has a `ConsoleLogger` class that can be used.


## Usage

### DefaultLogger
This logger implementation will log both to the console and a `"combined.log"` file.

```Typescript
import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";
import { DefaultLogger } from "@mojaloop/logging-bc-client-lib";

const BC_NAME = "your_bounded_context_name";
const APP_NAME = "your_app_name";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;

const logger: ILogger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

logger.trace("trace message");
logger.debug("debug message");
logger.info("info message");
logger.warn("warn message");
logger.error("error message");
logger.fatal("fatal message");

// logging errors with complete error stack
logger.error("error message with optional error object", new Error("My error obj"));

// example of metadata
logger.debug("trace message with example metadata", {metaL: "metaCt 1"});

// change the loglevel for subsequent log calls
logger.setLogLevel(LogLevel.ERROR);

// creating a child logger with a component name
// the child logger an instance of the normal logger
const childLogger: ILogger = logger.createChild("childComponent 2");

childLogger.debug("debug message");
childLogger.info("info message");
```


### Avoiding unecessary work
All the log methods debug(), info(), etc, have a guard inside that checks the enabled log level and will ignore the call if the called log level is not enabled.
For cases where the parameters of the log calls are computationally expensive, it is a good idea to prefix the log call with a logical guard expression, like so:

```Typescript
this._logger.isDebugEnabled() && this._logger.debug(`Something happened, message is: ${JSON.stringify(message)}`)
```

With this strategy, we avoid the evaluation of the `JSON.stringify(message)` entirely when debug loglevel is not enabled. This is specially important in places where the code might be executed repeatedly.

**Note** that this is this is only worth it when the parameters of the log call are computationally expensive, for simple parameters like static strings this is not needed and should be avoided to keep the code simple.

### KafkaLogger
This logger implementation extends the `DefaultLogger` and will additionally ship the logs via **Kafka** to the central logging service, which will store them.


```Typescript
import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";
import { KafkaLogger } from "@mojaloop/logging-bc-client-lib";

const BC_NAME = "your_bounded_context_name";
const APP_NAME = "your_app_name";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;

const kafkaProducerOptions = {
    kafkaBrokerList: "localhost:9092"
}

const kafkaLogsTopic = "logs";

let logger: ILogger;


async function start(){
    logger = new KafkaLogger(
            BC_NAME,
            APP_NAME,
            APP_VERSION,
            kafkaProducerOptions,
            kafkaLogsTopic,
            LOGLEVEL
    );
    await (logger as KafkaLogger).init();

    // use the same way as any other ILogger
    // ex:
    logger.debug("debug message");


    setTimeout(async ()=>{
        // NOTE Make sure to call KafkaLogger.destroy
        await (logger as KafkaLogger).destroy();
    }, 500);
}

start();
```

### See also

For the details on how to split the code between interface usage and concrete implementation OR the common types definition and the simplistic ConsoleLogger implementation see the `@mojaloop/logging-bc-public-types-lib` library [here](https://www.npmjs.com/package/@mojaloop/logging-bc-public-types-lib).

### Install

To install this library use:

```shell
yarn add @mojaloop/logging-bc-client-lib

OR

npm install @mojaloop/logging-bc-client-lib
```
