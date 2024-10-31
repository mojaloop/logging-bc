/* istanbul ignore file */
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

"use strict";

import {ILogger, LogEntry, LogLevel} from "@mojaloop/logging-bc-public-types-lib";
import {ILogStorageAdapter} from "../application/interfaces";
import {Client, ClientOptions} from "@elastic/elasticsearch";

const MAX_LISTENERS = 50;

export class ElasticsearchLogStorage implements ILogStorageAdapter {
	private _client: Client;
	private readonly _clientOps: ClientOptions;
	private readonly _index: string;
	private _logger: ILogger;

	constructor(opts: ClientOptions, index: string, logger: ILogger) {
		this._clientOps = opts;
		this._index = index;
		this._logger = logger.createChild(this.constructor.name);
		this._client = new Client(this._clientOps);
        this._client.diagnostic.setMaxListeners(MAX_LISTENERS);
	}

	async init(): Promise<void> {
		// test the connection
		const info = await this._client.info();
		this._logger.info(`Connected to elasticsearch instance with name: ${info.name}, and cluster name: ${info.cluster_name}`);
	}


	async store(entries: LogEntry[]): Promise<void> {
		try {
            const docs:any[] = [];
			for (const itm of entries) {
                // eslint-disable-next-line  @typescript-eslint/no-explicit-any
				const doc: any = {
					level: itm.level,
					// eslint-disable-next-line  @typescript-eslint/no-explicit-any
					level_numeric: Object.keys(LogLevel)[itm.level as any],
					timestamp: itm.timestamp,
					bcName: itm.bcName,
					appName: itm.appName,
					appVersion: itm.appVersion,
					message: "" + itm.message,
					component: itm.component
				};
				if (itm.meta && itm.meta.error) {
					doc.error = itm.meta.error;
				}
				if (itm.meta) {
					doc.meta = itm.meta;
				}

                docs.push(doc);
			}

          /*  await this._client.index({
                index: this._index,
                document: doc
            });*/

            const onDocument = (doc:any):any=>{
                return {
                    index: {_index: this._index},
                    document: doc
                };
            };

            await this._client.helpers.bulk({
                datasource: docs,
                onDocument: onDocument.bind(this)
            });
            //console.log(resp);
        } catch (err) {
			this._logger.error("ElasticsearchLogStorage error", err);
		}
	}

	async destroy(): Promise<void> {
		await this._client.close();
		return Promise.resolve();
	}
}
