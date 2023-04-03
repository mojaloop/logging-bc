"use strict";

import {DefaultLogger} from "@mojaloop/logging-bc-client-lib";
import {ILogger, LogEntry, LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {Service} from "../../src/application/service";
import {KafkaConsumerMock} from "./mocks/kafka_consumer_mock";
import {StorageMock} from "./mocks/log_storage_mock";

let logger: ILogger;
let mockStorage: StorageMock;
let kafkaConsumer: KafkaConsumerMock;

describe("Main logging-svc tests", () => {

    beforeAll(async () => {
        logger = new DefaultLogger(
            "logging-bc",
            "logging-svc",
            "0.0.0",
            LogLevel.DEBUG
        );

        mockStorage = new StorageMock();
        kafkaConsumer = new KafkaConsumerMock();

        Service.start(
            logger,
            mockStorage,
            kafkaConsumer
        ).then(() => {
            console.log("Service start complete");
        });
    })

    afterEach(async () => {
        // Cleanup
    })

    test('Test inject a log message', async () => {
        const logEntry: LogEntry = {
            level: LogLevel.INFO,
            bcName: "Logging BC",
            appName: "Logging Service",
            appVersion: "0.0.0",
            timestamp: Date.now(),
            meta: null,
            component: null,
            message: "log message"
        }

        kafkaConsumer.injectMessage({
            key: "1",
            timestamp: Date.now(),
            offset: 100,
            headers: [],
            topic: "logs",
            partition: 0,
            value: logEntry
        });

        expect(mockStorage.entries.length).toEqual(1);
    })


    test('Test inject a bad log message', async () => {
        kafkaConsumer.injectMessage({
            key: "1",
            timestamp: Date.now(),
            offset: 100,
            headers: [],
            topic: "logs",
            partition: 0,
            value: "bad error message value object"
        });

        // it was 1 in the previous test, so should not change
        expect(mockStorage.entries.length).toEqual(1);
    })
})
