const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger.util");

exports.upload = (req, res) => {
  try {
    const { file } = req;

    logger.info(
      `${req.ip} ${req.method} ${req.originalUrl} 201 \"${file.originalname}\" -> \"${file.filename}\" Uploaded Successfully`,
    );

    return res.status(201).json({
      success: true,
      message: "อัปโหลดไฟล์สำเร็จแล้วเรียบร้อย!",
      file,
    });
  } catch (err) {
    console.log(err.code || err.name);
    console.log(err.message);

    logger.error(
      `${req.ip} ${req.method} ${req.originalUrl} ${err?.code || err.name} 500 API Upload file error`,
    );

    return res.status(500).json({
      success: false,
      message: "API upload file error",
      err: err.message,
    });
  }
};

exports.remove = async (req, res) => {
  let filePath = "";
  try {
    const { filename, dest } = req.body;
    if (!filename || !dest) {
      logger.error(
        `${req.ip} ${req.method} ${req.originalUrl} ${err.code ?? err.name} Delete Failed, filename/path is required`,
      );
      return res.status(400).json({
        success: false,
        message: "โปรดระบุชื่อไฟล์หรือตำแหน่งของไฟล์",
      });
    }

    filePath = path.join(dest, filename);
    await fs.promises.unlink(filePath);

    logger.info(
      `${req.ip} ${req.method} ${req.originalUrl} 200 \"${filePath}\" Deleted Successfully`,
    );

    return res.status(200).json({
      success: true,
      message: "ลบไฟล์สำเร็จแล้วเรียบร้อย!",
    });
  } catch (err) {
    console.log(err.code || err.name);
    console.log(err.message);

    if (err.code === "ENOENT") {
      logger.error(
        `${req.ip} ${req.method} ${req.originalUrl} ${err.code ?? err.name} \"${filePath}\" Delete Failed, filename/path is invalid or can't found`,
      );
      return res.status(400).json({
        success: false,
        message: "ไม่พบไฟล์",
      });
    }

    if (err.name === "TypeError") {
      logger.error(
        `${req.ip} ${req.method} ${req.originalUrl} ${err.code ?? err.name} Delete Failed, filename/path is required`,
      );
      return res.status(400).json({
        success: false,
        message: "โปรดระบุชื่อไฟล์หรือตำแหน่งของไฟล์",
      });
    }

    logger.error(
      `${req.ip} ${req.method} ${req.originalUrl} ${err.code ?? err.name} Delete Failed, API upload file error ${err.message}`,
    );

    return res.status(500).json({
      success: false,
      message: "API upload file error",
      err: err.message,
    });
  }
};
