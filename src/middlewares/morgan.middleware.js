const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

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

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "../../logs/access.log"),
  {
    flags: "a",
  },
);

const morganLogger = morgan("custom", {
  stream: accessLogStream,
});

const morganConsole = morgan("custom");

module.exports = { morganLogger, morganConsole };
