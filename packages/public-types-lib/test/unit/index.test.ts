"use strict"

import {ConsoleLogger, ILogger, LogLevel} from "../../src/";


let logger: ILogger;

describe("ConsoleLogger tests", () => {

	beforeAll(() => {
		logger = new ConsoleLogger();
	});



	test("ConsoleLogger tests - createChild", async () => {
		const logger = new ConsoleLogger();
		logger.setLogLevel(LogLevel.FATAL);
		const child = logger.createChild("test child");
		expect(child).toBeDefined();
		expect(child.getLogLevel()).toEqual(LogLevel.FATAL);
	});

	test("ConsoleLogger tests", async () => {

		logger.setLogLevel(LogLevel.TRACE);

		logger.trace("trace message");
		logger.debug("debug message");
		logger.info("info message");
		logger.warn("warn message");
		logger.error("error message");
		logger.fatal("fatal message");

		logger.error("error message", new Error("TestErrorObject"));

		await expect(true)
	})

	test("error object tests", async () => {
		const err1 = new Error("Error object message - style 1");
		console.log("\r\n*** Error logging output for style 1: logger.error(msg, err) follows ***");
		logger.error("An error occurred", err1);

		const err2 = new Error("Error object message - style 2");
		console.log("\r\n*** Error logging output for style 2: logger.error(err, err) follows ***");
		logger.error("An error occurred", err2);

		await expect(true);
	})
})
