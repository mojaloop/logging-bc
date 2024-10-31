"use strict";

import {ILogger, LogEntry, LogEntryPB, LogLevel} from "@mojaloop/logging-bc-public-types-lib";

import {Service} from "../../src/application/service";
import {StorageMock} from "./mocks/log_storage_mock";
import { ProtoBuffConsumerMock } from "./mocks/protobuff_consumer_mock";
import { MessageTypes } from "@mojaloop/platform-shared-lib-messaging-types-lib";

let logger: ILogger;
let mockStorage: StorageMock;
let kafkaConsumer: ProtoBuffConsumerMock;

describe("Main logging-svc tests", () => {

    beforeAll(async () => {
        mockStorage = new StorageMock();
        kafkaConsumer = new ProtoBuffConsumerMock();

        await Service.start(
            undefined,
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
        const logEntry = new LogEntryPB({
            level: 1,
            bcName: "bcNameTest",
            appName: "appNameTest",
            appVersion: "appVersionTest",
            timestamp: new Date().getTime(),
        });

        const serializedLogEntry = logEntry.serializeBinary();

        kafkaConsumer.injectMessage({
            msgType: MessageTypes.DOMAIN_EVENT,
            msgName: "",
            msgId: "",
            msgTimestamp: 0,
            msgTopic: "",
            msgKey: null,
            msgPartition: null,
            msgOffset: null,
            payload: {
                event: serializedLogEntry
            },
            fspiopOpaqueState: undefined
        });

        expect(mockStorage.entries.length).toEqual(1);
    })


    test('Test inject a bad log message', async () => {
        kafkaConsumer.injectMessage({
            msgType: MessageTypes.DOMAIN_EVENT,
            msgName: "",
            msgId: "",
            msgTimestamp: 0,
            msgTopic: "",
            msgKey: null,
            msgPartition: null,
            msgOffset: null,
            payload: undefined,
            fspiopOpaqueState: undefined
        });

        // it was 1 in the previous test, so should not change
        expect(mockStorage.entries.length).toEqual(1);
    });

    test("stop service should resolve", async()=>{
        // Arrange
        const result = Service.stop();

        // Act and Assert
        expect(result).resolves;
    });

    // test("start server with default options should throw error with no infrastructure", async ()=>{
    //     // Arrange
    //     const result = Service.start();

    //     // Act and Assert
    //     await expect(result).rejects.toThrowError();
    // });
})
