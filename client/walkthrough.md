# Admin Portal — Implementation Walkthrough

## ✅ Build Status: PASSING (0 errors, 2504 modules)

---

## What Was Built

### Step 1 — SQL (supabase_schema.sql)

New SQL blocks appended to [supabase_schema.sql](file:///d:/personal%20project/client/supabase_schema.sql):

| Section | Detail |
|---|---|
| Storage bucket `media` | Created with 10MB limit, image-only MIME types |
| Storage RLS: SELECT | Public can read all files in `media` |
| Storage RLS: INSERT/UPDATE/DELETE | Admin-only (uses `is_admin()` function) |
| `blogs.thumbnail_url` | Safe `ALTER TABLE ADD COLUMN IF NOT EXISTS` migration |
| `is_admin()` update | Double-layer: email match **OR** `app_metadata.role = 'admin'` |

> **You must run the SQL sections 6–8 in Supabase SQL Editor** (Dashboard → SQL Editor → New Query → paste → Run).

---

### Step 2 — Auth & Routing

#### [App.jsx](file:///d:/personal%20project/client/src/App.jsx)
- `/` and `/links` → `PublicLayout` (Navbar + Footer preserved)
- `/admin-portal` → `AdminLayout` (NO Navbar, NO Footer — full-screen)

#### [AdminGuard.jsx](file:///d:/personal%20project/client/src/components/admin/AdminGuard.jsx)
- Checks `session.user.email === VITE_ADMIN_EMAIL` (Layer 1)
- Checks `session.user.app_metadata.role === 'admin'` (Layer 2)
- Shows "ACCESS DENIED" screen + auto-redirects to `/` if unauthorized

---

### Step 3 — Reusable Components

| Component | Path |
|---|---|
| `Toast.jsx` + `useToast` hook | [Toast.jsx](file:///d:/personal%20project/client/src/components/admin/Toast.jsx) |
| `ImageUpload.jsx` | [ImageUpload.jsx](file:///d:/personal%20project/client/src/components/admin/ImageUpload.jsx) |
| `RichTextEditor.jsx` | [RichTextEditor.jsx](file:///d:/personal%20project/client/src/components/admin/RichTextEditor.jsx) |

**ImageUpload features:** Drag-and-drop, file type + 10MB size validation, Supabase Storage path `media/projects/` or `media/blogs/`, upload progress bar, preview with hover controls, simulation mode fallback.

**RichTextEditor toolbar:** Bold, Italic, Inline Code, H1/H2/H3, Bullet List, Ordered List, Blockquote, Code Block, Horizontal Rule, Link, Undo/Redo — all styled Industrial.

---

### Step 4 — CRUD Forms

| Form | Supports |
|---|---|
| [ProjectForm.jsx](file:///d:/personal%20project/client/src/components/admin/ProjectForm.jsx) | Create + Inline Edit, ImageUpload, TipTap content, Featured toggle |
| [BlogForm.jsx](file:///d:/personal%20project/client/src/components/admin/BlogForm.jsx) | Create + Inline Edit, Auto-slug from title, ImageUpload, TipTap content, Published toggle |
| [LinkForm.jsx](file:///d:/personal%20project/client/src/components/admin/LinkForm.jsx) | Create + Inline Edit, Icon picker, Is_Active toggle, Sort order |

Updated [validations.js](file:///d:/personal%20project/client/src/lib/validations.js): `projectSchema` + `thumbnail_url`, `content` fields; `blogSchema` + `thumbnail_url`.

---

### Step 5 — Admin Dashboard

Full rewrite of [AdminPortalPage.jsx](file:///d:/personal%20project/client/src/pages/AdminPortalPage.jsx):

```
AdminPortalPage
├── Login Screen (Email/Password only, no OAuth)
│   └── Simulation mode (any email/password)
└── AdminGuard → Dashboard
    ├── Top Bar (operator ID, LED indicator, refresh, logout)
    ├── Tab Nav (Projects | Blogs | Links | Messages)
    │
    ├── Tab PROJECTS
    │   ├── Left: ProjectForm (Create / Edit inline)
    │   └── Right: Project list (Edit, Delete, thumbnail preview, tech tags)
    │
    ├── Tab BLOGS [NEW]
    │   ├── Left: BlogForm (Create / Edit inline)
    │   └── Right: Blog list (Edit, Delete, Quick publish toggle)
    │
    ├── Tab LINKS
    │   ├── Left: LinkForm (Create / Edit inline)
    │   └── Right: Link list (Edit, Delete, Quick active toggle)
    │
    ├── Tab MESSAGES [NEW]
    │   └── Card grid (Mark Read/Unread, Delete, unread badge on tab)
    │
    ├── Confirm Delete Modal (AnimatePresence)
    ├── Toast Notifications (bottom-right, 3s auto-dismiss)
    └── Status bar (RLS status indicator)
```

---

## Required: Manual Setup Steps

### 1. Set admin email in `.env`
```bash
# d:\personal project\client\.env
VITE_ADMIN_EMAIL=your-actual-email@gmail.com
```

### 2. Run SQL in Supabase SQL Editor

Copy sections **6, 7, and 8** from [supabase_schema.sql](file:///d:/personal%20project/client/supabase_schema.sql) and run them. Then **update the email** in the `is_admin()` function:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated'
    AND (
      auth.jwt() ->> 'email' = 'your-actual-email@gmail.com'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. (Optional) Set `app_metadata.role = 'admin'` for double-layer security

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-actual-email@gmail.com';
```

### 4. Create a Supabase Auth user

Go to Supabase Dashboard → **Authentication → Users → Add user** with your admin email and password.

---

## New Dependencies Added

```json
"@tiptap/react": "^2.x",
"@tiptap/pm": "^2.x",
"@tiptap/starter-kit": "^2.x",
"@tiptap/extension-heading": "^2.x",
"@tiptap/extension-code-block-lowlight": "^2.x",
"@tiptap/extension-link": "^2.x",
"@tiptap/extension-placeholder": "^2.x",
"@tiptap/extension-image": "^2.x",
"lowlight": "^3.x"
```

---

## Verify Locally

```bash
npm run dev
# Then open: http://localhost:5173/admin-portal
```
