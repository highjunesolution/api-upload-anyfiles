const express = require("express");
const { singleUploadMiddleware } = require("../middlewares/multer.middleware");
const uploadController = require("../controllers/upload.controller");
const router = express.Router();

router.post("/upload/image", singleUploadMiddleware("image"), uploadController.upload);
router.post("/upload/pdf", singleUploadMiddleware("pdf"), uploadController.upload)
router.post("/upload/excel", singleUploadMiddleware("excel"), uploadController.upload)
router.post("/upload/document", singleUploadMiddleware("document"), uploadController.upload)
router.post("/upload/archive", singleUploadMiddleware("archive"), uploadController.upload)

router.post("/remove/file", uploadController.remove);
module.exports = router;
