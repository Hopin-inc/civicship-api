import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

const isLocal = process.env.ENV === "LOCAL";

const severity = winston.format((log) => {
  log.severity = log.level.toUpperCase();
  return log;
});

const errorReport = winston.format((log) => {
  if (log instanceof Error) {
    log.err = {
      name: log.name,
      message: log.message,
      stack: log.stack,
    };
  }
  return log;
});

const format: winston.Logform.Format[] = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  severity(),
  errorReport(),
];
if (!isLocal) {
  format.push(winston.format.json());
} else {
  format.push(winston.format.simple());
}

const transports: winston.transport[] = [];
if (isLocal) {
  transports.push(new winston.transports.Console());
} else {
  transports.push(new LoggingWinston());
}

const logger = winston.createLogger({
  // level: isLocal ? "debug" : "info",
  level: "debug",
  format: winston.format.combine(...format),
  transports,
});
export default logger;
