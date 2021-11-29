"use strict"

import { WinstonLogger } from "../../src/logger_winston"

describe('example test', () => {

  beforeEach(async () => {
    // Setup
  })

  afterEach(async () => {
    // Cleanup
  })

  test('should goes here', async () => {

    const logger = new WinstonLogger()

    const testObj: any = {
      key: 'this is the key',
      value: 'this is the value' 
    }

    logger.info('hello world', testObj)
    logger.info('hello world2', testObj)

    await expect(true)
  })
})

