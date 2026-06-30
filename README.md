# Upload Any Files API

<p align="center">
  <img src="./src/assets/banner/banner-logo.png" alt="Upload Any Files API banner" width="360" style="border-radius: 16px;" />
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-runtime-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="Multer" src="https://img.shields.io/badge/Multer-upload-2563EB?style=for-the-badge" />
  <img alt="Winston" src="https://img.shields.io/badge/Winston-logs-F59E0B?style=for-the-badge" />
  <img alt="PM2" src="https://img.shields.io/badge/PM2-deploy-2B037A?style=for-the-badge&logo=pm2&logoColor=white" />
</p>

REST API สำหรับอัปโหลดและลบไฟล์ด้วย Express และ Multer โดยแยก endpoint ตามประเภทไฟล์ เช่น image, PDF, Excel, document และ archive

เหมาะสำหรับใช้งานแบบ local/internal API ที่ต้องการรับไฟล์ผ่าน `multipart/form-data` พร้อม log การเรียกใช้งานและ application error แบบ rotate รายวัน

## Overview

| Area | Detail |
| --- | --- |
| Runtime | Node.js |
| Server | Express |
| Upload parser | Multer |
| Access log | Morgan + file-stream-rotator |
| App/Error log | Winston + winston-daily-rotate-file |
| Default base URL | `http://localhost:3000/api` |
| Upload mode | 1 file ต่อ request |

## Quick Start

ติดตั้ง dependencies:

```bash
npm install
```

สร้างไฟล์ `.env` ที่ root project หรือคัดลอกจาก `.env.example`:

```env
PORT=3000
DEFAULT_MAX_SIZE=5
DEFAULT_MAX_FILES=10
```

เริ่ม server:

```bash
npm start
```

Server จะรันที่:

```text
http://localhost:3000
```

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | มีใน `.env.example` แต่โค้ดปัจจุบันยังใช้ `3000` จาก `server.js` | `3000` |
| `DEFAULT_MAX_SIZE` | ขนาดไฟล์สูงสุด หน่วยเป็น MB | `5` |
| `DEFAULT_MAX_FILES` | ค่าจำนวนไฟล์สูงสุดใน config แต่ endpoint ปัจจุบันรับครั้งละ 1 ไฟล์ | `10` |

## Deployment With PM2

PM2 ใช้สำหรับรัน Node.js app เป็น background process, restart อัตโนมัติเมื่อ process ล้ม, ดู status/logs และทำให้ process กลับมาหลัง server reboot

> สำหรับ production ให้รัน `server.js` โดยตรงผ่าน PM2 ไม่แนะนำให้ใช้ `pm2 start npm -- start` เพราะ `npm start` ของโปรเจกต์นี้ใช้ `nodemon`

### First Deploy

ติดตั้ง PM2 บน server:

```bash
npm install pm2@latest -g
```

เตรียมโปรเจกต์:

```bash
git clone https://github.com/highjunesolution/api-upload-anyfiles.git
cd api-upload-anyfiles
npm ci --omit=dev
```

สร้าง `.env` และแก้ค่าตาม environment จริง:

```bash
cp .env.example .env
```

เริ่ม app ด้วย PM2:

```bash
pm2 start server.js --name upload-anyfiles-api
```

ตรวจสอบสถานะและ log:

```bash
pm2 status
pm2 logs upload-anyfiles-api --lines 100
```

บันทึก process list:

```bash
pm2 save
```

ตั้งให้ PM2 start เองหลัง server reboot:

```bash
pm2 startup
```

หลังรัน `pm2 startup` ให้ copy command ที่ PM2 แสดงออกมาไปรันอีกครั้งตามที่ระบบแนะนำ แล้วจึงรัน:

```bash
pm2 save
```

### Update And Redeploy Workflow

ใช้ workflow นี้เมื่อต้อง update code บน server:

```bash
cd /path/to/api-upload-anyfiles
git status --short
git pull
npm ci --omit=dev
pm2 restart upload-anyfiles-api --update-env
pm2 status
pm2 logs upload-anyfiles-api --lines 100
```

คำอธิบาย:

| Step | Purpose |
| --- | --- |
| `git status --short` | เช็กว่ามี local change ค้างอยู่หรือไม่ก่อน pull |
| `git pull` | ดึง code ล่าสุด |
| `npm ci --omit=dev` | sync dependencies ตาม `package-lock.json` สำหรับ production |
| `pm2 restart ... --update-env` | restart app และโหลด `.env` ใหม่ |
| `pm2 status` | ตรวจว่า process กลับมา online |
| `pm2 logs ...` | ดู error หลัง deploy |

ถ้า update เฉพาะ source code และไม่ได้เปลี่ยน dependencies สามารถข้าม `npm ci --omit=dev` ได้ แต่ถ้า `package.json` หรือ `package-lock.json` เปลี่ยน ให้รันทุกครั้ง

ถ้าเปลี่ยนชื่อ process, start command หรือเพิ่ม process ใหม่ ให้รัน `pm2 save` อีกครั้งหลัง deploy สำเร็จ

### Useful PM2 Commands

| Command | Description |
| --- | --- |
| `pm2 status` | ดู process ทั้งหมด |
| `pm2 logs upload-anyfiles-api` | stream logs ของ app |
| `pm2 logs upload-anyfiles-api --lines 100` | ดู logs ล่าสุด 100 บรรทัด |
| `pm2 monit` | เปิด terminal dashboard |
| `pm2 restart upload-anyfiles-api --update-env` | restart และโหลด environment ใหม่ |
| `pm2 stop upload-anyfiles-api` | หยุด process |
| `pm2 delete upload-anyfiles-api` | ลบ process ออกจาก PM2 |
| `pm2 save` | บันทึก process list ปัจจุบัน |

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
    |-- YYYY_MM_DD-access.0.log
    |-- YYYY_MM_DD-app.log
    |-- YYYY_MM_DD-error.log
    |-- .access-audit.json
    |-- .app-audit.json
    `-- .error-audit.json
```

## Upload Endpoints

ทุก upload endpoint ใช้ field ไฟล์ชื่อ `file` และรับครั้งละ 1 ไฟล์

| Endpoint | File type | Allowed extensions |
| --- | --- | --- |
| `POST /api/upload/image` | Image | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| `POST /api/upload/pdf` | PDF | `.pdf` |
| `POST /api/upload/excel` | Excel / CSV | `.xls`, `.xlsx`, `.csv` |
| `POST /api/upload/document` | Document | `.doc`, `.docx`, `.txt` |
| `POST /api/upload/archive` | Archive | `.zip`, `.rar` |

### Upload Request

Content type:

```text
multipart/form-data
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `dest` | String | Yes | path ปลายทางสำหรับเก็บไฟล์ |
| `file` | File | Yes | ไฟล์ที่ต้องการอัปโหลด ต้องใช้ field ชื่อ `file` |
| `newName` | String | No | ชื่อไฟล์ใหม่ ถ้าไม่ส่ง ระบบจะ generate ให้อัตโนมัติ |

ข้อควรระวัง:

- ส่ง field `dest` ก่อน `file` เพราะ Multer ต้องใช้ `dest` ตอนเลือก destination สำหรับบันทึกไฟล์
- ถ้า `dest` เป็น relative path ระบบจะ resolve จากโฟลเดอร์ `src/middlewares` ตาม implementation ปัจจุบัน
- สำหรับการใช้งานให้ชัดเจน แนะนำให้ส่ง `dest` เป็น absolute path

ตัวอย่างอัปโหลด image:

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

## Logs

ระบบเขียน log ไว้ในโฟลเดอร์ `logs` และ rotate เป็นรายวัน

### Log Files

| File | Description |
| --- | --- |
| `logs/YYYY_MM_DD-access.0.log` | request log จาก Morgan |
| `logs/YYYY_MM_DD-app.log` | application log จาก Winston |
| `logs/YYYY_MM_DD-error.log` | error log จาก Winston เฉพาะ level `error` |
| `logs/.access-audit.json` | metadata ที่ `file-stream-rotator` ใช้ติดตาม access log |
| `logs/.app-audit.json` | metadata ที่ `winston-daily-rotate-file` ใช้ติดตาม app log |
| `logs/.error-audit.json` | metadata ที่ `winston-daily-rotate-file` ใช้ติดตาม error log |

### Rotation Policy

| Setting | Value |
| --- | --- |
| Rotation | Daily |
| Max size | `10m` ต่อไฟล์ |
| Retention | `62d` |
| App log pattern | `YYYY_MM_DD-app.log` |
| Error log pattern | `YYYY_MM_DD-error.log` |
| Access log pattern | `YYYY_MM_DD-access.N.log` |

### Timestamp

| Source | Timezone |
| --- | --- |
| Morgan access log | `Asia/Bangkok` |
| Winston app/error log | timezone ของ server/process |

ถ้าต้องการให้ Winston ใช้ timezone เดียวกับ Morgan ให้ปรับ timestamp formatter ใน `src/utils/logger.util.js`

ตัวอย่าง access log:

```text
2026-06-28 17:20:26 ::1 POST /api/remove/file 200 1.875 ms
```

ข้อควรระวังเกี่ยวกับ audit files:

- ไฟล์ `.audit.json` ไม่ใช่ log แต่เป็น metadata สำหรับ rotation และ retention
- ไม่ควรลบ `.audit.json` ระหว่างใช้งาน เพราะ rotation จะลืมว่าไฟล์เก่าใดต้องถูก cleanup
- Retention จะลบเฉพาะ log files ที่อยู่ใน audit file และเก่ากว่า `62d`
- `access` log มีเลข index เช่น `.0.log`, `.1.log` เพราะ `file-stream-rotator` ใช้ index เมื่อมีการจำกัดขนาดไฟล์

## Error Cases

ตัวอย่าง error response:

```json
{
  "success": false,
  "message": "ไฟล์ใหญ่เกิน 5 MB"
}
```

กรณีที่อาจเกิด error:

| Case | Description |
| --- | --- |
| Missing file | ไม่ส่ง field `file` |
| Missing destination | ไม่ส่ง `dest` |
| Invalid field name | ส่ง field ไฟล์ชื่ออื่นที่ไม่ใช่ `file` |
| Too many files | ส่งไฟล์มากกว่า 1 ไฟล์ต่อ request |
| Invalid extension | นามสกุลไฟล์ไม่ตรงกับ endpoint |
| File too large | ขนาดไฟล์เกิน `DEFAULT_MAX_SIZE` |
| File not found | ลบไฟล์ที่ไม่มีอยู่จริง |
| Request aborted | client ปิด/cancel request ระหว่าง upload |

## Notes

- API นี้ออกแบบสำหรับ local/internal usage ตาม scope ปัจจุบัน
- การตรวจประเภทไฟล์ใช้ extension จากชื่อไฟล์
- `dest` ถูกกำหนดจาก request body ตามกฎการใช้งานของ API นี้
- โฟลเดอร์ `logs`, `node_modules`, `.env` และ upload folder ถูก ignore จาก git ผ่าน `.gitignore`
