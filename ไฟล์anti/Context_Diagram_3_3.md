# แผนภาพบริบท (Context Diagram)

คุณสามารถแคปรูปด้านล่างนี้ ไปแปะลงในรายงานตรงหัวข้อ "3.3 การวิเคราะห์ระบบ" ได้เลยครับ รูปนี้จำลองโครงสร้างเดียวกับตัวอย่างที่คุณส่งมาเป๊ะเลยครับ

```mermaid
flowchart LR
    %% กำหนดสไตล์ของกล่องและไอคอน
    classDef person fill:#E3F2FD,stroke:#1E88E5,stroke-width:2px,color:#000,shape:circle;
    classDef system fill:#FFF3E0,stroke:#F57C00,stroke-width:3px,color:#000;
    classDef database fill:#E8F5E9,stroke:#43A047,stroke-width:2px,color:#000,shape:cylinder;

    %% กำหนด Node
    Admin(("🛠️<br/>ผู้ดูแลระบบ"))
    User(("👤<br/>สมาชิก"))
    System["💻<br/>ระบบวางแผนมื้ออาหาร<br/>และชุมชนออนไลน์<br/>(Ginraide)"]
    DB[("🗄️<br/>ฐานข้อมูล")]

    %% เชื่อมโยงลูกศร
    Admin <--> System
    System <--> User
    System <--> DB

    %% จัด Layout
    class Admin,User person;
    class System system;
    class DB database;
```

**คำอธิบายใต้ภาพ:**
> **ภาพที่ 3.1** แผนภาพบริบทระบบวางแผนมื้ออาหารตามงบประมาณพร้อมชุมชนออนไลน์สำหรับแลกเปลี่ยนเมนูอาหาร
