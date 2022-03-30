'use strict'

import { ILogger } from './ilogger'
import { ConsoleLogger } from './logger_console'
import { WinstonLogger } from './logger_winston'
import { MLKafkaLoggerDispatcher } from './logger_kafka_dispatcher'

export {
  ILogger,
  ConsoleLogger,
  WinstonLogger,
  MLKafkaLoggerDispatcher
}
