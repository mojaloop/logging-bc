"use strict"

import {DefaultLogger} from "../../src/index";
import {LogLevel} from "@mojaloop/logging-bc-public-types-lib";

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib-unit-tests";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;


function log(logger: DefaultLogger, testObj: any) {
	logger.trace(`${logger.getLogLevel()} - hello world from trace`, testObj);
	logger.debug(`${logger.getLogLevel()} - hello world from debug`, testObj);
	logger.info(`${logger.getLogLevel()} - hello world from info`, testObj);
	logger.warn(`${logger.getLogLevel()} - hello world from warn`, testObj);
	logger.error(`${logger.getLogLevel()} - hello world from error`, testObj);
	logger.fatal(`${logger.getLogLevel()} - hello world from fatal`, testObj);
}

describe("default logger tests", () => {

	beforeEach(async () => {
		// Setup
	})

	afterEach(async () => {
		// Cleanup
	})

    test("constructor test", async () => {
        const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LogLevel.ERROR);
    });

	test("loglevel tests", async () => {
		const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

		const testObj: any = {
			key: "this is the key",
			value: "this is the value"
		}

		console.log("*** default is TRACE ***");
		log(logger, testObj);

		console.log("*** change to DEBUG ***");
		logger.setLogLevel(LogLevel.DEBUG);
		log(logger, testObj);

		console.log("*** change to INFO ***");
		logger.setLogLevel(LogLevel.INFO);
		log(logger, testObj);

		console.log("*** change to WARN ***");
		logger.setLogLevel(LogLevel.WARN);
		log(logger, testObj);

		console.log("*** change to ERROR ***");
		logger.setLogLevel(LogLevel.ERROR);
		log(logger, testObj);

		console.log("*** change to FATAL ***");
		logger.setLogLevel(LogLevel.FATAL);
		log(logger, testObj);

		await expect(true);
	})

	test("DefaultLogger - error object tests", async () => {
		const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

		const err1 = new Error("Error object message - style 1");
		console.log("\r\n*** Error logging output for style 1: logger.error(msg, err) follows ***");
		logger.error("An error occurred", err1);

		const err2 = new Error("Error object message - style 2");
		console.log("\r\n*** Error logging output for style 2: logger.error(err, err) follows ***");
		logger.error("An error occurred", err2);

		await expect(true);
	})

	test("DefaultLogger - child logger meta is object", async () => {
		const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

		const childLogger = logger.createChild("subcomponent");

		console.log("\r\n*** Child logger output follows ***");

		log(childLogger, {});

		await expect(true);
	})

	test("DefaultLogger - child logger meta is array", async () => {
		const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

		const childLogger = logger.createChild("subcomponent");

		console.log("\r\n*** Child logger output follows ***");

		log(childLogger, [1,2]);

		await expect(true);
	})


	test("DefaultLogger - child logger multiple metas", async () => {
		const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION, LOGLEVEL);

		const childLogger = logger.createChild("subcomponent");

		console.log("\r\n*** Child logger output follows ***");

		childLogger.debug(childLogger, ["a", "b"], [1,2]);

		await expect(true);
	});

    test("constructor test with no log level provided", async () => {
        const logger = new DefaultLogger(BC_NAME, APP_NAME, APP_VERSION);
    });

})
