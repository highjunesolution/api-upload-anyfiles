const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");
const instanceId = process.env.pm_id ?? "single";

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// app-2026_06_30.log
const appTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `%DATE%-app-${instanceId}`),
    extension: ".log",
    datePattern: "YYYY_MM_DD",
    maxSize: "10m",
    maxFiles: "62d",
    auditFile: path.join(logDir, `.app-audit-${instanceId}.json`), // ห้ามลบทิ้งไฟล์ metadata ที่ตัว rotate ใช้จำว่าไฟล์ไหนอยู่ในระบบ rotation
})

// error-2026_06_30.log
const errorTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `%DATE%-error-${instanceId}`),
    extension: ".log",
    datePattern: "YYYY_MM_DD",
    maxSize: "10m",
    maxFiles: "62d",
    auditFile: path.join(logDir, `.error-audit-${instanceId}.json`), // ห้ามลบทิ้งไฟล์ metadata ที่ตัว rotate ใช้จำว่าไฟล์ไหนอยู่ในระบบ rotation
    level: "error",
})

// define winston logger config
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss"}), // DateTime from Server
        // winston.format.timestamp({ format: ()=> new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" })}), // DateTime from Selected time zone
        winston.format.printf(({timestamp, level, message})=> `[${timestamp}] [${level.toLocaleUpperCase()}] ${message}`)
    ),
    transports: [appTransport, errorTransport],
    
})

module.exports = logger