"use strict"


import {ConsoleLogger, LogLevel} from "../../src/";

describe('example test', () => {

  beforeEach(async () => {
    // Setup
  })

  afterEach(async () => {
    // Cleanup
  })

  test('should goes here', async () => {

    const logger = new ConsoleLogger();
    logger.setLogLevel(LogLevel.TRACE);

    logger.trace("trace message");
    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");
    logger.fatal("fatal message");

    logger.error("error message", new Error("TestErrorObject"));

    await expect(true)
  })
})
