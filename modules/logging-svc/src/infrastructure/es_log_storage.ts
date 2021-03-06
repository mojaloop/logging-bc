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

import {LogEntry, LogLevel} from '@mojaloop/logging-bc-logging-types-lib';
import { IStorage } from "../application/log_event_handler";
import { Client } from '@elastic/elasticsearch';
import { ClientOptions } from "@elastic/elasticsearch/lib/client";

export class MLElasticsearchLogStorage implements IStorage {
  private client: Client
  private clientOps: ClientOptions
  private index: string

  constructor(
      opts: ClientOptions,
      index: string = 'mjl-logging'
  ) {
    this.clientOps = opts;
    this.index = index;
  }

  async init(): Promise<void> {
    this.client = new Client(this.clientOps);
  }

  async store(entries: LogEntry[]): Promise<void> {
    for (const itm of entries) {
      await this.client.index({
        index: this.index,
        document: {
          level: itm.level,
          level_numeric: Object.keys(LogLevel).indexOf(itm.level.toUpperCase()),
          logTimestamp: itm.logTimestamp,
          message: ''+itm.message,
          meta: itm.meta
        }
      });
    }
  }
}
