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
import process from "process";
import {LogEventHandler} from "./log_event_handler";
import {ILogStorageAdapter} from "./interfaces";
import {ILogger, LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {ElasticsearchLogStorage} from "../infrastructure/es_log_storage";
import {DefaultLogger} from "@mojaloop/logging-bc-client-lib";
import {IRawMessageConsumer, MLKafkaProtoBuffConsumer, MLKafkaRawConsumer, MLKafkaRawConsumerOptions } from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib";
import { IMessageConsumer } from "@mojaloop/platform-shared-lib-messaging-types-lib";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require("../../package.json");
const BC_NAME = "logging-bc";
const APP_NAME = "logging-svc";
const APP_VERSION = packageJSON.version;
// const PRODUCTION_MODE = process.env["PRODUCTION_MODE"] || false;
const LOG_LEVEL:LogLevel = process.env["LOG_LEVEL"] as LogLevel || LogLevel.DEBUG;

const KAFKA_LOGS_TOPIC = process.env["KAFKA_LOGS_TOPIC"] || "logs";

const ELASTICSEARCH_URL = process.env["ELASTICSEARCH_URL"] || "https://localhost:9200";
const ELASTICSEARCH_LOGS_INDEX =  process.env["ELASTICSEARCH_LOGS_INDEX"] || "ml-logging";
const ELASTICSEARCH_USERNAME =  process.env["ELASTICSEARCH_USERNAME"] || "elastic";
const ELASTICSEARCH_PASSWORD =  process.env["ELASTICSEARCH_PASSWORD"] ||  "elasticSearchPas42";

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";
const KAFKA_AUTH_ENABLED = process.env["KAFKA_AUTH_ENABLED"] && process.env["KAFKA_AUTH_ENABLED"].toUpperCase()==="TRUE" || false;
const KAFKA_AUTH_PROTOCOL = process.env["KAFKA_AUTH_PROTOCOL"] || "sasl_plaintext";
const KAFKA_AUTH_MECHANISM = process.env["KAFKA_AUTH_MECHANISM"] || "plain";
const KAFKA_AUTH_USERNAME = process.env["KAFKA_AUTH_USERNAME"] || "user";
const KAFKA_AUTH_PASSWORD = process.env["KAFKA_AUTH_PASSWORD"] || "password";

const CONSUMER_BATCH_SIZE = (process.env["CONSUMER_BATCH_SIZE"] && parseInt(process.env["CONSUMER_BATCH_SIZE"])) || 100;
const CONSUMER_BATCH_TIMEOUT_MS = (process.env["CONSUMER_BATCH_TIMEOUT_MS"] && parseInt(process.env["CONSUMER_BATCH_TIMEOUT_MS"])) || 1000;

const SERVICE_START_TIMEOUT_MS= (process.env["SERVICE_START_TIMEOUT_MS"] && parseInt(process.env["SERVICE_START_TIMEOUT_MS"])) || 60_000;

let globalLogger: ILogger;

export class Service {
    static logger: ILogger;
    static logStorageAdapter: ILogStorageAdapter;
    static logHandler: LogEventHandler;
    static consumer: IMessageConsumer;
    static startupTimer: NodeJS.Timeout;

    static async start(
        logger?: ILogger,
        logStorageAdapter?:ILogStorageAdapter,
        kafkaConsumer?: IMessageConsumer
    ): Promise<void>{
        console.log(`Service starting with PID: ${process.pid}`);

        this.startupTimer = setTimeout(()=>{
            throw new Error("Service start timed-out");
        }, SERVICE_START_TIMEOUT_MS);

        if (!logger) {
            logger = new DefaultLogger(
                    BC_NAME,
                    APP_NAME,
                    APP_VERSION,
                    LOG_LEVEL
            );
        }
        globalLogger = this.logger = logger;

        /* istanbul ignore if */
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
            logStorageAdapter = new ElasticsearchLogStorage(elasticOpts, ELASTICSEARCH_LOGS_INDEX, this.logger);
        }
        this.logStorageAdapter = logStorageAdapter;


        /* istanbul ignore if */
        if(!kafkaConsumer){
            const kafkaConsumerOptions: MLKafkaRawConsumerOptions = {
                kafkaBrokerList: KAFKA_URL,
                kafkaGroupId: `${BC_NAME}_${APP_NAME}`,
                batchSize: CONSUMER_BATCH_SIZE,
                batchTimeoutMs: CONSUMER_BATCH_TIMEOUT_MS
            };
            if(KAFKA_AUTH_ENABLED){
                kafkaConsumerOptions.authentication = {
                    protocol: KAFKA_AUTH_PROTOCOL as "plaintext" | "ssl" | "sasl_plaintext" | "sasl_ssl",
                    mechanism: KAFKA_AUTH_MECHANISM as "PLAIN" | "GSSAPI" | "SCRAM-SHA-256" | "SCRAM-SHA-512",
                    username: KAFKA_AUTH_USERNAME,
                    password: KAFKA_AUTH_PASSWORD
                };
            }

            kafkaConsumer = new MLKafkaProtoBuffConsumer(kafkaConsumerOptions, this.logger);
        }
        this.consumer = kafkaConsumer;

        // create the handler instance
        this.logHandler = new LogEventHandler(this.logger, this.logStorageAdapter, this.consumer, KAFKA_LOGS_TOPIC);

        await this.logHandler.init();

        this.logger.info(`Logging Handler service v: ${APP_VERSION} initialised`);

        // remove startup timeout
        clearTimeout(this.startupTimer);
    }

    static async stop(force = false): Promise<void> {
        if (this.consumer){
            await this.consumer.stop();
            await this.consumer.disconnect(force);
        }

        if (this.logHandler)  await this.logHandler.destroy();
        if (this.logStorageAdapter) await this.logStorageAdapter.destroy();
        if (this.consumer) await this.consumer.destroy(force);
    }
}


/**
 * process termination and cleanup
 */

/* istanbul ignore next */
async function _handle_int_and_term_signals(signal: NodeJS.Signals): Promise<void> {
    console.log(`Service - ${signal} received - cleaning up...`);
    await Service.stop(true);
    process.exit();
}

//catches ctrl+c event
/* istanbul ignore next */
process.on("SIGINT", _handle_int_and_term_signals);

//catches program termination event
/* istanbul ignore next */
process.on("SIGTERM", _handle_int_and_term_signals);

//do something when app is closing
/* istanbul ignore next */
process.on("exit", async () => {
    globalLogger.info("Microservice - exiting...");
});

/* istanbul ignore next */
process.on("uncaughtException", (err: Error) => {
    globalLogger.error(err);
});

// Trying to understand:
// (node:40) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 abort listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit
process.on("warning", e => console.warn(e.stack));
