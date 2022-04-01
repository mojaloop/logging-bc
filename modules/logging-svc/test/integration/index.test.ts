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

import {LogEntry, LogLevel} from '@mojaloop/logging-bc-logging-types-lib'
import {
  MLKafkaConsumerOptions,
  MLKafkaConsumerOutputType,
  MLKafkaProducerOptions
} from '@mojaloop/platform-shared-lib-nodejs-kafka-client-lib'

import {ConsoleLogger, MLKafkaLoggerDispatcher} from "@mojaloop/logging-bc-logging-client-lib";
import {MLElasticsearchLogStorage} from "../../src/infrastructure/es_log_storage";
import {MLLogEventHandler} from "../../dist/application/log_event_handler";

const logger: ConsoleLogger = new ConsoleLogger()

let producerOptions: MLKafkaProducerOptions 
let consumerOptions: MLKafkaConsumerOptions

let logDispatch : MLKafkaLoggerDispatcher;

const TOPIC_NAME = 'nodejs-rdkafka-svc-integration-test-log-bc-topic'

describe('nodejs-rdkafka-log-bc', () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    // Client
    producerOptions = {
      kafkaBrokerList: 'localhost:9092',
      producerClientId: 'test_producer'
    }

    logDispatch = new MLKafkaLoggerDispatcher(producerOptions, TOPIC_NAME)
    await logDispatch.start();

    // Command Handler
    consumerOptions = {
      kafkaBrokerList: 'localhost:9092',
      kafkaGroupId: 'test_consumer_group',
      outputType: MLKafkaConsumerOutputType.Json
    }
  })

  afterAll(async () => {
    // Cleanup
    await logDispatch.destroy()
  })

  test('produce and consume log-bc using kafka and elasticsearch', async () => {
    // Startup Handler
    //Elastic
    const elasticStorage = new MLElasticsearchLogStorage(
        { node: 'https://localhost:9200',
          auth: {
            username: "elastic",
            password: process.env.elasticsearch_password || "123@Edd!1234SS",
          },
          tls: {
            ca: process.env.elasticsearch_certificate,
            rejectUnauthorized: false,
          }
        }
    );
    const logEvtHandlerForES = new MLLogEventHandler(logger, elasticStorage, consumerOptions, TOPIC_NAME);
    await logEvtHandlerForES.init();

    await logDispatch.info('Logger message. Hello World! Info.');
    await logDispatch.debug('Logger message. Hello World! Debug.');
    await new Promise(f => setTimeout(f, 2000));

    //TODO Test condition here... Perform a Search...

    await logEvtHandlerForES.destroy();
  })
})
