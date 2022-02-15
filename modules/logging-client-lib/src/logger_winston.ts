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

import { ILogger, LogLevel } from '@mojaloop/logging-bc-logging-types-lib'
import { LoggerBase } from './logger_base'
import * as Winston from 'winston'

const logLevelPriority: Winston.config.AbstractConfigSetLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

export class WinstonLogger extends LoggerBase implements ILogger {

  private readonly _logger: any

  constructor (level?: LogLevel) {
    super()
    if (level !== undefined) this.setLogLevel(level)

    this._logger = Winston.createLogger({
      level: this._logLevel,
      levels: logLevelPriority,
      format: Winston.format.json(),
      transports: [
        new Winston.transports.Console()
      ]
    })
  }

  private _log (message?: any, ...meta: any[]): void {
    this._logger.log({
      level: this._logLevel,
      message,
      meta
    })
  }

  trace (message?: any, ...meta: any[]): void {
    if (!this.isTraceEnabled()) return

    this._log(message, ...meta)
  }

  debug (message?: any, ...meta: any[]): void {
    if (!this.isDebugEnabled()) return

    this._log(message, ...meta)
  }

  info (message?: any, ...meta: any[]): void {
    if (!this.isInfoEnabled()) return

    this._log(message, ...meta)
  }

  warn (message?: any, ...meta: any[]): void {
    if (!this.isWarnEnabled()) return

    this._log(message, ...meta)
  }

  error (message?: any, ...meta: any[]): void {
    if (!this.isErrorEnabled()) return

    this._log(message, ...meta)
  }

  fatal (message?: any, ...meta: any[]): void {
    if (!this.isFatalEnabled()) return

    this._log(message, ...meta)
  }
}
