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
- Donovan Changfoot <donovan.changfoot@coil.com>

* Crosslake
- Pedro Sousa Barreto <pedrob@crosslaketech.com>

* ModusBox
- Miguel de Barros <miguel.debarros@modusbox.com>
- Roman Pietrzak <roman.pietrzak@modusbox.com>
*****/

"use strict";

/* eslint-disable no-console */

import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";

export abstract class BaseLogger implements ILogger {
    protected _bcName:string;
    protected _appName:string;
    protected _appVersion:string;
    protected _logLevel: LogLevel = LogLevel.DEBUG; // default

    public componentName: string | null;

    constructor(bcName:string, appName:string, appVersion:string, level: LogLevel = LogLevel.INFO) {
        this._bcName = bcName;
        this._appName = appName;
        this._appVersion = appVersion;
        this._logLevel = level;
    }

    abstract setLogLevel (logLevel: LogLevel): void;
    abstract createChild(componentName:string):ILogger;

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

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    abstract trace (message?: any, ...optionalParams: any[]): void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    abstract debug (message?: any, ...optionalParams: any[]): void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    abstract info (message?: any, ...optionalParams: any[]): void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    abstract warn (message?: any, ...optionalParams: any[]): void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    abstract error (message?: any, ...optionalParams: any[]): void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    abstract fatal (message?: any, ...optionalParams: any[]): void;

}
