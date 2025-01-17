import "dotenv/config";
import pino, { type TransportTargetOptions } from "pino";
import type { Logger } from "pino";

const transport: TransportTargetOptions = {
  //@ts-ignore
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "UTC:yy-mm-dd'T'HH:MM:ss.l",
    ignore: "pid,hostname",
  },
};

const transportProd = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: process.env.SOURCE_TOKEN },
});

const logger: Logger = pino(process.env.NODE_ENV === "production" ? transportProd : transport);

export default logger;
