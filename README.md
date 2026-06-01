# Upload Any Files API

REST API สำหรับอัปโหลดไฟล์หลายประเภทด้วย Express และ Multer โดยแยก endpoint ตามชนิดไฟล์ เช่น image, PDF, Excel, document และ archive

## Tech Stack

- Node.js
- Express
- Multer
- CORS
- Morgan
- Dotenv

## การติดตั้ง

```bash
npm install
```

## การตั้งค่า Environment

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ แล้วกำหนดค่าตามต้องการ

```env
DEFAULT_MAX_SIZE=5
DEFAULT_MAX_FILES=10
```

| ตัวแปร | ความหมาย | ค่าเริ่มต้น |
| --- | --- | --- |
| `DEFAULT_MAX_SIZE` | ขนาดไฟล์สูงสุด หน่วยเป็น MB | `5` |
| `DEFAULT_MAX_FILES` | จำนวนไฟล์สูงสุดที่เตรียมไว้ใน config | `10` |

หมายเหตุ: endpoint ปัจจุบันรับอัปโหลดครั้งละ 1 ไฟล์ผ่าน field ชื่อ `file`

## การรันเซิร์ฟเวอร์

```bash
npm start
```

เซิร์ฟเวอร์จะรันที่:

```text
http://localhost:3000
```

Base API URL:

```text
http://localhost:3000/api
```

## โครงสร้างโปรเจกต์

```text
.
├── server.js
├── src
│   ├── controllers
│   │   └── upload.controller.js
│   ├── middlewares
│   │   └── multer.middleware.js
│   └── routes
│       └── upload.route.js
└── package.json
```

## Endpoints

### Upload Image

```http
POST /api/upload/image
```

รองรับไฟล์:

```text
.jpg, .jpeg, .png, .gif, .webp
```

### Upload PDF

```http
POST /api/upload/pdf
```

รองรับไฟล์:

```text
.pdf
```

### Upload Excel

```http
POST /api/upload/excel
```

รองรับไฟล์:

```text
.xls, .xlsx, .csv
```

### Upload Document

```http
POST /api/upload/document
```

รองรับไฟล์:

```text
.doc, .docx, .txt
```

### Upload Archive

```http
POST /api/upload/archive
```

รองรับไฟล์:

```text
.zip, .rar
```

## Upload Request

ทุก upload endpoint ใช้ `multipart/form-data`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | File | Yes | ไฟล์ที่ต้องการอัปโหลด |
| `dest` | String | Yes | path ปลายทางสำหรับเก็บไฟล์ |

ถ้า `dest` เป็น relative path ระบบจะ resolve จากโฟลเดอร์ `src/middlewares` ตาม implementation ปัจจุบัน แนะนำให้ใช้ absolute path หากต้องการกำหนดตำแหน่งเก็บไฟล์ให้ชัดเจน

ตัวอย่าง:

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@./sample.png" \
  -F "dest=D:/playground/lab14-upload-anyfiles/uploads/images"
```

Response สำเร็จ:

```json
{
  "success": true,
  "message": "อัปโหลดไฟล์สำเร็จแล้วเรียบร้อย!",
  "file": {
    "fieldname": "file",
    "originalname": "sample.png",
    "encoding": "7bit",
    "mimetype": "image/png",
    "destination": "D:/playground/lab14-upload-anyfiles/uploads/images",
    "filename": "20260601-140500123-a1b2c3d4e5f6a7b8.png",
    "path": "D:/playground/lab14-upload-anyfiles/uploads/images/20260601-140500123-a1b2c3d4e5f6a7b8.png",
    "size": 12345
  }
}
```

## Remove File

```http
POST /api/remove/file
```

ใช้ `application/json`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `filename` | String | Yes | ชื่อไฟล์ที่ต้องการลบ |
| `dest` | String | Yes | path ของโฟลเดอร์ที่เก็บไฟล์ |

ตัวอย่าง:

```bash
curl -X POST http://localhost:3000/api/remove/file \
  -H "Content-Type: application/json" \
  -d "{\"filename\":\"20260601-140500123-a1b2c3d4e5f6a7b8.png\",\"dest\":\"D:/playground/lab14-upload-anyfiles/uploads/images\"}"
```

Response สำเร็จ:

```json
{
  "success": true,
  "message": "ลบไฟล์สำเร็จแล้วเรียบร้อย!"
}
```

## Error Response

ตัวอย่าง error response:

```json
{
  "success": false,
  "message": "ไฟล์ใหญ่เกิน 5 MB"
}
```

กรณีที่อาจเกิด error:

- ไม่ส่ง field `file`
- ไม่ส่ง `dest`
- นามสกุลไฟล์ไม่ตรงกับ endpoint
- ขนาดไฟล์เกิน `DEFAULT_MAX_SIZE`
- ลบไฟล์ที่ไม่มีอยู่จริง

## Naming ของไฟล์ที่อัปโหลด

ระบบจะเปลี่ยนชื่อไฟล์อัตโนมัติเป็นรูปแบบ:

```text
YYYYMMDD-HHmmssSSS-randomhex.ext
```

ตัวอย่าง:

```text
20260601-140500123-a1b2c3d4e5f6a7b8.png
```
