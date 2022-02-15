/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * ModusBox
 - Miguel de Barros <miguel.debarros@modusbox.com>

 --------------
******/

'use strict'

/* eslint-disable no-console */

import { ILogger } from '@mojaloop/logging-bc-logging-types-lib'
import * as Winston from 'winston'

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

const logLevelPriority: Winston.config.AbstractConfigSetLevels = { 
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

export class WinstonLogger implements ILogger {

  private readonly _logger: any

  constructor(level?: LogLevel) {
    this._logger = Winston.createLogger({
      level,
      levels: logLevelPriority,
      format: Winston.format.json(),
      transports: [
        new Winston.transports.Console()
      ]
    })
  }

  isTraceEnabled (): boolean {
    return this._logger.isLevelEnabled(LogLevel.TRACE)
  }

  isDebugEnabled (): boolean {
    return this._logger.isLevelEnabled(LogLevel.DEBUG)
  }

  isInfoEnabled (): boolean {
    return this._logger.isLevelEnabled(LogLevel.INFO)
  }

  isWarnEnabled (): boolean {
    return this._logger.isLevelEnabled(LogLevel.WARN)
  }

  isErrorEnabled (): boolean {
    return this._logger.isLevelEnabled(LogLevel.ERROR)
  }

  isFatalEnabled (): boolean {
    return this._logger.isLevelEnabled(LogLevel.FATAL)
  }

  trace (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: LogLevel.TRACE, 
      message, 
      meta
    })
  }

  debug (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: LogLevel.DEBUG, 
      message, 
      meta
    })
  }

  info (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: LogLevel.INFO, 
      message,
      meta
    })
  }

  warn (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: LogLevel.WARN, 
      message, 
      meta
    })
  }

  error (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: LogLevel.ERROR, 
      message, 
      meta
    })
  }

  fatal (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: LogLevel.FATAL, 
      message, 
      meta
    })
  }
}
