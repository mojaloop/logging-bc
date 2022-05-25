"use strict"

import {DefaultLogger} from "../../src/index";
import {LogLevel} from "@mojaloop/logging-bc-public-types-lib";

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib-unit-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;


function log(logger:DefaultLogger, testObj:any){
  logger.trace(`${logger.getLogLevel()} - hello world from trace`, testObj);
  logger.debug(`${logger.getLogLevel()} - hello world from debug`, testObj);
  logger.info(`${logger.getLogLevel()} - hello world from info`, testObj);
  logger.warn(`${logger.getLogLevel()} - hello world from warn`, testObj);
  logger.error(`${logger.getLogLevel()} - hello world from error`, testObj);
  logger.fatal(`${logger.getLogLevel()} - hello world from fatal`, testObj);
}

describe("default logger tests", () => {

  beforeEach(async () => {
    // Setup
  })

  afterEach(async () => {
    // Cleanup
  })

  test("loglevel tests", async () => {
    const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

    const testObj: any = {
      key: "this is the key",
      value: "this is the value"
    }

    console.log("*** default is TRACE ***");
    log(logger, testObj);

    console.log("*** change to DEBUG ***");
    logger.setLogLevel(LogLevel.DEBUG);
    log(logger, testObj);

    console.log("*** change to INFO ***");
    logger.setLogLevel(LogLevel.INFO);
    log(logger, testObj);

    console.log("*** change to WARN ***");
    logger.setLogLevel(LogLevel.WARN);
    log(logger, testObj);

    console.log("*** change to ERROR ***");
    logger.setLogLevel(LogLevel.ERROR);
    log(logger, testObj);

    console.log("*** change to FATAL ***");
    logger.setLogLevel(LogLevel.FATAL);
    log(logger, testObj);

    await expect(true);
  })

  test("error object tests", async () => {
    const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

    const err = new Error("Error object message");

    console.log("\r\n*** Error logging output follows ***");

    logger.error("An error occurred", err);

    await expect(true);
  })

  test("child logger tests", async () => {
    const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

    const childLogger = logger.createChild("subcomponent");

    console.log("\r\n*** Child logger output follows ***");

    log(childLogger, {});

    await expect(true);
  })

})
