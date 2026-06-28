const winston = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// define winston logger config
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.printf(({timestamp, level, message})=> `[${timestamp}] [${level.toLocaleUpperCase()}] ${message}`)
    ),
    transports: [
        // app.log
        new winston.transports.File({
            filename: path.join(logDir, "app.log")
        }),
        // error.log
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        })
    ]
    
})

module.exports = logger