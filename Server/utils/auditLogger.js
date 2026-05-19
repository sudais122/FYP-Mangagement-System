import winston from "winston";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logPath   = path.join(__dirname, "../../logs/audit.log");

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: logPath,
      flags:    "a",
    }),
    new winston.transports.Console({
      silent: process.env.NODE_ENV === "production",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, ...rest }) => {
          return `${timestamp} ${level}: ${JSON.stringify(rest, null, 2)}`;
        })
      ),
    }),
  ],
});

export function logAudit(event, role, actor = {}, meta = {}) {
  auditLogger.info({
    event,
    role,
    actor: {
      id:    actor.id    || actor._id || "unknown",
      name:  actor.name  || "unknown",
      email: actor.email || "unknown",
    },
    meta,
  });
}
