const fs = require("fs");
const path = require("path");

exports.upload = (req, res) => {
  try {
    const { file } = req;
    return res.status(201).json({
      success: true,
      message: "อัปโหลดไฟล์สำเร็จแล้วเรียบร้อย!",
      file,
    });
  } catch (err) {
    console.log(err.code || err.name);
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "API upload file error",
      err: err.message,
    });
  }
};

exports.remove = (req, res) => {
  try {
    const { filename, dest } = req.body;
    if (!filename || !dest)
      return res.status(400).json({
        success: false,
        message: "โปรดระบุชื่อไฟล์หรือตำแหน่งของไฟล์",
      });

    const filePath = path.join(dest, filename);

    if (!fs.existsSync(filePath))
      return res.status(400).json({
        success: false,
        message: "ไม่พบไฟล์",
      });

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "ลบไฟล์สำเร็จแล้วเรียบร้อย!",
    });
  } catch (err) {
    console.log(err.code || err.name);
    console.log(err.message);

    if (err.name === "TypeError")
      return res.status(400).json({
        success: false,
        message: "โปรดระบุชื่อไฟล์หรือตำแหน่งของไฟล์",
      });


    res.status(500).json({
      success: false,
      message: "API upload file error",
      err: err.message,
    });
  }
};
