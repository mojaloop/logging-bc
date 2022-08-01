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

import {LogEntry, LogLevel} from "@mojaloop/logging-bc-public-types-lib"
import {
  MLKafkaConsumer,
  MLKafkaConsumerOptions,
  MLKafkaConsumerOutputType,
  MLKafkaProducerOptions
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib"

import {DefaultLogger, KafkaLogger } from "@mojaloop/logging-bc-client-lib";
import {ElasticsearchLogStorage} from "../../src/infrastructure/es_log_storage";
import {LogEventHandler} from "../../dist/application/log_event_handler";
import { Client } from "@elastic/elasticsearch";

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib-integration-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;
const ES_LOGS_INDEX = "mjl-logging";
const TOPIC_NAME = "logging-svc-integration-tests-logs-topic";

let producerOptions: MLKafkaProducerOptions;
let kafkaConsumer: MLKafkaConsumer;

let consumerOptions: MLKafkaConsumerOptions;
let elasticStorage:ElasticsearchLogStorage;

let logEvtHandlerForES:LogEventHandler;
let kafkaLogger : KafkaLogger;
const defaultLogger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);


describe("nodejs-rdkafka-log-bc", () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    producerOptions = {
      kafkaBrokerList: "localhost:9092",
    }

    kafkaLogger = new KafkaLogger(
            BC_NAME,
            APP_NAME,
            APP_VERSION,
            producerOptions,
            TOPIC_NAME,
            LOGLEVEL
    );
    await kafkaLogger.start();

    // Command Handler
    consumerOptions = {
      kafkaBrokerList: "localhost:9092",
      kafkaGroupId: "test_consumer_group",
      outputType: MLKafkaConsumerOutputType.Json
    };
  })

  afterAll(async () => {
    // Cleanup
    await kafkaLogger.destroy()
    logEvtHandlerForES.destroy();
  })

  test("produce and consume log-bc using kafka and elasticsearch", async () => {
    // Startup Handler
    //Elastic
    const elasticOpts = { node: "https://localhost:9200",
      auth: {
        username: "elastic",
        password: process.env.elasticsearch_password || "123@Edd!1234SS",
      },
      tls: {
        ca: process.env.elasticsearch_certificate,
        rejectUnauthorized: false,
      }
    };
    elasticStorage = new ElasticsearchLogStorage(elasticOpts, ES_LOGS_INDEX, defaultLogger);
    logEvtHandlerForES = new LogEventHandler(defaultLogger, elasticStorage, consumerOptions, TOPIC_NAME);
    await logEvtHandlerForES.init();

    await kafkaLogger.info("Logger message. Hello World! Info.");
    await kafkaLogger.debug("Logger message. Hello World! Debug.");
    await kafkaLogger.warn("Logger message. Hello World! Warn.");
    await new Promise(f => setTimeout(f, 2000));

    const esClient = new Client(elasticOpts);
    const result = await esClient.search({
      index: "mjl-logging",
      query: {
        match: {
          level: "debug"
        }
      }
    });

    expect(result.hits.hits.length).toBeGreaterThan(0);

    await esClient.close();
    await logEvtHandlerForES.destroy();
  })
})
