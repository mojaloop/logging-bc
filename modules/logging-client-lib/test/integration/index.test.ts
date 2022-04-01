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

import {
  MLKafkaConsumer,
  MLKafkaConsumerOptions,
  MLKafkaConsumerOutputType,
  MLKafkaProducerOptions
} from '@mojaloop/platform-shared-lib-nodejs-kafka-client-lib'

import {ConsoleLogger} from "@mojaloop/logging-bc-logging-client-lib";
import {IMessage} from '@mojaloop/platform-shared-lib-messaging-types-lib'
import {LogEntry, LogLevel} from "@mojaloop/logging-bc-logging-types-lib";
import {MLKafkaLoggerDispatcher} from "../../src/logger_kafka_dispatcher";

//jest.setTimeout(30000); // change this to suit the test (ms)

const logger: ConsoleLogger = new ConsoleLogger()

let producerOptions: MLKafkaProducerOptions
let kafkaConsumer: MLKafkaConsumer
let consumerOptions: MLKafkaConsumerOptions

let logDispatch : MLKafkaLoggerDispatcher;

const TOPIC_NAME = 'nodejs-rdkafka-client-integration-test-log-bc-topic'

describe('nodejs-rdkafka-log-bc', () => {

  beforeAll(async () => {
    producerOptions = {
      kafkaBrokerList: 'localhost:9092',
      producerClientId: 'test_producer'
    }
    logDispatch = new MLKafkaLoggerDispatcher(producerOptions, TOPIC_NAME, LogLevel.TRACE);
    await logDispatch.start()

    consumerOptions = {
      kafkaBrokerList: 'localhost:9092',
      kafkaGroupId: 'test_consumer_group',
      outputType: MLKafkaConsumerOutputType.Json
    }

    kafkaConsumer = new MLKafkaConsumer(consumerOptions, logger)
  })

  afterAll(async () => {
    // Cleanup
    await logDispatch.destroy()
    await kafkaConsumer.destroy(false)
  })

  test('produce and consume log-bc using kafka', async () => {
    let receivedMessages = 0;
    async function handleLogMsg (message: IMessage): Promise<void> {
      receivedMessages++
      logger.debug(`Got log message in handler: ${JSON.stringify(message, null, 2)}`)
      return await Promise.resolve()
    }

    kafkaConsumer.setCallbackFn(handleLogMsg)
    kafkaConsumer.setTopics([TOPIC_NAME])
    await kafkaConsumer.connect()
    await kafkaConsumer.start()

    await logDispatch.debug('Logger message. Hello World! Lets debug.')
    await logDispatch.info('Logger message. Hello World! Lets info.')

    // Wait 1 second to receive the event
    await new Promise(f => setTimeout(f, 1000));

    expect(receivedMessages).toEqual(2)
  })
})
