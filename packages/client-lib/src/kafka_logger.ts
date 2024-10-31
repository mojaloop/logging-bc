import { ILogger, LogLevel } from "@mojaloop/logging-bc-public-types-lib";
import { DefaultLogger } from "./default_logger";
import {
  IRawMessage,
  MLKafkaProtoBuffProducer,
  MLKafkaProtoBuffProducerOptions
} from "@mojaloop/platform-shared-lib-nodejs-kafka-client-lib";
import Transport from "winston-transport";
import Winston from "winston";
import { LogLevelPB, LogEntryPB } from "@mojaloop/logging-bc-public-types-lib/";
import { IMessage, MessageTypes } from "@mojaloop/platform-shared-lib-messaging-types-lib";

let globalKafkaLoggerTransport: KafkaLoggerTransport | null = null;

class KafkaLoggerTransport extends Transport {
  _producerOptions: MLKafkaProtoBuffProducerOptions;
  _kafkaProducer: MLKafkaProtoBuffProducer;
  _kafkaTopic: string;
  _ready = false;

  constructor(opts: { producerOptions: MLKafkaProtoBuffProducerOptions, kafkaTopic: string }) {
    super();
    /* istanbul ignore if */
    if (!opts.producerOptions.producerClientId) {
      opts.producerOptions.producerClientId = "KafkaLoggerTransport_" + Math.random().toString(36).slice(2, 7);
    }

    this._producerOptions = opts.producerOptions;
    this._kafkaTopic = opts.kafkaTopic;
    this._kafkaProducer = new MLKafkaProtoBuffProducer(this._producerOptions);
  }

  async start(): Promise<void> {
    await this._kafkaProducer.connect();
  }

  async stop(): Promise<void> {
    return this._kafkaProducer.destroy();
  }

  private async _log(info:Winston.LogEntry): Promise<void>{

    const logEntry = new LogEntryPB({
      level: LogLevelPB[info.level.toUpperCase() as keyof typeof LogLevelPB],
      bcName: info.bcName,
      appName: info.appName,
      appVersion: info.appVersion,
      timestamp: new Date(info.timestamp).getTime(),
      message: info.message,
      component: info.componentName,
      meta: info.extra
    });


    const serializedLogEntry = logEntry.serializeBinary();

    const message: IMessage = {
      msgTopic: this._kafkaTopic,
      payload: serializedLogEntry,
      msgType: MessageTypes.DOMAIN_EVENT,
      msgName: "",
      msgId: "",
      msgTimestamp: 0,
      msgKey: null,
      msgPartition: null,
      msgOffset: null,
      fspiopOpaqueState: undefined
    };

    await this._kafkaProducer.send(message);
  }

  log(info: Winston.LogEntry, callback: () => void) {
    this._log(info).then(() => {
      callback();
    });
  }
}

export class KafkaLogger extends DefaultLogger implements ILogger {
  _producerOptions: MLKafkaProtoBuffProducerOptions;
  _kafkaTopic: string;
  _kafkaTransport: KafkaLoggerTransport;
  _ready = false;

  constructor(bcName: string, appName: string, appVersion: string,
              producerOptions: MLKafkaProtoBuffProducerOptions,
              kafkaTopic: string,
              level: LogLevel = LogLevel.INFO,
              loggerInstance?: Winston.Logger
  ) {
    super(bcName, appName, appVersion, level);

    if (!loggerInstance) {
      if (!globalKafkaLoggerTransport) {
        globalKafkaLoggerTransport = new KafkaLoggerTransport({
          producerOptions,
          kafkaTopic
        });
      }
      this._kafkaTransport = globalKafkaLoggerTransport;

      this._logger.add(this._kafkaTransport);
    } else {
      this._logger = loggerInstance;
    }
  }

  createChild(componentName: string): KafkaLogger {
    const childWinstonLogger = this._logger.child({ componentName });
    const childILogger = new KafkaLogger(this._bcName, this._appName, this._appVersion, this._producerOptions, this._kafkaTopic, this._logLevel, childWinstonLogger);
    return childILogger;
  }

  async start(): Promise<void> {
    return this.init();
  }

  async init(): Promise<void> {
    await this._kafkaTransport.start();
  }

  async destroy(): Promise<void> {
    await this._logger.end();
    return await this._kafkaTransport.stop();
  }
}
