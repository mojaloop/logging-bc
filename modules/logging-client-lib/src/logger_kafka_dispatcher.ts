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

 * Coil
 - Jason Bruwer <jason.bruwer@coil.com>

 --------------
******/

'use strict'

/* eslint-disable no-console */
import { ILogger } from './ilogger'
import { LogLevel, LogEntry } from '@mojaloop/logging-bc-logging-types-lib'
import { LoggerBase } from './logger_base'

import { MLKafkaProducer, MLKafkaProducerOptions } from '@mojaloop/platform-shared-lib-nodejs-kafka-client-lib'

export class MLKafkaLoggerDispatcher extends LoggerBase implements ILogger {

  kafkaProducer: MLKafkaProducer
  kafkaTopic: string
  private readonly _logger: any

  constructor (
      producerOptions: MLKafkaProducerOptions,
      kafkaTopic : string,
      level?: LogLevel
  ) {
    super()
    if (level !== undefined) this.setLogLevel(level)

    this.kafkaProducer = new MLKafkaProducer(producerOptions, this._logger);
    this.kafkaTopic = kafkaTopic;
  }

  start() : Promise<void>  {
    return this.kafkaProducer.connect()
  }

  async destroy() : Promise<void>  {
    return this.kafkaProducer.destroy()
  }

  private _log (message?: any, ...meta: any[]): void {
    const logEntry : LogEntry = {
      level: this.getLogLevel(),
      logTimestamp: Date.now(),
      message: message,
      meta: meta
    };
    this.kafkaProducer.send({
      topic: this.kafkaTopic,
      value: logEntry,
      key: null,
      headers: [
        { key1: Buffer.from('testStr') }
      ]
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
