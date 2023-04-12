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

import {ConsoleLogger, ILogger, LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {KafkaLogger} from "@mojaloop/logging-bc-client-lib";

jest.setTimeout(30000); // change this to suit the test (ms)

const logger: ConsoleLogger = new ConsoleLogger();

let producerOptions: MLKafkaRawProducerOptions;

let kafkaLogger: KafkaLogger;

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib-integration-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";

const KAFKA_LOGS_TOPIC = process.env["KAFKA_LOGS_TOPIC"] || "client-lib-integration-tests-logs-topic";

function log(logger: ILogger, testObj: any) {
    logger.trace(`${logger.getLogLevel()} - hello world from trace`, testObj);
    logger.debug(`${logger.getLogLevel()} - hello world from debug`, testObj);
    logger.info(`${logger.getLogLevel()} - hello world from info`, testObj);
    logger.warn(`${logger.getLogLevel()} - hello world from warn`, testObj);
    logger.error(`${logger.getLogLevel()} - hello world from error`, testObj);
    logger.fatal(`${logger.getLogLevel()} - hello world from fatal`, testObj);
}

describe("client-lib-integration-tests", () => {

    beforeAll(async () => {
        producerOptions = {
            kafkaBrokerList: KAFKA_URL,
            producerClientId: APP_NAME
        }

        kafkaLogger = new KafkaLogger(BC_NAME, APP_NAME, APP_VERSION, producerOptions, KAFKA_LOGS_TOPIC, LogLevel.TRACE);
        await kafkaLogger.init();
    })

    afterAll(async () => {
        // Cleanup
        await new Promise(f => setTimeout(f, 1000));
        await kafkaLogger.destroy();
    })

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
        await kafkaConsumer.start();
        await new Promise(f => setTimeout(f, 2000));

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
    })

    test("child logger tests", async () => {

        const childLogger = kafkaLogger.createChild("subcomponent");

        console.log("\r\n*** Child logger output follows ***");

        log(childLogger, {});

        await expect(true);
    })
})
