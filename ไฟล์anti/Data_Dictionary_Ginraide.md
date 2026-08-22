# พจนานุกรมข้อมูล (Data Dictionary) ระบบ Ginraide

คำแนะนำ: คุณสามารถก๊อปปี้ตารางด้านล่างนี้ (คลุมดำตั้งแต่ตารางแรกจนถึงตารางสุดท้าย) แล้วนำไปวางในไฟล์ Word ได้เลยครับ ตารางจะจัดรูปแบบคอลัมน์ให้โดยอัตโนมัติ

---

**ตารางที่ 3.2 ข้อมูลผู้ใช้งาน (Users)**
เก็บข้อมูลรหัสผ่าน สิทธิ์การใช้งาน และสถานะบัญชีของผู้ใช้งานในระบบ
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำตัวผู้ใช้งาน | INT AUTO_INCREMENT | PK | – | 1 |
| username | ชื่อผู้ใช้งานสำหรับล็อกอิน | VARCHAR(50) | UQ | – | user123 |
| password | รหัสผ่าน (เข้ารหัสแล้ว) | VARCHAR(255) | – | – | $2b$10$... |
| role | สิทธิ์การใช้งาน (USER, ADMIN) | VARCHAR(10) | – | – | USER |
| bio | ประวัติส่วนตัวแบบย่อ | VARCHAR(255) | – | – | ชอบทำอาหาร |
| profileImageUrl | URL รูปโปรไฟล์ | VARCHAR(255) | – | – | https://.../pic.jpg |
| commentBanUntil | วันที่สิ้นสุดการถูกระงับคอมเมนต์ | TIMESTAMP | – | – | 2026-08-30 09:00:00 |
| createdAt | วันและเวลาที่สร้างบัญชี | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.3 ข้อมูลโพสต์ (Posts)**
เก็บข้อมูลการตั้งกระทู้หรือการแชร์สูตรอาหารในชุมชนออนไลน์
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำโพสต์ | INT AUTO_INCREMENT | PK | – | 1 |
| title | หัวข้อโพสต์ | VARCHAR(150) | – | – | แจกสูตรมาม่าไข่ตุ๋น |
| content | เนื้อหารายละเอียดโพสต์ | TEXT | – | – | ทำง่ายมากแค่ 5 นาที... |
| authorId | รหัสผู้เขียนโพสต์ | INT | FK | Users.id | 10 |
| comboId | รหัสเมนูคอมโบที่แนบมาด้วย (ถ้ามี) | INT | FK | ComboRecipes.id | 2 |
| imageUrl | URL รูปภาพประกอบโพสต์ | VARCHAR(255) | – | – | https://.../post.jpg |
| commentsEnabled | สถานะเปิด/ปิดการคอมเมนต์ | BOOLEAN | – | – | TRUE |
| likesCount | จำนวนยอดไลก์รวมของโพสต์ | INT | – | – | 150 |
| createdAt | วันและเวลาที่ตั้งโพสต์ | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.4 ข้อมูลคอมเมนต์ (Comments)**
เก็บข้อมูลความคิดเห็นที่ผู้ใช้งานพิมพ์ตอบกลับในแต่ละโพสต์
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำคอมเมนต์ | INT AUTO_INCREMENT | PK | – | 1 |
| text | เนื้อหาความคิดเห็น | TEXT | – | – | น่ากินมากๆ ครับ |
| postId | รหัสโพสต์ที่มีการคอมเมนต์ | INT | FK | Posts.id | 5 |
| authorId | รหัสผู้แสดงความคิดเห็น | INT | FK | Users.id | 12 |
| createdAt | วันและเวลาที่คอมเมนต์ | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.5 ข้อมูลการกดไลก์ (Likes)**
เก็บประวัติว่าผู้ใช้คนไหนกดไลก์โพสต์ใดบ้าง (ป้องกันการกดไลก์ซ้ำ)
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| userId | รหัสผู้ใช้งานที่กดไลก์ | INT | PK, FK | Users.id | 10 |
| postId | รหัสโพสต์ที่ถูกกดไลก์ | INT | PK, FK | Posts.id | 5 |

*(หมายเหตุ: ตารางนี้ใช้ Composite Primary Key รวมกันระหว่าง userId และ postId)*

<br/>

**ตารางที่ 3.6 ข้อมูลสินค้าเซเว่น (Products)**
เก็บข้อมูลรายการสินค้าและราคาที่ขายในร้านสะดวกซื้อ
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำสินค้า | INT AUTO_INCREMENT | PK | – | 1 |
| name | ชื่อสินค้า | VARCHAR(150) | – | – | ไข่ลวก |
| price | ราคาสินค้า | FLOAT | – | – | 12.50 |
| category | หมวดหมู่สินค้า | VARCHAR(100) | – | – | อาหารสำเร็จรูป |
| imageUrl | URL รูปภาพสินค้า | VARCHAR(255) | – | – | https://.../egg.jpg |
| createdAt | วันและเวลาที่เพิ่มสินค้า | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.7 ข้อมูลเมนูคอมโบเซเว่น (ComboRecipes)**
เก็บข้อมูลสูตรอาหารที่เกิดจากการนำสินค้าเซเว่นมาผสมกัน
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำเมนูคอมโบ | INT AUTO_INCREMENT | PK | – | 1 |
| name | ชื่อเมนูคอมโบ | VARCHAR(150) | – | – | มาม่าไข่ตุ๋น |
| description | คำอธิบายและวิธีทำ | TEXT | – | – | นำไข่มาตีใส่มาม่า... |
| totalPrice | ราคารวมของสินค้าทั้งหมดในเมนู | FLOAT | – | – | 35.00 |
| imageUrl | URL รูปภาพเมนู | VARCHAR(255) | – | – | https://.../combo.jpg |
| isOfficial | สถานะว่าเป็นเมนูแนะนำจากระบบ | BOOLEAN | – | – | TRUE |
| createdAt | วันและเวลาที่สร้างเมนูคอมโบ | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.8 ข้อมูลวัตถุดิบในตู้เย็น (FridgeIngredients)**
เก็บข้อมูลรายชื่อวัตถุดิบสดหรือของแห้งทั่วไปที่มักมีติดตู้เย็น
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำวัตถุดิบ | INT AUTO_INCREMENT | PK | – | 1 |
| name | ชื่อวัตถุดิบ | VARCHAR(150) | – | – | หมูสับ |
| category | หมวดหมู่วัตถุดิบ | VARCHAR(100) | – | – | เนื้อสัตว์ |
| imageUrl | URL รูปภาพวัตถุดิบ | VARCHAR(255) | – | – | https://.../pork.jpg |
| createdAt | วันและเวลาที่เพิ่มวัตถุดิบ | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.9 ข้อมูลเมนูจากตู้เย็น (FridgeMenus)**
เก็บข้อมูลสูตรอาหารทั่วไปที่ทำจากวัตถุดิบในตู้เย็น
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำเมนูตู้เย็น | INT AUTO_INCREMENT | PK | – | 1 |
| name | ชื่อเมนูตู้เย็น | VARCHAR(150) | – | – | ผัดกะเพราหมูสับ |
| description | คำอธิบายและวิธีทำ | TEXT | – | – | ผัดพริกกระเทียม... |
| imageUrl | URL รูปภาพเมนูตู้เย็น | VARCHAR(255) | – | – | https://.../kaprao.jpg |
| createdAt | วันและเวลาที่สร้างเมนู | TIMESTAMP | – | – | 2026-08-04 09:00:00 |

<br/>

**ตารางที่ 3.10 ข้อมูลส่วนผสมเมนูคอมโบ (RecipeIngredients)**
ตารางเชื่อม (Bridge Table) แบบ Many-to-Many ระหว่างเมนูคอมโบกับสินค้า
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำการเชื่อมโยง | INT AUTO_INCREMENT | PK | – | 1 |
| comboId | รหัสเมนูคอมโบ | INT | FK | ComboRecipes.id | 1 |
| productId | รหัสสินค้าเซเว่น | INT | FK | Products.id | 5 |

<br/>

**ตารางที่ 3.11 ข้อมูลส่วนผสมเมนูตู้เย็น (FridgeMenuIngredients)**
ตารางเชื่อม (Bridge Table) แบบ Many-to-Many ระหว่างเมนูตู้เย็นกับวัตถุดิบ
| Attribute Name | Description | Data Type | Key Type | Reference Table | Sample Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| id | รหัสประจำการเชื่อมโยง | INT AUTO_INCREMENT | PK | – | 1 |
| menuId | รหัสเมนูตู้เย็น | INT | FK | FridgeMenus.id | 1 |
| ingredientId | รหัสวัตถุดิบตู้เย็น | INT | FK | FridgeIngredients.id | 3 |
