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

import {Service} from "../../packages/logging-svc/src/application/service";
import {LogEntry, LogLevel} from "../../packages/public-types-lib/src"
import {
    MLKafkaRawConsumer,
    MLKafkaRawConsumerOptions,
    MLKafkaRawConsumerOutputType,
    MLKafkaRawProducerOptions
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib"

// import {DefaultLogger, KafkaLogger} from "@mojaloop/logging-bc-client-lib";
import {DefaultLogger, KafkaLogger} from "../../packages/client-lib/src";
import {ElasticsearchLogStorage} from "../../packages/logging-svc/src/infrastructure/es_log_storage";
import {LogEventHandler} from "../../packages/logging-svc/src/application/log_event_handler";
import {Client} from "@elastic/elasticsearch";

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib-integration-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;
const ES_LOGS_INDEX = "ml-logging";
const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";
const ELASTICSEARCH_URL = process.env["ELASTICSEARCH_URL"] || "https://localhost:9200";

const KAFKA_LOGS_TOPIC = process.env["KAFKA_LOGS_TOPIC"] || "logging-svc-integration-tests-logs-topic";

let producerOptions: MLKafkaRawProducerOptions;


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

describe("nodejs-rdkafka-log-bc", () => {

    beforeAll(async () => {
        producerOptions = {
            kafkaBrokerList: KAFKA_URL,
        }



        // Command Handler
        consumerOptions = {
            kafkaBrokerList: KAFKA_URL,
            kafkaGroupId: "test_consumer_group",
            outputType: MLKafkaRawConsumerOutputType.Json
        };

        elasticStorage = new ElasticsearchLogStorage(elasticOpts, ES_LOGS_INDEX, defaultLogger);

        await Service.start();
        console.log("Service start complete");
    })

    afterAll(async () => {
        // Cleanup
        await new Promise(f => setTimeout(f, 1000));
        await Service.stop();
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
    })
})
