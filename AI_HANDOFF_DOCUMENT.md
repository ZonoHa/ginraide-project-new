# 🧠 Ginraide - Master AI Handoff Document
*(เอกสารสำหรับส่งมอบงานให้ AI ตัวใหม่ เพื่อให้เข้าใจบริบททั้งหมดของโปรเจ็กต์ตั้งแต่ต้นจนถึงปัจจุบัน)*

## 1. ข้อมูลทั่วไปของโปรเจ็กต์ (Project Overview)
- **ชื่อโปรเจ็กต์**: Ginraide (กินไรดี)
- **เป้าหมาย**: เว็บแอปพลิเคชันสำหรับค้นหาไอเดียอาหารจากงบประมาณ (คอมโบเซเว่น) และจากวัตถุดิบที่มีในตู้เย็น พร้อมทั้งมีระบบโซเชียล (Community) ให้ผู้ใช้ตั้งกระทู้รีวิว ถาม-ตอบ และแชร์ไอเดียอาหารได้

## 2. Tech Stack & Infrastructure
- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion (สำหรับแอนิเมชัน), Lucide React (สำหรับไอคอน)
- **Backend**: Node.js, Express.js
- **Database ORM**: Prisma
- **Database Provider**: Supabase (PostgreSQL)
- **Deployment**: Vercel (โฮสต์ทั้ง Frontend และ Backend ผ่าน Vercel Serverless Functions)

## 3. โครงสร้างฐานข้อมูล (Database Schema)
ฐานข้อมูลใช้ Prisma ประกอบด้วยตารางหลักๆ ดังนี้:
- **User**: เก็บข้อมูลผู้ใช้ (มี `role` เป็น `USER` หรือ `ADMIN`) มีระบบแบนคอมเมนต์ (`commentBanUntil`)
- **Post**: โพสต์ในชุมชน (เชื่อมกับ User)
- **Comment**: คอมเมนต์ในโพสต์
- **Like**: เก็บประวัติการกดไลก์ (User <-> Post) เพื่อป้องกันการกดไลก์ซ้ำ
- **Product**: วัตถุดิบในเซเว่น (มีราคา, หมวดหมู่)
- **ComboRecipe**: เมนูคอมโบเซเว่น (เก็บราคารวม, เชื่อมกับ Product แบบ Many-to-Many ผ่าน `ComboIngredient`)
- **FridgeIngredient**: วัตถุดิบในตู้เย็น (เนื้อสัตว์, ผัก ฯลฯ)
- **FridgeMenu**: เมนูอาหารทำเอง (เชื่อมกับ FridgeIngredient แบบ Many-to-Many ผ่าน `FridgeMenuIngredient`)

## 4. ฟีเจอร์หลัก (Core Features & Logic)
1. **ระบบ Authentication**:
   - ใช้ JWT (JSON Web Token) เก็บไว้ใน `localStorage` (`ginraide_token`)
   - Token มีอายุ 24 ชั่วโมง
   - จัดการผ่าน `AuthContext` (ล็อกอิน, สมัครสมาชิก, ล็อกเอาต์)
2. **ระบบค้นหาอาหาร (ComboSearch.jsx)**:
   - มี 2 แท็บ: "คอมโบเซเว่น" (ค้นหาตามงบ) และ "เมนูจากตู้เย็น" (ค้นหาตามวัตถุดิบ)
   - UI รองรับมือถือแบบ 2 คอลัมน์ (Grid)
   - แสดงผลเริ่มต้น 6 เมนูแรก หากมีมากกว่านั้นจะมีปุ่ม "ดูทั้งหมด" (View All Toggle)
3. **ระบบ Community (Home.jsx / PostDetail.jsx)**:
   - การแสดงผลคอมเมนต์ออกแบบให้อ่านง่าย (ชื่ออยู่บน ข้อความอยู่ล่าง แบบ Facebook)
   - การแสดงผลรองรับข้อความยาวๆ (ไม่ล้นกรอบทับกัน)
4. **ระบบ Admin Dashboard (AdminDashboard.jsx)**:
   - ตรวจสอบสถิติ (จำนวนสมาชิก, โพสต์, คอมโบ, เมนูตู้เย็น ฯลฯ)
   - มีระบบช่องค้นหา (Search Filter) แบบ Real-time ทุกตาราง
   - ระบบ CRUD จัดการข้อมูลฐานข้อมูลทั้งหมด

## 5. ปัญหาสำคัญที่เคยแก้ไขไปแล้ว (Crucial Bug Fixes History)
*ข้อมูลส่วนนี้สำคัญมาก เพื่อไม่ให้ AI ตัวใหม่ทำพลาดซ้ำ:*
- **Bug ไลก์ติดลบ (Negative Likes)**: เคยเกิดปัญหาผู้ใช้กดไลก์รัวๆ แล้วยอดไลก์รวนจนติดลบ **วิธีแก้ปัจจุบัน**: ย้ายตรรกะการนับไลก์ไปให้ Backend คำนวณความจริงจากฐานข้อมูลทั้งหมด (Count) แทนการบวกลบ (Increment/Decrement) เพื่อให้แม่นยำ 100% และ Frontend ใช้ `Math.max(0, count)` ป้องกัน UI แสดงผลผิดพลาด
- **Bug โพสต์ไม่ขึ้น (Silent 401 Error)**: เมื่อ Token หมดอายุ ผู้ใช้กดโพสต์แล้วนิ่ง ไม่มีอะไรเกิดขึ้น **วิธีแก้ปัจจุบัน**: ดักจับ Error 401 ในฝั่ง Frontend หากเจอให้แสดง Alert แจ้งเตือนผู้ใช้ให้ล็อกอินใหม่ทันที
- **UI รูปภาพทับข้อความ**: การ์ดเมนูเคยมีปัญหาเลย์เอาต์ทับกันเมื่อชื่อเมนูยาว **วิธีแก้ปัจจุบัน**: ใช้ `h-full` และ Flexbox แบบ `justify-between` / `mt-auto` ในการ์ดแทนการกำหนดความสูงตายตัว (Aspect Ratio)

## 6. คำแนะนำสำหรับ AI ที่จะมารับช่วงต่อ (Instructions for Next AI)
- โค้ดทั้งหมดอยู่ในโฟลเดอร์เดียวแต่แบ่งเป็น `frontend/` และ `backend/` 
- การเชื่อมต่อ Backend ใช้ Base URL จาก Environment Variable (`VITE_API_URL` หรือ `/api/...` ผ่าน proxy ตอน dev)
- หาก User ต้องการให้รันโปรเจ็กต์ อย่าลืมเช็คว่า User มีไฟล์ `.env` ในโฟลเดอร์ `backend` เรียบร้อยแล้ว (เพราะไม่ได้นำขึ้น GitHub)
- **คำสั่งรันระบบ (สำหรับ Dev)**: 
  - Backend: `cd backend && npm run dev`
  - Frontend: `cd frontend && npm run dev`

---
*End of Document. AI please acknowledge you have read this and are ready to assist the user.*
