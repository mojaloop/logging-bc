"use strict"

import { WinstonLogger } from "../../src/logger_winston"
import { LogLevel } from "@mojaloop/logging-bc-logging-types-lib";

function log(logger:WinstonLogger, testObj:any){
  logger.trace(`${logger.getLogLevel()} - hello world from trace`, testObj)
  logger.debug(`${logger.getLogLevel()} - hello world from debug`, testObj)
  logger.info(`${logger.getLogLevel()} - hello world from info`, testObj)
  logger.warn(`${logger.getLogLevel()} - hello world from warn`, testObj)
  logger.error(`${logger.getLogLevel()} - hello world from error`, testObj)
  logger.fatal(`${logger.getLogLevel()} - hello world from fatal`, testObj)
}

describe('example test', () => {

  beforeEach(async () => {
    // Setup
  })

  afterEach(async () => {
    // Cleanup
  })

  test('should goes here', async () => {

    const logger = new WinstonLogger(LogLevel.TRACE)

    const testObj: any = {
      key: 'this is the key',
      value: 'this is the value' 
    }

    console.log('*** default is TRACE ***')
    log(logger, testObj)

    console.log('*** change to DEBUG ***')
    logger.setLogLevel(LogLevel.DEBUG)
    log(logger, testObj)

    console.log('*** change to INFO ***')
    logger.setLogLevel(LogLevel.INFO)
    log(logger, testObj)

    console.log('*** change to WARN ***')
    logger.setLogLevel(LogLevel.WARN)
    log(logger, testObj)

    console.log('*** change to ERROR ***')
    logger.setLogLevel(LogLevel.ERROR)
    log(logger, testObj)

    console.log('*** change to FATAL ***')
    logger.setLogLevel(LogLevel.FATAL)
    log(logger, testObj)

    await expect(true)
  })
})

