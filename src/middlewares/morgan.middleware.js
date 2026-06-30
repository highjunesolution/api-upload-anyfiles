const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const FileStreamRotator = require("file-stream-rotator");

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, {
    recursive: true,
  });
}

morgan.format(
  "custom",
  ":server-time :remote-addr :method :url :status :response-time ms",
);

morgan.token("server-time", () =>
  new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Bangkok",
  }),
);

const accessLogStream = FileStreamRotator.getStream({
  filename: path.join(logDir, "%DATE%-access"),
  extension: ".log",
  frequency: "daily",
  date_format: "YYYY_MM_DD",
  size: "10m",
  max_logs: "62d",
  audit_file: path.join(logDir, ".access-audit.json"),
});

const morganLogger = morgan("custom", {
  stream: accessLogStream,
});

const morganConsole = morgan("custom");

module.exports = { morganLogger, morganConsole };
