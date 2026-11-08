# นรารู้ไทย — การใช้งานในเครื่อง

- เปิดทั้งเว็บและ API: `npm run dev` (เว็บ http://localhost:5173 และ API http://localhost:3001)
- API ใช้ MongoDB ตาม `MONGO_URI` ใน `server/.env` และใช้ `JWT_SECRET` ลงชื่อโทเค็น ห้ามนำค่าจริงขึ้น Git
- ทดสอบโดยไม่ใช้ฐานข้อมูล: `npm test`
- ทดสอบ API กับ MongoDB ที่กำหนด: `npm run test:integration` ต้องเปิด API ก่อน ชุดทดสอบสร้างบัญชีชั่วคราวและลบเฉพาะข้อมูลของชุดทดสอบหลังจบ
- สร้างเว็บ: `npm run build`

## สถานะผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ

หน้าสมัคร/เริ่มต้นใช้งานมีช่องติ๊กถัดจากอายุ บันทึกเป็น `is_literacy_learner` ชนิด boolean ติ๊กเป็น true ไม่ติ๊กเป็น false และข้อมูลเก่าที่ไม่มีช่องนี้อ่านเป็น false โดยไม่เขียนทับข้อมูลย้อนหลัง แสดงสถานะในแดชบอร์ดและรายชื่อผู้ใช้ของผู้ดูแล เมื่อกลับเข้าผ่านฟอร์มเริ่มต้นอีกครั้งจะใช้ค่าที่ติ๊กในครั้งนั้น

## การใช้ไมโครโฟนในข้อพูด

การเปลี่ยนข้อระหว่างไมค์ทำงานจะรอ end ของบริการเดิมก่อนให้เริ่มข้อใหม่ แสดงสถานะกำลังปิดไมค์และกันเปิดซ้อน การ cleanup ทำซ้ำได้โดยไม่ abort ไมค์ที่จบแล้ว หากบริการไม่ส่ง end จะปลดปุ่มให้ผู้ใช้กดลองใหม่ภายใน 3 วินาที ทดสอบจำลองข้อ 29 ไป 30 รวมถึง end มาช้าและสัญญาณเก่ามาถึงหลังเปิดข้อใหม่ ผ่านทั้ง controller และหน้าเว็บจำลอง

ตรวจข้อพูด 26–40 ครบทั้งข้อสอบรวมและหน้าฝึกแล้ว เติมไฟล์เสียงคำถาม 15 ไฟล์และใช้เส้นทางเดียวกัน ครั้งแรกแยกการขอสิทธิ์ด้วย getUserMedia ออกจากการเริ่ม SpeechRecognition เพื่อเริ่มรู้จำเสียงจากการแตะโดยตรงและปล่อย capture เดิมก่อน เปิดไมค์แล้วหยุดเสียงคำถาม ปุ่มเริ่มฟังจะแสดงเมื่อได้รับ audiostart และรวมข้อความทุกช่วงในผลลัพธ์ การทดสอบจำลองไม่ทดแทนการพูดบนอุปกรณ์จริง หากเบราว์เซอร์หรือบริการรู้จำเสียงไม่รองรับ ยังต้องตรวจสาเหตุบนเครื่องนั้นเพิ่มเติม

ข้อสอบรวมและหน้าฝึกการพูดใช้ปุ่มไมโครโฟนเดียวกัน แสดงสถานะเปิดไมค์/ฟัง/แปลงข้อความ ยกเลิกตอนรออนุญาตได้ หากไม่เริ่มภายใน 20 วินาทีจะแจ้งวิธีแก้และให้ลองใหม่ เมื่อเปลี่ยนข้อจะยกเลิกคำขอเดิมเพื่อไม่ให้เสียงไปลงผิดข้อ ไม่มีการให้คะแนนหรือสร้างคำตอบเมื่อการรู้จำเสียงล้มเหลว

บน iPad/iPhone ให้เปิดใน Safari อนุญาตไมโครโฟนของเว็บไซต์ และเปิด Siri ตามข้อกำหนดของ [WebKit](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/) เว็บไม่สามารถเปิดสิทธิ์หรือ Siri แทนผู้ใช้ได้ บริการรู้จำเสียงยังขึ้นกับระบบปฏิบัติการ เบราว์เซอร์ และเครือข่าย ทดสอบ lifecycle ด้วย speech-recognition.test.mjs โดยจำลอง permission/network/timeout/result/cancel แต่ต้องยืนยันเสียงจริงกับ iPad อีกครั้ง

## หน้าผู้ดูแลและรายละเอียดผู้เรียน

หน้าแอดมินสรุปผู้เรียน (ไม่รวมเจ้าหน้าที่) ผู้เรียนกิจกรรมรู้หนังสือ ผู้ผ่านเกณฑ์ และงานรอตรวจ กรองตามผลสอบ/กิจกรรม ค้นหาชื่อ บัญชี ที่อยู่หรือการศึกษา เรียงคะแนนหรือวันสอบ และแบ่งรายชื่อหน้าละ 20 คน รายละเอียดรายคนแสดงข้อมูลส่วนตัว ประวัติทุกครั้ง คะแนนเฉลี่ย/สูงสุดจากผลที่ตรวจครบ และผลแยกทักษะจากข้อสอบรวมครั้งล่าสุดที่ตรวจครบ ก่อนเปิดตรวจคำตอบรายข้อ

`GET /admin/users` รวมจำนวนครั้งสอบแบบรวม วันสอบล่าสุด และจำนวนข้อรอตรวจจากประวัติทั้งหมดใน aggregation เดียว ฟิลด์เดิมยังใช้งานได้ คะแนน 0 ที่ตรวจครบไม่ถือว่ายังไม่สอบ หน้าประวัติรวมยังแสดงล่าสุดสูงสุด 300 ครั้งและระบุขอบเขตไว้ชัดเจน ส่วนรายละเอียดรายคนอ่านประวัติครบ ค่าเฉลี่ยปรับเป็นร้อยละตามคะแนนเต็มและไม่นำผลรอตรวจมาคิดรวม ไม่มีการปรับคะแนนหรือย้ายข้อมูลเดิม

## การแสดงผลตามอุปกรณ์

ใช้ขนาดตัวอักษร ระยะขอบ และพื้นที่การ์ดแบบยืดหยุ่นจาก responsive.css เคารพขนาดตัวอักษรที่ผู้ใช้ตั้งไว้ ช่องกรอกไม่ต่ำกว่า 16px เพื่อลดการซูมขณะกรอกบนมือถือ แบบฟอร์มสลับจำนวนคอลัมน์ตามพื้นที่ ข้อสอบลดพื้นที่ว่างตายตัว ตารางกว้างเลื่อนภายในกรอบ และหน้าต่างแอดมินจำกัดความสูงพร้อมเลื่อนเนื้อหาบนจอแนวนอน โดยยังซูมหน้าเว็บได้

ตรวจ 12 หน้าหลักที่ความกว้าง 320, 390, 768, 844, 1024, 1440 และ 1920 CSS px รวม 104 กรณีเมื่อรวมชนิดข้อสอบและหน้าต่างต่าง ๆ ไม่พบหน้าเว็บล้นแนวนอนในการตรวจ ข้อมูลทดสอบถูกลบหลังตรวจ การทดสอบ viewport ไม่ทดแทนการตรวจบนอุปกรณ์จริงทุกยี่ห้อ

## แดชบอร์ดผู้เรียน

แสดงคะแนนรวมสูงสุดที่ตรวจครบจาก endpoint คะแนนเดิม และผลแยก 4 ทักษะจากข้อสอบรวมครั้งล่าสุดที่ตรวจครบในประวัติ แยกสถานะยังไม่มีผล รอตรวจ และผ่าน/ยังไม่ผ่าน ไม่แสดงผู้ที่ยังไม่สอบเป็นสอบตก ประวัติใช้ขอบเขตเดิมล่าสุด 50 ครั้ง กรองสถานะและเรียงร้อยละได้ แบ่งแสดงหน้าละ 10 ครั้ง ค่าเฉลี่ยใช้เฉพาะผลที่ตรวจครบและปรับตามคะแนนเต็ม หน้ารายละเอียดคำตอบยังใช้ ScoreDetailModal เดิม เมื่อโหลดไม่สำเร็จจะแจ้งข้อผิดพลาดพร้อมปุ่มลองใหม่

## การแสดงข้อสอบทีละข้อ

ข้อสอบรวมและหน้าฝึกทั้งสี่ทักษะแสดงครั้งละหนึ่งข้อ มีแถบเลขข้อด้านบนเพื่อเลือกข้ามหรือย้อนกลับ สีม่วงแสดงข้อปัจจุบันและจุดเล็กใต้เลขแสดงข้อที่ตอบแล้ว แถบเลขเป็นแถวเดียวเลื่อนแนวนอนได้ ใช้ปุ่มย้อนกลับ/ถัดไป และแสดงปุ่มส่งคำตอบที่ข้อสุดท้าย คำตอบยังอยู่เมื่อย้อนกลับ เสียงและบทอ่านร่วมยังแสดงในข้อที่เกี่ยวข้อง นาฬิกาสอบไม่เริ่มใหม่เมื่อเปลี่ยนข้อ

## พฤติกรรมหลังแก้ข้อ 2–12 (7 พ.ย. 2026)

`POST /users/score` รับ `{skill, level:1, submissionId, responses:[{id,value}]}` เซิร์ฟเวอร์ตรวจคำตอบกับชุดข้อสอบของแต่ละทักษะเอง ไม่รับคะแนนที่คำนวณจากไคลเอนต์ รหัส `submissionId` เดิมใช้ส่งซ้ำได้โดยไม่เพิ่มประวัติอีกครั้ง

ข้อเขียนปลายเปิดและข้อพูดที่ไม่มีเฉลยตายตัวเป็น `pending_count` และ `is_correct:null` เจ้าหน้าที่ตรวจจากหน้ารายละเอียดผลสอบด้วยปุ่มให้ 1 หรือ 0 คะแนน ระบบตรวจสิทธิ์ผู้ดูแลปัจจุบันในฐานข้อมูลทุกครั้ง ผลรอตรวจยังไม่ถูกนำไปจัดอันดับหรือใช้เป็นคะแนนสูงสุดที่ตรวจครบแล้ว ใช้เกณฑ์ผ่านรวม 70% ตรงกันทั้งผลสอบ แดชบอร์ด และหน้าผู้ดูแล

คำตอบและเวลาสอบใน sessionStorage แยกตามรหัสผู้ใช้ ใช้เวลาสิ้นสุดจริง เมื่อบันทึกไม่สำเร็จจะแจ้งข้อผิดพลาดและเก็บคำตอบไว้ ผู้ใช้ส่งใหม่ได้ ส่วนประวัติข้อ 51–55 ที่มีข้อความเฉลยเดิมจะแสดงป้ายข้อเท็จจริง/ข้อคิดเห็นให้ถูกต้องโดยไม่เขียนทับข้อมูลเก่า

การเข้าระบบด้วยชื่ออย่างเดียวคงไว้ตามคำขอ จึงยังมีความเสี่ยงจากผู้ใช้ชื่อเหมือนกันหรือผู้ที่รู้ชื่อบัญชีเดิม การตรวจคำตอบบนเซิร์ฟเวอร์ไม่ได้ทดแทนการคุมสอบหรือการตรวจหลักฐานเสียงจริง

เผยแพร่ UI ข้อสอบทีละข้อ และสถานะผู้เรียนขึ้น Vercel โปรเจกต์ thai-assessment-full แล้วเมื่อ 7 พ.ย. 2026 โดยใช้ MongoDB เดิม

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


### Recorded speaking answers

Full-test questions 26–40 and the speaking practice now use MediaRecorder, not browser speech recognition. The learner taps to record, then stops to upload to the existing authenticated MongoDB API. Every recorded answer is pending manual review, including tongue twisters. Previous transcript-based history remains unchanged.

- Each recording is limited to 90 seconds and 2 MiB. Safari MP4/AAC, Chromium WebM and Ogg are accepted. No transcription provider or new external storage is used.
- `POST /users/speaking-audio/:uuid?submissionId=:uuid&skill=conversation|full_test&questionId=26..40` accepts the raw audio body with its audio Content-Type and the existing Bearer token. Retries use the same immutable recording ID. Up to 60 clips per attempt allow retakes.
- `/users/score` accepts optional `audioId` alongside the existing response `{id,value}`. The server verifies owner, question, skill and attempt before attaching it; audio never earns automatic points.
- `GET /users/speaking-audio/:uuid` requires the owner or a currently authorized admin. Responses are private/no-store. Audio is fetched with authorization, then played using a local blob URL; credentials are never placed in media URLs.
- Unsubmitted/replaced uploads expire after 24 hours through a MongoDB TTL index. Submitted recordings follow the existing exam-history retention and are removed when that learner is deleted. No existing records are migrated.
- Recording or an unsent draft locks question navigation. Failed uploads retain their local blob and recording ID for retry; leaving/reloading before upload succeeds can lose that draft. Uploaded references survive page reload for the current attempt.
- iOS 27 hardware recording still needs device verification. This avoids the Safari SpeechRecognition service, but microphone permission and working hardware remain necessary.

Regression checks: `npm test`; against a running local test API: `TEST_API_BASE=http://localhost:3002 node --env-file=server/.env server/recorded-speaking-api.test.js <synthetic-audio.m4a>`. The integration test creates and cleans only its own uniquely named accounts and audio.
