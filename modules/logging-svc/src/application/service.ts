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

 * Crosslake
 - Pedro Sousa Barreto <pedrob@crosslaketech.com>

 --------------
 ******/

"use strict";
import {ILogStorageAdapter, LogEventHandler} from "./log_event_handler";
import {ILogger, LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {ElasticsearchLogStorage} from "../infrastructure/es_log_storage";
import {DefaultLogger} from "@mojaloop/logging-bc-client-lib";

const BC_NAME = "logging-bc";
const APP_NAME = "logging-svc";
const APP_VERSION = process.env.npm_package_version || "0.0.1";
const PRODUCTION_MODE = process.env["PRODUCTION_MODE"] || false;
const LOG_LEVEL:LogLevel = process.env["LOG_LEVEL"] as LogLevel || LogLevel.DEBUG;

const KAFKA_LOGS_TOPIC = "logs";

const ELASTICSEARCH_URL = process.env["ELASTICSEARCH_URL"] || "https://localhost:9200";
const ELASTICSEARCH_LOGS_INDEX =  process.env["ELASTICSEARCH_LOGS_INDEX"] || "ml-logging";
const ELASTICSEARCH_USERNAME =  process.env["ELASTICSEARCH_USERNAME"] || "elastic";
const ELASTICSEARCH_PASSWORD =  process.env["ELASTICSEARCH_PASSWORD"] ||  "elasticSearchPas42";

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";


let globalLogger: ILogger;

export class Service {
    static logger: ILogger;
    static logStorageAdapter: ILogStorageAdapter;
    static logHandler: LogEventHandler;

    static async start(
        logger?: ILogger,
        logStorageAdapter?:ILogStorageAdapter
    ): Promise<void>{
        if (!logger) {
            logger = new DefaultLogger(
                    BC_NAME,
                    APP_NAME,
                    APP_VERSION,
                    LOG_LEVEL
            );
        }
        globalLogger = this.logger = logger;


        if(!logStorageAdapter){
            const elasticOpts = {
                node: ELASTICSEARCH_URL,
                auth: {
                    username: process.env.ES_USERNAME || ELASTICSEARCH_USERNAME,
                    password: process.env.ES_PASSWORD || ELASTICSEARCH_PASSWORD,
                },
                tls: {
                    ca: process.env.elasticsearch_certificate,
                    rejectUnauthorized: false,
                }
            };
            logStorageAdapter = new ElasticsearchLogStorage(elasticOpts, ELASTICSEARCH_LOGS_INDEX, logger);
        }
        this.logStorageAdapter = logStorageAdapter;


        this.logHandler = new LogEventHandler(logger, this.logStorageAdapter, KAFKA_URL, `${BC_NAME}_${APP_NAME}`, KAFKA_LOGS_TOPIC);

        await this.logHandler.init().catch((err) => {
            this.logger.error("logHandler init error", err);
        });

        this.logger.info("logHandler initialised");
    }

    static async stop(force = false): Promise<void> {
        if (this.logHandler)  await this.logHandler.destroy();
        if (this.logStorageAdapter) await this.logStorageAdapter.destroy();
    }
}


/**
 * process termination and cleanup
 */

async function _handle_int_and_term_signals(signal: NodeJS.Signals): Promise<void> {
    console.info(`Service - ${signal} received - cleaning up...`);
    await Service.stop(true);
    process.exit();
}

//catches ctrl+c event
process.on("SIGINT", _handle_int_and_term_signals);
//catches program termination event
process.on("SIGTERM", _handle_int_and_term_signals);

//do something when app is closing
process.on("exit", async () => {
    globalLogger.info("Microservice - exiting...");
});
process.on("uncaughtException", (err: Error) => {
    globalLogger.error(err);
});
