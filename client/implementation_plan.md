# Admin Portal & CRUD Workflow — Implementation Plan

## Tổng quan

Xây dựng đầy đủ hệ thống `/admin-portal` bao gồm: xác thực Supabase Email/Password, bảo vệ route (ẩn Navbar/Footer), upload ảnh lên Supabase Storage, WYSIWYG editor TipTap, và CRUD đầy đủ cho Projects, Blogs, Links, Messages.

---

## Quyết định thiết kế đã xác nhận

| Hạng mục | Lựa chọn |
|---|---|
| Auth | Email/Password Supabase (bỏ OAuth) |
| Admin Guard | Double layer: email check + app_metadata.role === 'admin' |
| WYSIWYG | **TipTap** (headless, easy to style) |
| Storage | Supabase bucket `media` → sub-folders `/projects`, `/blogs` |
| Edit UX | Inline Edit — click Edit điền vào form bên trái |
| Notifications | Toast cố định góc phải, tự đóng 3s |
| Messages | Mark as Read + Delete |
| Layout | Ẩn hoàn toàn Navbar & Footer khi ở `/admin-portal` |
| Language | Bilingual Vi + En như hiện tại |
| Blogs schema | Thêm cột `thumbnail_url` vào bảng `blogs` |

---

## User Review Required

> [!IMPORTANT]
> **VITE_ADMIN_EMAIL trong `.env` hiện đang là `[EMAIL_ADDRESS]`** — bạn cần điền email thực của mình vào trước khi deploy. Tôi sẽ dùng biến này làm tham chiếu trong code.

> [!WARNING]
> **Double-layer admin check**: frontend check email vs `VITE_ADMIN_EMAIL` để redirect tức thì. SQL function `is_admin()` cần được update với email thực. Bạn cần chạy SQL script cập nhật hàm `is_admin()` trong Supabase SQL Editor.

> [!IMPORTANT]
> **Schema Migration**: Sẽ thêm cột `thumbnail_url TEXT` vào bảng `blogs`. Nếu bạn đã có dữ liệu trong bảng `blogs`, migration này hoàn toàn an toàn (nullable column).

---

## Open Questions

> [!NOTE]
> Không còn câu hỏi mở. Tất cả đã được xác nhận ở trên.

---

## Proposed Changes

### STEP 1 — SQL Setup (supabase_schema.sql additions)

#### [MODIFY] [supabase_schema.sql](file:///d:/personal%20project/client/supabase_schema.sql)

Thêm vào cuối file SQL hiện có (không xóa gì cũ):
- Tạo Supabase Storage bucket `media` qua SQL
- Apply Storage RLS policies (Public READ, Admin-only INSERT/DELETE)
- Migrate bảng `blogs`: thêm cột `thumbnail_url`
- Update hàm `is_admin()` để hỗ trợ double-layer check

---

### STEP 2 — Auth & Routing

#### [MODIFY] [App.jsx](file:///d:/personal%20project/client/src/App.jsx)

- Wrap `/admin-portal` trong `AdminLayout` riêng (không render Navbar/Footer)
- Thêm `AdminGuard` component: kiểm tra session + email authorization → redirect nếu unauthorized

#### [NEW] `src/components/admin/AdminGuard.jsx`

- HOC bảo vệ route admin
- Kiểm tra `supabase.auth.getSession()`
- So sánh `session.user.email` với `import.meta.env.VITE_ADMIN_EMAIL`
- Kiểm tra `session.user.app_metadata?.role === 'admin'`
- Nếu không pass → redirect về `/`

---

### STEP 3 — Reusable Components

#### [NEW] `src/components/admin/Toast.jsx`

- Fixed position, bottom-right
- Auto-dismiss sau 3 giây
- Variants: success (green), error (red), info (amber)
- Industrial style với LED indicator

#### [NEW] `src/components/admin/ImageUpload.jsx`

- File picker input với drag-and-drop
- Upload lên Supabase Storage: `supabase.storage.from('media').upload(path, file)`
- Path pattern: `projects/{timestamp}-{filename}` hoặc `blogs/{timestamp}-{filename}`
- Trả về public URL qua `supabase.storage.from('media').getPublicUrl(path)`
- Preview ảnh sau upload
- Loading spinner trong quá trình upload
- Industrial Skeuomorphism style: recessed drop zone, progress bar

#### [NEW] `src/components/admin/RichTextEditor.jsx`

- Tích hợp TipTap với extensions: StarterKit, Heading (H1-H3), Bold, Italic, BulletList, OrderedList, CodeBlock, Link
- Toolbar tùy chỉnh theo Industrial style (monospace, mechanical buttons)
- Output: HTML string để lưu vào Supabase

---

### STEP 4 — CRUD Forms

#### [MODIFY] `src/lib/validations.js`

- Update `projectSchema`: thêm `thumbnail_url`, `content` (optional TipTap HTML)
- Update `blogSchema`: thêm `thumbnail_url`
- Thêm `messageSchema` cho delete confirmation

#### [NEW] `src/components/admin/ProjectForm.jsx`

- Reusable form cho Create + Edit Projects
- Fields: Title, Category, Description, Problem, Solution, Tech Stack, Live URL, GitHub URL, Thumbnail (ImageUpload), Featured toggle, Content (RichTextEditor)
- Zod validation trước khi submit
- Loading state trên Save button

#### [NEW] `src/components/admin/BlogForm.jsx`

- Reusable form cho Create + Edit Blogs
- Fields: Title, Slug (auto-generate từ title + editable), Summary, Tags (comma-separated), Thumbnail (ImageUpload), Content (RichTextEditor), Published toggle
- Zod validation

#### [NEW] `src/components/admin/LinkForm.jsx`

- Form cho Create + Edit Links
- Fields: Title, Category, URL, Description, Icon Name, Badge Text, Is_Active toggle
- Zod validation

---

### STEP 5 — Dashboard Assembly

#### [MODIFY] [AdminPortalPage.jsx](file:///d:/personal%20project/client/src/pages/AdminPortalPage.jsx)

**Hoàn toàn rewrite** với kiến trúc mới:

```
AdminPortalPage
├── Login Screen (Email/Password only)
├── AdminGuard (auth check)
└── Dashboard (4 tabs)
    ├── Tab: PROJECTS (ProjectForm + ProjectList)
    ├── Tab: BLOGS (BlogForm + BlogList) [NEW]
    ├── Tab: LINKS (LinkForm + LinkList)
    └── Tab: MESSAGES (MessageList + Mark Read/Delete)
```

**Thay đổi chính so với hiện tại:**
- Xóa OAuth buttons
- Thêm Tab BLOGS và Tab MESSAGES (đang thiếu)
- Inline Edit: click Edit → form tự điền (editingId state)
- Messages: danh sách read-only + mark read + delete + unread badge count trên tab
- Toast notification thay thế statusMessage banner
- Fetch messages từ Supabase (hiện chưa có)

---

### STEP 6 — Dependencies

Cài thêm:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-heading @tiptap/extension-code-block @tiptap/extension-link @tiptap/extension-placeholder
```

---

## Verification Plan

### Automated
- Không có unit tests hiện tại → kiểm tra thủ công

### Manual Verification
1. Chạy `npm run dev` → truy cập `/admin-portal`
2. Verify: Navbar & Footer không render
3. Login với email/password sai → error message xuất hiện
4. Login thành công → kiểm tra guard redirect nếu email không khớp
5. Tạo Project mới với thumbnail upload → kiểm tra Supabase Storage + DB
6. Tạo Blog mới với TipTap content → kiểm tra HTML được lưu đúng
7. Edit inline → form điền sẵn data
8. Xóa record → confirm dialog → record biến khỏi list
9. Tab Messages → xem list → mark read → unread badge giảm
10. Toast notifications xuất hiện/đóng đúng
