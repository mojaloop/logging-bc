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
 should be listed with a "*" in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a "-". Email address can be added
 optionally within square brackets <email>.

 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Coil
 - Jason Bruwer <jason.bruwer@coil.com>

 --------------
 ******/

"use strict"

import {
    IRawMessage,
    MLKafkaRawConsumer,
    MLKafkaRawConsumerOptions,
    MLKafkaRawConsumerOutputType,
    MLKafkaRawProducerOptions
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib";

import {Service} from "../../packages/logging-svc/src/application/service"
import {ConsoleLogger, ILogger, LogLevel} from "../../packages/public-types-lib/src/index";
import {DefaultLogger, KafkaLogger} from "../../packages/client-lib/src/index";
import {ElasticsearchLogStorage} from "../../packages/logging-svc/src/infrastructure/es_log_storage";
import {Client} from "@elastic/elasticsearch";
import exp = require("constants");

jest.setTimeout(30000); // change this to suit the test (ms)

const logger: ConsoleLogger = new ConsoleLogger();

let producerOptions: MLKafkaRawProducerOptions;

let kafkaLogger: KafkaLogger;
let defaultlogger: DefaultLogger

const BC_NAME = "logging-bc";
const APP_NAME = "logging-bc-integration-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";

const KAFKA_LOGS_TOPIC = process.env["KAFKA_LOGS_TOPIC"] || "logs";
const ES_LOGS_INDEX = "ml-logging";
const ELASTICSEARCH_URL = process.env["ELASTICSEARCH_URL"] || "https://localhost:9200";


let consumerOptions: MLKafkaRawConsumerOptions;

let elasticStorage: ElasticsearchLogStorage;
jest.setTimeout(300000);

const defaultLogger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

const elasticOpts = {
    node: ELASTICSEARCH_URL,
    auth: {
        username: "elastic",
        password: process.env.elasticsearch_password || "elasticSearchPas42",
    },
    tls: {
        ca: process.env.elasticsearch_certificate,
        rejectUnauthorized: false,
    }
};

function log(logger: ILogger, testObj: any) {
    logger.trace(`${logger.getLogLevel()} - hello world from trace`, testObj);
    logger.debug(`${logger.getLogLevel()} - hello world from debug`, testObj);
    logger.info(`${logger.getLogLevel()} - hello world from info`, testObj);
    logger.warn(`${logger.getLogLevel()} - hello world from warn`, testObj);
    logger.error(`${logger.getLogLevel()} - hello world from error`, testObj);
    logger.fatal(`${logger.getLogLevel()} - hello world from fatal`, testObj);
}


describe("logging-bc-integration-tests", () => {

    beforeAll(async () => {
        producerOptions = {
            kafkaBrokerList: KAFKA_URL,
            producerClientId: APP_NAME
        }

        kafkaLogger = new KafkaLogger(BC_NAME, APP_NAME, APP_VERSION, producerOptions, KAFKA_LOGS_TOPIC, LogLevel.TRACE);
        await kafkaLogger.init();
        defaultlogger = new DefaultLogger(BC_NAME,APP_NAME,APP_VERSION);

        // Command Handler
        consumerOptions = {
            kafkaBrokerList: KAFKA_URL,
            kafkaGroupId: "test_consumer_group",
            outputType: MLKafkaRawConsumerOutputType.Json
        };

        elasticStorage = new ElasticsearchLogStorage(elasticOpts, ES_LOGS_INDEX, defaultLogger);
        await Service.start();
        console.log("Service start complete");
    });

    afterAll(async () => {
        // Cleanup
        await new Promise(f => setTimeout(f, 1000));
        await kafkaLogger.destroy();
        await Service.stop();
    });

    test("produce and consume logs using the KafkaLogger", async () => {
        jest.setTimeout(1000)
        let receivedMessages = 0;

        async function handleLogMsg(message: IRawMessage): Promise<void> {
            receivedMessages++;
            logger.debug(`Got log message in handler: ${JSON.stringify(message.value, null, 2)}`);
            return await Promise.resolve();
        }

        let kafkaConsumer: MLKafkaRawConsumer;
        let consumerOptions: MLKafkaRawConsumerOptions;
        consumerOptions = {
            kafkaBrokerList: KAFKA_URL,
            kafkaGroupId: APP_NAME,
            outputType: MLKafkaRawConsumerOutputType.Json
        };

        kafkaConsumer = new MLKafkaRawConsumer(consumerOptions, logger);

        kafkaConsumer.setCallbackFn(handleLogMsg);
        kafkaConsumer.setTopics([KAFKA_LOGS_TOPIC]);
        await kafkaConsumer.connect();
        await kafkaConsumer.startAndWaitForRebalance();
        // await new Promise(f => setTimeout(f, 2000));

        await kafkaLogger.trace("Logger message. Hello World! Lets trace.");
        await kafkaLogger.debug("Logger message. Hello World! Lets debug.");
        await kafkaLogger.info("Logger message. Hello World! Lets info.");
        await kafkaLogger.warn("Logger message. Hello World! Lets warn.");
        await kafkaLogger.error("Logger message. Hello World! Lets error.");
        await kafkaLogger.fatal("Logger message. Hello World! Lets fatal.");

        // Wait 10 second to receive the event
        await new Promise(f => setTimeout(f, 5000));

        expect(receivedMessages).toBeGreaterThanOrEqual(6);

        await kafkaConsumer.stop();
        await kafkaConsumer.disconnect();
    });

    test("error object tests", async () => {

        const err1 = new Error("Error object message - style 1");
        console.log("\r\n*** Error logging output for style 1: logger.error(msg, err) follows ***");
        kafkaLogger.error("An error occurred", err1);

        const err2 = new Error("Error object message - style 2");
        console.log("\r\n*** Error logging output for style 2: logger.error(err, err) follows ***");
        kafkaLogger.error("An error occurred", err2);

        await expect(true);
    });

    test("child logger tests", async () => {

        const childLogger = kafkaLogger.createChild("subcomponent");

        console.log("\r\n*** Child logger output follows ***");

        log(childLogger, {});

        await expect(true);
    });

    test("Client-lib: check log level TRACE", async()=>{
        // Arrange
        defaultlogger.setLogLevel(LogLevel.TRACE);

        // Assert
        expect(defaultlogger.isTraceEnabled()).toBeTruthy();
    });

    test("Client-lib: check log level DEBUG", async ()=>{
        // Arrange
        defaultlogger.setLogLevel(LogLevel.DEBUG);

        // Assert
        expect(defaultlogger.isDebugEnabled()).toBeTruthy();
    });

    test("produce and consume log-bc using kafka and elasticsearch", async () => {
        const kafkaLogger = new KafkaLogger(
            BC_NAME,
            APP_NAME,
            APP_VERSION,
            producerOptions,
            KAFKA_LOGS_TOPIC,
            LOGLEVEL
        );
        await kafkaLogger.init();
        // await kafkaLogger.info("Logger message. Hello World! Info.");
        await kafkaLogger.debug("Logger message. Hello World! Debug.");
        // await kafkaLogger.warn("Logger message. Hello World! Warn.");
        await new Promise(f => setTimeout(f, 4000));

        const esClient = new Client(elasticOpts);
        const result = await esClient.search({
            index: "ml-logging",
            query: {
                match: {
                    level: "debug"
                }
            }
        })

        expect(result.hits.hits.length).toBeGreaterThan(0);

        await esClient.close();
        await kafkaLogger.destroy();
    });

    test("public-types-lib: ConsoleLogger create a child logger from a console logger should pass", async ()=>{
        const consoleLogger: ConsoleLogger = new ConsoleLogger();
        consoleLogger.setLogLevel(LOGLEVEL);
        expect(consoleLogger.createChild(BC_NAME)).resolves;
    });

    test("public-types-lib: ConsoleLogger get LogLevel should pass", async ()=>{
        const consoleLogger: ConsoleLogger = new ConsoleLogger();
        consoleLogger.setLogLevel(LOGLEVEL);
        expect(consoleLogger.getLogLevel()).toEqual(LOGLEVEL);
    });

    test("public-types-lib: ConsoleLogger check LogLevel", async ()=>{
        const consoleLogger: ConsoleLogger = new ConsoleLogger();
        consoleLogger.setLogLevel(LOGLEVEL);
        expect(consoleLogger.isDebugEnabled()).toBeTruthy();
        expect(consoleLogger.isErrorEnabled()).toBeTruthy();
        expect(consoleLogger.isWarnEnabled()).toBeTruthy();
        expect(consoleLogger.isFatalEnabled()).toBeTruthy();
        expect(consoleLogger.isTraceEnabled()).toBeTruthy();
    });
});
