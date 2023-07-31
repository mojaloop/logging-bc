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
 - Donovan Changfoot <donovan.changfoot@coil.com>

 * Crosslake
 - Pedro Sousa Barreto <pedrob@crosslaketech.com>

 * ModusBox
 - Miguel de Barros <miguel.debarros@modusbox.com>
 - Roman Pietrzak <roman.pietrzak@modusbox.com>

 --------------
 ******/

"use strict";

export {ConsoleLogger} from "./console_logger";

export enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal"
}

//TODO @jason, also add log level with a numeric value. enum index.
export declare type LogEntry = {
  level: LogLevel,
  timestamp: number,
  bcName:string,
  appName:string,
  appVersion:string
  component:string | null,
  message: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  meta: any
}

export declare type ILogger = {
  // programmatically set log level
  setLogLevel: (logLevel: LogLevel) => void;
  getLogLevel: () => LogLevel;

  createChild(componentName:string):ILogger;

  // methods to check logging level
  isTraceEnabled: () => boolean;
  isDebugEnabled: () => boolean;
  isInfoEnabled: () => boolean;
  isWarnEnabled: () => boolean;
  isErrorEnabled: () => boolean;
  isFatalEnabled: () => boolean;

  // methods to handle logging per level
   // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  trace: (message?: any, ...optionalParams: any[]) => void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  debug: (message?: any, ...optionalParams: any[]) => void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  info: (message?: any, ...optionalParams: any[]) => void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  warn: (message?: any, ...optionalParams: any[]) => void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  error: (message?: any, ...optionalParams: any[]) => void;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  fatal: (message?: any, ...optionalParams: any[]) => void;
}
