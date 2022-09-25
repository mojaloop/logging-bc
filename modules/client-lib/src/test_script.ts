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

 * Crosslake
 - Pedro Sousa Barreto <pedrob@crosslaketech.com>

 --------------
 ******/
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

 * Crosslake
 - Pedro Sousa Barreto <pedrob@crosslaketech.com>

 --------------
 ******/
"use strict";

import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";
import { KafkaLogger } from "./kafka_logger";

const BC_NAME = "logging-bc";
const APP_NAME = "client-lib";
const APP_VERSION = "0.0.1";
const LOGLEVEL = LogLevel.TRACE;
const KAFKA_LOGS_TOPIC = "logs";

const KAFKA_URL = process.env["KAFKA_URL"] || "localhost:9092";

const kafkaProducerOptions = {
    kafkaBrokerList: KAFKA_URL
};

let logger: ILogger;

async function start(){
    logger = new KafkaLogger(
            BC_NAME,
            APP_NAME,
            APP_VERSION,
            kafkaProducerOptions,
            KAFKA_LOGS_TOPIC,
            LOGLEVEL
    );
    await (logger as KafkaLogger).start();

    // use the same way as DefaultLogger
    logger.trace("trace message");
    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");
    logger.fatal("fatal message");

    logger.error("typed error message", new Error("TypedErrorClass"));

    const logger2: ILogger = logger.createChild("childComponent");
    logger2.warn("childComponent warn");

    setTimeout(async ()=>{
        // NOTE Make sure to call KafkaLogger.destroy
        await (logger as KafkaLogger).destroy();
    }, 500);

}

start();
