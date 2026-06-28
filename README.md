# Upload Any Files API

REST API สำหรับอัปโหลดและลบไฟล์ด้วย Express และ Multer โดยแยก endpoint ตามประเภทไฟล์ เช่น image, PDF, Excel, document และ archive

เหมาะสำหรับใช้งานแบบ local หรือ internal API ที่มีการกำหนดรูปแบบ request ชัดเจน

## Tech Stack

| Tool | Usage |
| --- | --- |
| Node.js | Runtime |
| Express | HTTP server และ routing |
| Multer | รับไฟล์แบบ `multipart/form-data` |
| Morgan | Access log |
| Winston | App และ error log |
| CORS | เปิดการเรียกใช้งานข้าม origin |
| Dotenv | โหลดค่า environment |

## Installation

```bash
npm install
```

## Environment

สร้างไฟล์ `.env` ที่ root project หรือคัดลอกจาก `.env.example`

```env
PORT=3000
DEFAULT_MAX_SIZE=5
DEFAULT_MAX_FILES=10
```

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | มีใน `.env.example` แต่โค้ดปัจจุบันยังใช้ `3000` จาก `server.js` | `3000` |
| `DEFAULT_MAX_SIZE` | ขนาดไฟล์สูงสุด หน่วยเป็น MB | `5` |
| `DEFAULT_MAX_FILES` | ค่าจำนวนไฟล์สูงสุดใน config แต่ endpoint ปัจจุบันรับครั้งละ 1 ไฟล์ | `10` |

## Run

```bash
npm start
```

Server จะรันที่:

```text
http://localhost:3000
```

Base API URL:

```text
http://localhost:3000/api
```

## Project Structure

```text
.
|-- server.js
|-- package.json
|-- src
|   |-- controllers
|   |   `-- upload.controller.js
|   |-- middlewares
|   |   |-- morgan.middleware.js
|   |   `-- multer.middleware.js
|   |-- routes
|   |   `-- upload.route.js
|   `-- utils
|       `-- logger.util.js
`-- logs
    |-- access.log
    |-- app.log
    `-- error.log
```

## Supported Upload Endpoints

ทุก upload endpoint ใช้ field ไฟล์ชื่อ `file` และรับครั้งละ 1 ไฟล์

| Endpoint | Allowed Extensions |
| --- | --- |
| `POST /api/upload/image` | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| `POST /api/upload/pdf` | `.pdf` |
| `POST /api/upload/excel` | `.xls`, `.xlsx`, `.csv` |
| `POST /api/upload/document` | `.doc`, `.docx`, `.txt` |
| `POST /api/upload/archive` | `.zip`, `.rar` |

## Upload Request

Content type:

```text
multipart/form-data
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `dest` | String | Yes | path ปลายทางสำหรับเก็บไฟล์ |
| `file` | File | Yes | ไฟล์ที่ต้องการอัปโหลด ต้องใช้ field ชื่อ `file` |
| `newName` | String | No | ชื่อไฟล์ใหม่ ถ้าไม่ส่ง ระบบจะ generate ให้อัตโนมัติ |

สำคัญ: ให้ส่ง field `dest` ก่อน `file` เพราะ Multer ต้องใช้ `dest` ตอนเลือก destination สำหรับบันทึกไฟล์

ถ้า `dest` เป็น relative path ระบบจะ resolve จากโฟลเดอร์ `src/middlewares` ตาม implementation ปัจจุบัน สำหรับการใช้งานให้ชัดเจน แนะนำให้ส่ง absolute path

ตัวอย่าง:

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "dest=D:/test/images" \
  -F "file=@./sample.png"
```

ตัวอย่างกำหนดชื่อไฟล์เอง:

```bash
curl -X POST http://localhost:3000/api/upload/pdf \
  -F "dest=D:/test/pdf" \
  -F "newName=my-document.pdf" \
  -F "file=@./document.pdf"
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
    "destination": "D:/test/images",
    "filename": "20260601-140500123-a1b2c3d4e5f6a7b8.png",
    "path": "D:/test/images/20260601-140500123-a1b2c3d4e5f6a7b8.png",
    "size": 12345
  }
}
```

## Remove File

```http
POST /api/remove/file
```

Content type:

```text
application/json
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `filename` | String | Yes | ชื่อไฟล์ที่ต้องการลบ |
| `dest` | String | Yes | path ของโฟลเดอร์ที่เก็บไฟล์ |

ตัวอย่าง:

```bash
curl -X POST http://localhost:3000/api/remove/file \
  -H "Content-Type: application/json" \
  -d "{\"filename\":\"20260601-140500123-a1b2c3d4e5f6a7b8.png\",\"dest\":\"D:/test/images\"}"
```

Response สำเร็จ:

```json
{
  "success": true,
  "message": "ลบไฟล์สำเร็จแล้วเรียบร้อย!"
}
```

## File Naming

ถ้าไม่ส่ง `newName` ระบบจะ generate ชื่อไฟล์ตามรูปแบบนี้:

```text
YYYYMMDD-HHmmssSSS-randomhex.ext
```

ตัวอย่าง:

```text
20260601-140500123-a1b2c3d4e5f6a7b8.png
```

ถ้าส่ง `newName` ระบบจะใช้ชื่อที่ส่งมา โดยตัด path ออกด้วย `path.basename()` ดังนั้นควรใส่นามสกุลไฟล์ให้ครบ เช่น `report.pdf`

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
- ส่ง field ไฟล์ชื่ออื่นที่ไม่ใช่ `file`
- ส่งไฟล์มากกว่า 1 ไฟล์ต่อ request
- นามสกุลไฟล์ไม่ตรงกับ endpoint
- ขนาดไฟล์เกิน `DEFAULT_MAX_SIZE`
- ลบไฟล์ที่ไม่มีอยู่จริง

## Logs

ระบบเขียน log ไว้ในโฟลเดอร์ `logs`

| File | Description |
| --- | --- |
| `logs/access.log` | request log จาก Morgan |
| `logs/app.log` | application log จาก Winston |
| `logs/error.log` | error log จาก Winston |

ตัวอย่าง access log:

```text
2026-06-28 17:20:26 ::1 POST /api/remove/file 200 1.875 ms
```

## Notes

- API นี้ออกแบบสำหรับ local/internal usage ตาม scope ปัจจุบัน
- การตรวจประเภทไฟล์ใช้ extension จากชื่อไฟล์
- `dest` ถูกกำหนดจาก request body ตามกฎการใช้งานของ API นี้
- โฟลเดอร์ `logs`, `node_modules`, `.env` และ upload folder ถูก ignore จาก git ผ่าน `.gitignore`
