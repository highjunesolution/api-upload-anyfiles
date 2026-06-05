const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_MAX_SIZE = Number(process.env.DEFAULT_MAX_SIZE) * 1024 * 1024 || 5 * 1024 * 1024;
const DEFAULT_MAX_FILES = Number(process.env.DEFAULT_MAX_FILES) || 10;
const ALLOWED_EXT = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  pdf: [".pdf"],
  excel: [".xls", ".xlsx", ".csv"],
  document: [".doc", ".docx", ".txt"],
  archive: [".zip", ".rar"],
};

function generateFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const randomStr = crypto.randomBytes(8).toString("hex");
  const now = new Date();

  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");

  return `${now.toISOString().split("T")[0].split("-").join("")}-${HH}${mm}${ss}${ms}-${randomStr}${ext}`;
}

function makeFileFilter(type) {
  return (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ALLOWED_EXT[type] || [];
    if (!allowed.includes(ext)) {
      return cb(
        new Error("นามสกุลไฟล์ไม่ถูกต้อง")
      );
    }
    cb(null, true);
  };
}

function handleMulterError(err, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({
        success: false,
        message: `ไฟล์ใหญ่เกิน ${DEFAULT_MAX_SIZE / 1024 / 1024} MB`,
      });

    if (err.code === "LIMIT_FILE_COUNT")
      return res.status(400).json({
        success: false,
        message: `อัปโหลดได้สูงสุด ${DEFAULT_MAX_FILES} ไฟล์ต่อครั้ง`,
      });

    if (err.code === "LIMIT_UNEXPECTED_FILE")
      return res.status(400).json({
        success: false,
        message: `นามสกุลไฟล์ไม่ถูกต้อง`,
      });

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err)
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });

  return next(err);
}

function deleteFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (_) {}
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const { dest } = req.body;
      if (!dest) return cb(new Error("Destination is required!"));
      const uploadDir = path.isAbsolute(dest)
        ? dest
        : path.join(__dirname, dest);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, req.body.newName ? req.body.newName : generateFilename(file.originalname));
  },
});

function singleUploadMiddleware(type) {
  return (req, res, next) => {
    const upload = multer({
      storage,
      limits: { fileSize: DEFAULT_MAX_SIZE, files: 1 },
      fileFilter: makeFileFilter(type),
    }).single("file");

    upload(req, res, (err) => {
      if (err) return handleMulterError(err, res, next);

      if (!req.file)
        return res.status(400).json({
          success: false,
          message: "ไม่พบไฟล์ที่อัปโหลด",
        });

      req.fileType = type;
      next();
    });
  };
}

module.exports = { singleUploadMiddleware };
