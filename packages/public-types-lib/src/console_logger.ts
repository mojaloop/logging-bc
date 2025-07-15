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

* Crosslake
- Pedro Sousa Barreto <pedrob@crosslaketech.com>
*****/

"use strict";

import {ILogger, LogLevel} from "./index";

export class ConsoleLogger implements ILogger {
    protected _logLevel: LogLevel = LogLevel.DEBUG; // default

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trace (message?: any, ...optional: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isTraceEnabled() && console.trace(message, ...optional);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    debug (message?: any, ...optional: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isDebugEnabled() && console.debug(message, ...optional);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    info (message?: any, ...optional: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isInfoEnabled() && console.info(message, ...optional);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    warn (message?: any, ...optional: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isWarnEnabled() && console.warn(message, ...optional);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    error (message?: any, ...optional: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isErrorEnabled() && console.error(message, ...optional);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    fatal (message?: any, ...optional: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isFatalEnabled() && console.error(message, ...optional);
    }
}
