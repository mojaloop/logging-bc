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

* ModusBox
- Miguel de Barros <miguel.debarros@modusbox.com>
*****/

"use strict";

/* eslint-disable no-console */
import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";
import { BaseLogger } from "./base_logger";
import * as Winston from "winston";

 //const logLevelPriority: Winston.config.AbstractConfigSetLevels = {
const customLevels = {
    levels:{
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5
    },
    colors: {
        fatal: "white redBG",
        error: "red",
        warn: "yellow",
        info: "cyan",
        debug: "green",
        trace: "grey",
    }
};

//colorizer.addColors(customLevels.colors);

const consoleFormat = Winston.format.printf((args) => {
    let format = `${args.timestamp} \u001b[90m(${args.bcName} ${args.appName} v${args.appVersion})\u001b[39m (${args.componentName || "null"}) [${args.label || ""}] ${args.level}: ${args.message}`;

    if(args.extra){
        if(args.extra.meta ){
            format += ` \u001b[90mmeta: ${JSON.stringify(args.extra.meta, null, 2)}\u001b[39m`;
        }else if (args.extra.error){
            format += ` \u001b[90merror stack: \n${args.extra.error.stack}\u001b[39m`;
        }else{
            format += ` \u001b[90mmeta: ${JSON.stringify(args.extra, null, 2)}\u001b[39m`;
        }
    }
    return format;
});

export class DefaultLogger extends BaseLogger implements ILogger {
    //protected _componentName: string | null;
    protected _logger: Winston.Logger;

    constructor (bcName:string, appName:string, appVersion:string, level: LogLevel = LogLevel.INFO, loggerInstance?:Winston.Logger) {
        super(bcName, appName, appVersion, level);

        if(!loggerInstance) {
            this._logger = Winston.createLogger({
                level: this._logLevel,
                levels: customLevels.levels,

                defaultMeta: {
                    bcName: bcName,
                    appName: appName,
                    appVersion: appVersion
                },
                format: Winston.format.timestamp(),
                transports: [
                    new Winston.transports.Console({
                        format: Winston.format.combine(
                                Winston.format.colorize({colors: customLevels.colors}),
                                // Winston.format.simple(),
                                consoleFormat
                        )
                    }),
                    new Winston.transports.File({
                        filename: "combined.log",
                        format: consoleFormat
                    })
                ]
            });
        }else{
            this._logger = loggerInstance;
        }
    }

    createChild(componentName:string):DefaultLogger{
        const childWinstonLogger = this._logger.child({"componentName":componentName});
        const childILogger = new DefaultLogger(this._bcName, this._appName, this._appVersion, this._logLevel, childWinstonLogger);
        //childILogger._componentName = componentName;
        return childILogger;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    protected _log (level:LogLevel, message: any, ...meta: any[]): void {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const parsedMeta:any = {};
        if(Array.isArray(meta) && meta.length > 0){
            if(meta[0] instanceof Error){
                parsedMeta.error = {
                    message: meta[0].message,
                    stack: meta[0].stack
                };
            }else if(Array.isArray(meta[0]) || meta.length>1){
                parsedMeta.arr = meta[0];
            }else{
                parsedMeta.meta = meta[0];
            }

            /* istanbul ignore if */
            if(meta.length>1){
                meta = meta.splice(1);
                parsedMeta.arr = [parsedMeta.arr || [], ...meta];
            }
        }

        // this._logger.log(level, message, ...meta);
        this._logger.log({
            level,
            message,
            extra: Object.entries(parsedMeta).length ? parsedMeta : null
        });
    }

    setLogLevel(logLevel:LogLevel) {
        this._logLevel = logLevel;
        this._logger.level = this._logLevel;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    trace (message?: any, ...meta: any[]): void {
        if (!this.isTraceEnabled()) return;

        this._log(LogLevel.TRACE, message, ...meta);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    debug (message?: any, ...meta: any[]): void {
        if (!this.isDebugEnabled()) return;

        this._log(LogLevel.DEBUG, message, ...meta);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    info (message?: any, ...meta: any[]): void {
        if (!this.isInfoEnabled()) return;

        this._log(LogLevel.INFO, message, ...meta);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    warn (message?: any, ...meta: any[]): void {
        if (!this.isWarnEnabled()) return;

        this._log(LogLevel.WARN, message, ...meta);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    error (message?: any, ...meta: any[]): void {
        if (!this.isErrorEnabled()) return;

       this._log(LogLevel.ERROR, message, ...meta);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    fatal (message?: any, ...meta: any[]): void {
        if (!this.isFatalEnabled()) return;

        this._log(LogLevel.FATAL, message, ...meta);
    }
}
