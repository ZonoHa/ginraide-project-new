# 🧠 Ginraide Project Memory (Context File)

> **[IMPORTANT INSTRUCTION FOR AI IN THE NEW SESSION]**
> Hello AI! If the user gives you this file, it means they have just reformatted their computer or started a new session. Read this file carefully to understand the context of the "Ginraide" project. This is a Web Application built for a community that shares and discusses food/drink combinations (Combos). 
> **Do not ask the user for basic context.** You are expected to pick up right where we left off based on the "Next Step" section below.

---

## 1. Project Overview & Tech Stack
*   **Project Name:** Ginraide
*   **Path:** `d:\Ginraide_Project`
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion (for animations), Lucide React (for icons), React Router DOM. Runs on port `5173`.
*   **Backend:** Node.js, Express, Prisma ORM, SQLite. Runs on port `5000`.
*   **Authentication:** JWT (JSON Web Tokens) with `Bearer` strategy.

---

## 2. Features Implemented So Far

### 👥 User Module
*   **Auth:** Login/Register with JWT. Role-based system (`ADMIN`, `USER`).
*   **Profile:** Edit bio, upload profile picture, view own posts.
*   **Community Feed (Home):**
    *   Create posts with text and images.
    *   **Post Management (Owner):** Click the 3-dot menu (•••) on your own post to edit text, toggle comments on/off, or delete the post.
    *   **Like System:** Click the heart icon; it turns red (`text-red-500 fill-red-500`) when liked. Optimistic UI update.
    *   **Comment System:** View comments with profile pictures, timestamps, and usernames. Owners can delete comments on their posts.
    *   **Fullscreen Image:** Click on any post image to view it in a dark full-screen overlay (Lightbox).

### 🛡️ Admin Module
*   **Dashboard (`/admin`):** Displays statistics (Users, Posts, Comments, Products).
*   **User Management:** 
    *   Ban users from commenting (3-day ban) via a button on the user's profile.
    *   View **Ban History** (ประวัติการแบน) in the Admin Dashboard and manually unban users.
    *   Delete user accounts entirely.
*   **Content Moderation:** Admins can delete *any* post or *any* comment on the feed.

---

## 3. Database Schema (Prisma)
The database is structured as follows (SQLite):
*   **User:** `id, username, password, role (USER/ADMIN), bio, profileImageUrl, commentBanUntil, createdAt`
*   **Product (วัตถุดิบ):** `id, name, price, category, imageUrl, createdAt`
*   **ComboRecipe (สูตรอาหาร):** `id, name, description, totalPrice, imageUrl, isOfficial, createdAt`
*   **RecipeIngredient:** `id, comboId, productId` (Mapping table)
*   **Post:** `id, title, content, authorId, comboId, imageUrl, commentsEnabled, likesCount, createdAt`
*   **Comment:** `id, text, postId, authorId, createdAt`
*   **Like:** `userId, postId` (Composite ID)

---

## 4. Current Status & Next Steps

**Status:** The core community features (Posting, Liking, Commenting, Moderation, Ban System) are fully functional and styled beautifully with Tailwind.

🎯 **NEXT STEP TO WORK ON:**
**"ระบบจัดการข้อมูลวัตถุดิบ" (Product / Ingredient Management)**
*   **Requirement:** Build the admin features to Add, Edit, and Delete raw materials/products (`Product` model) in the database. This data will be used later to build the "Combo/Recipe" creator.
*   **Note for AI:** The backend routes (`adminController.js`) for products might partially exist or need to be built. The frontend admin dashboard needs a section/tab for managing these products with forms and tables.

---
*(End of Memory File)*
