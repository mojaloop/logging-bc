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

"use strict";

import { ILogger, LogLevel, LogEntry } from "@mojaloop/logging-bc-public-types-lib";
import {DefaultLogger} from "./default_logger";
import {
  MLKafkaRawProducer,
  MLKafkaRawProducerOptions
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib";
import Transport from "winston-transport";
import Winston from "winston";


let globalKafkaLoggerTransport: KafkaLoggerTransport| null = null;

class KafkaLoggerTransport extends Transport {
  _producerOptions: MLKafkaRawProducerOptions;
  _kafkaProducer: MLKafkaRawProducer;
  _kafkaTopic: string;
  _ready = false;

  constructor(opts:{producerOptions: MLKafkaRawProducerOptions, kafkaTopic: string}) {
    super();

    if(!opts.producerOptions.producerClientId){
        /* istanbul ignore next */
      opts.producerOptions.producerClientId = "KafkaLoggerTransport_"+Math.random().toString(36).slice(2, 7);
    }

    this._producerOptions = opts.producerOptions;
    this._kafkaTopic = opts.kafkaTopic;
    this._kafkaProducer = new MLKafkaRawProducer(this._producerOptions);
  }

  async start(): Promise<void>{
    await this._kafkaProducer.connect();
  }

  async stop(): Promise<void> {
    return this._kafkaProducer.destroy();
  }

  private async _log(info:Winston.LogEntry): Promise<void>{
    const logEntry : LogEntry = {
      level: info.level as LogLevel,
      bcName: info.bcName,
      appName: info.appName,
      appVersion: info.appVersion,
      timestamp: info.timestamp,
      message: info.message,
      component: info.componentName,
      meta: info.extra
    };

    await this._kafkaProducer.send({
      topic: this._kafkaTopic,
      value: logEntry,
      key: null,
      headers: []
    });
  }

  log(info:Winston.LogEntry, callback:() => void){
    this._log(info).then(()=>{
      callback();
    });
  }
}


export class KafkaLogger extends DefaultLogger implements ILogger{
  _producerOptions: MLKafkaRawProducerOptions;
  _kafkaTopic: string;
  _kafkaTransport: KafkaLoggerTransport;
  _ready = false;

  constructor (bcName:string, appName:string, appVersion:string,
               producerOptions: MLKafkaRawProducerOptions,
               kafkaTopic : string,
               level: LogLevel = LogLevel.INFO,
               loggerInstance?:Winston.Logger
  ) {
    super(bcName, appName, appVersion, level);

    if(!loggerInstance) {
      if (!globalKafkaLoggerTransport) {
        globalKafkaLoggerTransport = new KafkaLoggerTransport({
          producerOptions,
          kafkaTopic
        });
      }
      this._kafkaTransport = globalKafkaLoggerTransport;

      this._logger.add(this._kafkaTransport);
    }else{
      this._logger = loggerInstance;
    }
  }


  createChild(componentName:string):KafkaLogger{
    const childWinstonLogger = this._logger.child({componentName});
    const childILogger = new KafkaLogger(this._bcName, this._appName, this._appVersion, this._producerOptions, this._kafkaTopic, this._logLevel, childWinstonLogger);
    // childILogger._componentName = componentName;
    return childILogger;
  }

  /**
   * @deprecated - use init() instead
   */
  /* istanbul ignore next */
  async start() : Promise<void>  {
    return this.init();
  }

  async init() : Promise<void>  {
    await this._kafkaTransport.start();
  }

  async destroy() : Promise<void>  {
    await this._logger.end();
    return await this._kafkaTransport.stop();
  }

}
