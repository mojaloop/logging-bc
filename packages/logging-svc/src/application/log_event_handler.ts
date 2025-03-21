/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Contributors
--------------
This is the official list of the Mojaloop project contributors for this file.
Names of the original copyright holders (individuals or organizations)
should be listed with a '*' in the first column. People who have
contributed from an organization can be listed under the organization
that actually holds the copyright for their contributions (see the
Mojaloop Foundation for an example). Those individuals should have
their names indented and be marked with a '-'. Email address can be added
optionally within square brackets <email>.

* Mojaloop Foundation
- Name Surname <name.surname@mojaloop.io>

* Coil
- Jason Bruwer <jason.bruwer@coil.com>
*****/

"use strict";

import {ILogger, LogEntry} from "@mojaloop/logging-bc-public-types-lib";
import {
    IRawMessage,
    IRawMessageConsumer
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib";
import {ILogStorageAdapter} from "./interfaces";

export class LogEventHandler {
    private _storage: ILogStorageAdapter;
    private _logger: ILogger;
    // private _consumerOpts: MLKafkaRawConsumerOptions;
    private _kafkaLogsTopic: string;
    private _kafkaConsumer: IRawMessageConsumer;

    constructor(
        logger: ILogger,
        storage: ILogStorageAdapter,
        kafkaConsumer: IRawMessageConsumer,
        logsTopic: string
    ) {
        this._logger = logger.createChild(this.constructor.name);
        this._storage = storage;
        this._kafkaConsumer = kafkaConsumer;
        this._kafkaLogsTopic = logsTopic;
    }

    async init(): Promise<void> {
        try {
            await this._storage.init();

            // hook logHandler process fn to the consumer handler
            this._kafkaConsumer.setTopics([this._kafkaLogsTopic]);
            this._kafkaConsumer.setBatchCallbackFn(this._processBatchLogMessage.bind(this));
            await this._kafkaConsumer.connect();

            await this._kafkaConsumer.startAndWaitForRebalance();
        }catch (e) {
            this._logger.error(e);
            throw e;
        }
    }
    private async _processBatchLogMessage(messages: IRawMessage[]): Promise<void> {
        const logEntries: LogEntry[] = [];

        for (const msg of messages){
            if (typeof msg.value=="object") {
                logEntries.push(msg.value as LogEntry);
            }
        }

        /* istanbul ignore if */
        if (logEntries.length == 0)
            return Promise.resolve();

        await this._storage.store(logEntries);
    }

    async destroy(): Promise<void> {
        await this._storage.destroy();
        // return this._kafkaConsumer.destroy(true);
    }
}
