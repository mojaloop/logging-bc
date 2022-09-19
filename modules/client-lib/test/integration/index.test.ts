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
  MLKafkaConsumer,
  MLKafkaConsumerOptions,
  MLKafkaConsumerOutputType,
  MLKafkaProducerOptions
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib";


import {IMessage} from "@mojaloop/platform-shared-lib-messaging-types-lib"
import {ConsoleLogger, LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {KafkaLogger} from "../../src/kafka_logger";

//jest.setTimeout(30000); // change this to suit the test (ms)

const logger: ConsoleLogger = new ConsoleLogger();

let producerOptions: MLKafkaProducerOptions;
let kafkaConsumer: MLKafkaConsumer;
let consumerOptions: MLKafkaConsumerOptions;

let kafkaLogger : KafkaLogger;

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib-integration-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";

const TOPIC_NAME = "client-lib-integration-tests-logs-topic";

describe("client-lib-integration-tests", () => {

  beforeAll(async () => {
    producerOptions = {
      kafkaBrokerList: KAFKA_URL,
      producerClientId: APP_NAME
    }

    kafkaLogger = new KafkaLogger(BC_NAME, APP_NAME, APP_VERSION, producerOptions, TOPIC_NAME, LogLevel.TRACE);
    await kafkaLogger.init();

    consumerOptions = {
      kafkaBrokerList: KAFKA_URL,
      kafkaGroupId: APP_NAME,
      outputType: MLKafkaConsumerOutputType.Json
    };

    kafkaConsumer = new MLKafkaConsumer(consumerOptions, logger);
  })

  afterAll(async () => {
    // Cleanup
    await kafkaLogger.destroy();
    await kafkaConsumer.destroy(false);
  })

  test("produce and consume logs using the KafkaLogger", async () => {
    let receivedMessages = 0;
    async function handleLogMsg (message: IMessage): Promise<void> {
      receivedMessages++;
      logger.debug(`Got log message in handler: ${JSON.stringify(message, null, 2)}`);
      return await Promise.resolve();
    }

    kafkaConsumer.setCallbackFn(handleLogMsg);
    kafkaConsumer.setTopics([TOPIC_NAME]);
    await kafkaConsumer.connect();
    await kafkaConsumer.start();
    await new Promise(f => setTimeout(f, 100));

    await kafkaLogger.trace("Logger message. Hello World! Lets trace.");
    await kafkaLogger.debug("Logger message. Hello World! Lets debug.");
    await kafkaLogger.info("Logger message. Hello World! Lets info.");
    await kafkaLogger.warn("Logger message. Hello World! Lets warn.");
    await kafkaLogger.error("Logger message. Hello World! Lets error.");
    await kafkaLogger.fatal("Logger message. Hello World! Lets fatal.");

    // Wait 1 second to receive the event
    await new Promise(f => setTimeout(f, 1000));

    expect(receivedMessages).toBe(6);
  })
})
