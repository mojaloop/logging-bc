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
import {LogEventHandler} from "./log_event_handler";
import {LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {ElasticsearchLogStorage} from "../infrastructure/es_log_storage";
import {DefaultLogger} from "@mojaloop/logging-bc-client-lib";

const BC_NAME = "logging-bc";
const APP_NAME = "logging-svc";
const APP_VERSION = process.env.npm_package_version || "0.0.1";
const LOGLEVEL = LogLevel.DEBUG;

const KAFKA_LOGS_TOPIC = "logs";

const ELASTICSEARCH_LOGS_INDEX =  process.env["ELASTICSEARCH_LOGS_INDEX"] || "mjl-logging";
const ELASTICSEARCH_USERNAME =  process.env["ELASTICSEARCH_USERNAME"] || "elastic";
const ELASTICSEARCH_PASSWORD =  process.env["ELASTICSEARCH_PASSWORD"] ||  "123@Edd!1234SS";

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";
const ELASTICSEARCH_URL = process.env["ELASTICSEARCH_URL"] || "https://localhost:9200";


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

const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);
let logHandler:LogEventHandler;


async function start():Promise<void> {
    const storage = new ElasticsearchLogStorage(elasticOpts, ELASTICSEARCH_LOGS_INDEX, logger);

    logHandler = new LogEventHandler(logger, storage, KAFKA_URL, `${BC_NAME}_${APP_NAME}`, KAFKA_LOGS_TOPIC);

    await logHandler.init().catch((err) => {
        logger.error("logHandler init error", err);
    });

    logger.info("logHandler initialised");
}

async function _handle_int_and_term_signals(signal: NodeJS.Signals): Promise<void> {
    logger.info(`Service - ${signal} received - cleaning up...`);
    process.exit();
}

//catches ctrl+c event
process.on("SIGINT", _handle_int_and_term_signals.bind(this));
//catches program termination event
process.on("SIGTERM", _handle_int_and_term_signals.bind(this));

//do something when app is closing
process.on("exit", () => {
    logger.info("Microservice - exiting...");
    logHandler.destroy();
});


start();
