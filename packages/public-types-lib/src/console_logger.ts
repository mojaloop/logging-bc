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

import {ILogger, LogLevel} from "./index";

export class ConsoleLogger implements ILogger {
    protected _logLevel: LogLevel = LogLevel.DEBUG; // default

    createChild(componentName:string):ILogger{
        // nop - not implemented here, just return the same instance
        return this;
    }

    setLogLevel (logLevel: LogLevel): void{
        this._logLevel = logLevel;
    }
    getLogLevel (): LogLevel {
        return this._logLevel;
    }

    isTraceEnabled (): boolean {
        return this._logLevel === LogLevel.TRACE;
    }

    isDebugEnabled (): boolean {
        return this._logLevel === LogLevel.DEBUG || this.isTraceEnabled();
    }

    isInfoEnabled (): boolean {
        return this._logLevel === LogLevel.INFO || this.isDebugEnabled();
    }

    isWarnEnabled (): boolean {
        return this._logLevel === LogLevel.WARN || this.isInfoEnabled();
    }

    isErrorEnabled (): boolean {
        return this._logLevel === LogLevel.ERROR || this.isWarnEnabled();
    }

    isFatalEnabled (): boolean {
        return this._logLevel === LogLevel.FATAL || this.isErrorEnabled();
    }

    trace (message?: any, ...optional: any[]): void {
        this.isTraceEnabled() && console.trace(message, ...optional);
    }

    debug (message?: any, ...optional: any[]): void {
        this.isDebugEnabled() && console.debug(message, ...optional);
    }

    info (message?: any, ...optional: any[]): void {
        this.isInfoEnabled() && console.info(message, ...optional);
    }

    warn (message?: any, ...optional: any[]): void {
        this.isWarnEnabled() && console.warn(message, ...optional);
    }

    error (message?: any, ...optional: any[]): void {
        this.isErrorEnabled() && console.error(message, ...optional);
    }

    fatal (message?: any, ...optional: any[]): void {
        this.isFatalEnabled() && console.error(message, ...optional);
    }
}
