# สิ่งที่เราทำทั้งหมดในโปรเจกต์นี้

> อธิบายสำหรับ Junior Developer ที่อยากเข้าใจว่าเราทำอะไรไปบ้าง ทำไมถึงทำ และมันทำงานยังไง

---

## ภาพรวมของโปรเจกต์

โปรเจกต์นี้คือ **Timeline App** — แอปสำหรับจัดการ Gantt Chart, ทีมงาน, และการลางาน
สร้างด้วย **Next.js 14** + **TypeScript** + **Tailwind CSS**
ฐานข้อมูลใช้ **NeonDB** (PostgreSQL บน Cloud) และ Deploy ที่ **Vercel**

---

## ขั้นตอนที่ 1 — รันโปรเจกต์ครั้งแรก

### ทำอะไร
```bash
npm install --legacy-peer-deps
npm run dev
```

### ทำไมถึงใช้ `--legacy-peer-deps`
ปัญหาที่เจอคือ package บางตัว (เช่น React 19) มี version ที่ขัดแย้งกัน
`--legacy-peer-deps` บอก npm ว่า "ไม่ต้องเข้มงวดเรื่อง version ขัดแย้ง ให้ลง package ไปก่อน"
เราต้องใส่ไว้ใน `.npmrc` ด้วย เพื่อให้ Vercel ใช้ flag นี้ตอน build อัตโนมัติ

```
# .npmrc
legacy-peer-deps=true
```

---

## ขั้นตอนที่ 2 — ลบ Supabase ออก แล้วเปลี่ยนมาใช้ NeonDB

### ทำไมต้องเปลี่ยน
โปรเจกต์เดิมเชื่อมกับ **Supabase** แต่เราอยากใช้ **NeonDB** แทน เพราะ:
- NeonDB เป็น PostgreSQL serverless ที่เชื่อมกับ Vercel ได้ดีกว่า
- ใช้ connection string มาตรฐานของ PostgreSQL
- ฟรีในระดับที่ใช้งานทั่วไปได้

### สิ่งที่ลบออก
- `src/lib/supabase.ts` — ไฟล์ที่สร้าง Supabase client
- Package `@supabase/supabase-js`
- ปุ่ม "Supabase" ใน Navbar
- `SetupModal` ที่ให้ copy SQL ไปรันใน Supabase

### สิ่งที่เพิ่มเข้ามา
- Package `@neondatabase/serverless` — driver สำหรับเชื่อมต่อ NeonDB

---

## ขั้นตอนที่ 3 — สร้าง API Routes

### ทำไมต้องมี API Routes
แอปเดิมใช้ข้อมูล **demo data** ที่เก็บใน memory (หายทุกครั้งที่ refresh)
เราต้องการเก็บข้อมูลจริงใน database ดังนั้นต้องมี backend endpoint

### โครงสร้าง API ที่สร้าง

```
src/app/api/
├── members/
│   ├── route.ts          ← GET (ดึงทั้งหมด), POST (เพิ่มใหม่)
│   └── [id]/route.ts     ← PUT (แก้ไข), DELETE (ลบ)
├── tasks/
│   ├── route.ts          ← GET, POST
│   └── [id]/route.ts     ← PUT, DELETE
├── leave/
│   ├── route.ts          ← GET, POST
│   └── [id]/route.ts     ← PUT, DELETE
└── projects/
    └── route.ts          ← GET (ดึง project ปัจจุบัน)
```

### วิธีที่ Next.js จัดการ API Routes
ใน Next.js 14 App Router ทุกไฟล์ที่อยู่ใน `app/api/` จะกลายเป็น HTTP endpoint อัตโนมัติ
- `route.ts` ที่มี `export async function GET()` → รองรับ GET request
- `route.ts` ที่มี `export async function POST()` → รองรับ POST request
- โฟลเดอร์ที่ชื่อ `[id]` คือ **dynamic route** รับ id ใดๆ ก็ได้

---

## ขั้นตอนที่ 4 — อัปเดต `page.tsx` ให้ดึงข้อมูลจาก Database

### ก่อนหน้า (ข้อมูล Demo)
```typescript
// ข้อมูลปลอมใน memory — หายทุกครั้งที่ refresh
const demo = useMemo(() => createDemoData(), []);
const [members, setMembers] = useState(demo.members);
const [tasks, setTasks] = useState(demo.tasks);
```

### หลังจาก (ดึงจาก Database)
```typescript
// โหลดข้อมูลจาก API ตอน component mount
useEffect(() => { loadData(); }, []);

async function loadData() {
  const [membersRes, tasksRes, leaveRes, projectRes] = await Promise.all([
    fetch('/api/members'),
    fetch('/api/tasks'),
    fetch('/api/leave'),
    fetch('/api/projects'),
  ]);
  // ... set state จากผลลัพธ์
}
```

### ระบบ Sync อัตโนมัติ
เราสร้าง helper functions (`syncTasks`, `syncMembers`, `syncLeave`) ที่คอย **เปรียบเทียบ state เก่าและใหม่** แล้วส่ง API call ที่เหมาะสม:
- ถ้ามี item ใหม่ → `POST`
- ถ้า item เปลี่ยน → `PUT`
- ถ้า item หาย → `DELETE`

---

## ขั้นตอนที่ 5 — Deploy ขึ้น Vercel

### ทำอะไร
```bash
# สร้าง Git repository
git init
git add .
git commit -m "Initial commit"

# Deploy
vercel --prod
```

### Environment Variables บน Vercel
Vercel ต้องรู้ว่า database อยู่ที่ไหน เราต้องเพิ่ม:
```bash
vercel env add DATABASE_URL production
```
ค่านี้ก็คือ connection string ของ NeonDB

---

## ขั้นตอนที่ 6 — เชื่อม GitHub Repository

```bash
git remote add origin git@github.com:wlapinee/timeline-app.git
git push -u origin main
```

ทำไมใช้ SSH (`git@github.com`) แทน HTTPS (`https://github.com`)?
→ เพราะเครื่องนี้ตั้งค่า SSH key ไว้แล้ว ทำให้ไม่ต้องใส่ password ทุกครั้ง

---

## ขั้นตอนที่ 7 — Migrate ไปใช้ Drizzle ORM (สิ่งสำคัญที่สุด)

### ปัญหาของระบบเดิม
ระบบเดิมที่เราสร้างมีปัญหาหลายอย่างในแง่ production:

| ปัญหา | อธิบาย |
|-------|--------|
| DDL ถูกเรียกตอน runtime | มีปุ่ม "Setup" ที่ผู้ใช้กดแล้วจะ `CREATE TABLE` — อันตราย |
| Race condition | ถ้า 10 คน เปิดเว็บพร้อมกัน → เรียก setup พร้อมกัน 10 ครั้ง |
| ไม่มี migration tracking | ถ้าต้องการเพิ่ม column ในอนาคต ทำไม่ได้ |
| Endpoint สาธารณะ | ใครก็ POST `/api/setup` ได้ |

### Drizzle ORM คืออะไร
**Drizzle** คือ ORM (Object-Relational Mapper) สำหรับ TypeScript
มันทำให้เราเขียน schema และ query ด้วย TypeScript แทนที่จะเขียน SQL ดิบ

```typescript
// แทนที่จะเขียน SQL แบบนี้:
const rows = await sql`SELECT * FROM team_members ORDER BY created_at ASC`;

// เขียนแบบนี้แทน (type-safe, IDE autocomplete):
const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.created_at));
```

### ไฟล์ที่สร้างใหม่

#### `src/db/schema.ts` — นิยาม Schema
```typescript
// บอก Drizzle ว่าแต่ละ table มี column อะไรบ้าง
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role').default('Member'),
  avatar_color: text('avatar_color').default('#3B82F6'),
  created_at: timestamp('created_at').defaultNow(),
});
```

#### `src/db/index.ts` — สร้าง Database Connection
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// ใช้ function (ไม่ใช่ singleton) เพื่อสร้าง connection ใหม่ต่อ request
export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}
```

> **ทำไมใช้ `getDb()` function แทน `const db = drizzle(...)`?**
> ถ้าสร้างเป็น singleton ตอน module load ค่า `DATABASE_URL` อาจยังไม่พร้อม
> การสร้างใหม่ทุก request การันตีว่าได้ environment variable ที่ถูกต้องเสมอ

#### `src/db/migrate.ts` — รัน Migration
```typescript
// Script นี้รันก่อน next build ทุกครั้ง
// มันเอา SQL migration files ไปรันกับ database
await migrate(db, { migrationsFolder: './drizzle' });
```

#### `src/db/seed.ts` — ใส่ข้อมูลเริ่มต้น
```typescript
// ถ้า projects table ว่างเปล่า ให้ insert project แรก
const existing = await db.select().from(projects).limit(1);
if (existing.length === 0) {
  await db.insert(projects).values({ name: 'My Project' });
}
```

### Migration คืออะไร ทำงานยังไง

Migration คือ **ไฟล์ SQL ที่ track ว่า database เคยผ่านการเปลี่ยนแปลงอะไรมาบ้าง**

```
drizzle/
├── 0000_daily_marvel_zombies.sql   ← SQL สำหรับสร้าง tables ครั้งแรก
└── meta/
    └── _journal.json               ← บันทึกว่า migration ไหนถูก apply แล้ว
```

**Flow การทำงาน:**
```
1. แก้ไข schema.ts
       ↓
2. npm run db:generate  →  สร้างไฟล์ SQL ใหม่ใน /drizzle
       ↓
3. npm run build  →  รัน migration อัตโนมัติก่อน build
       ↓
4. Database อัปเดต + App Deploy พร้อมกัน
```

### การแก้ไข Bug: Pooled URL ไม่ทำงานกับ Drizzle

**ปัญหาที่เจอ:**
- Raw SQL query (`neon\`SELECT * FROM projects\``) → คืนข้อมูล ✓
- Drizzle query (`db.select().from(projects)`) → คืน empty array ✗

**สาเหตุ:**
Connection string ที่ได้จาก NeonDB คือแบบ **pooled** (ผ่าน pgBouncer):
```
postgresql://user:pass@ep-xxx-pooler.neon.tech/db?channel_binding=require
```

Parameter `channel_binding=require` และ `-pooler` ใน hostname ทำให้ Drizzle's HTTP adapter ทำงานผิดพลาดแบบ silent (ไม่ error แต่คืน empty)

**วิธีแก้:**
```typescript
export function getDb() {
  const url = (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!)
    .replace('-pooler', '')                      // ใช้ direct connection
    .replace('&channel_binding=require', '');    // เอา parameter ที่มีปัญหาออก
  const sql = neon(url);
  return drizzle(sql, { schema });
}
```

---

## โครงสร้างไฟล์สุดท้าย

```
timeline-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── members/route.ts        ← GET, POST
│   │   │   ├── members/[id]/route.ts   ← PUT, DELETE
│   │   │   ├── tasks/route.ts
│   │   │   ├── tasks/[id]/route.ts
│   │   │   ├── leave/route.ts
│   │   │   ├── leave/[id]/route.ts
│   │   │   └── projects/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                    ← หน้าหลัก, โหลดข้อมูลจาก API
│   ├── components/
│   │   ├── GanttPage.tsx
│   │   ├── LeavePage.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   └── TeamPage.tsx
│   ├── db/
│   │   ├── index.ts                    ← getDb() function
│   │   ├── schema.ts                   ← Table definitions
│   │   ├── migrate.ts                  ← Migration runner
│   │   └── seed.ts                     ← Initial data
│   ├── lib/
│   │   ├── demo-data.ts
│   │   └── holidays.ts
│   └── types/
│       └── index.ts
├── drizzle/                            ← Migration files (auto-generated)
│   ├── 0000_daily_marvel_zombies.sql
│   └── meta/
├── drizzle.config.ts                   ← Drizzle configuration
├── .env.local                          ← DATABASE_URL (ไม่ commit ขึ้น Git)
├── .env.local.example                  ← Template สำหรับ env vars
├── .gitignore
├── .npmrc                              ← legacy-peer-deps=true
├── next.config.js
├── package.json
└── tailwind.config.ts
```

---

## Scripts ที่ใช้บ่อย

```bash
# พัฒนาในเครื่อง
npm run dev

# เมื่อแก้ไข schema.ts → generate migration ใหม่
npm run db:generate

# รัน migration กับ database
npm run db:migrate

# ใส่ข้อมูลเริ่มต้น
npm run db:seed

# เปิด Drizzle Studio (UI สำหรับดูข้อมูลใน database)
npm run db:studio

# Build + migrate + deploy
npm run build
vercel --prod
```

---

## สรุป: ทำไมต้องทำทั้งหมดนี้

```
ก่อน                          หลัง
─────────────────────────────────────────────────────
Demo data (หายตลอด)     →    NeonDB PostgreSQL จริง
Supabase                →    NeonDB + Drizzle ORM
Setup ที่ปุ่ม             →    Migration อัตโนมัติตอน build
Raw SQL strings         →    Type-safe Drizzle queries
ไม่มี Git               →    GitHub + Vercel auto-deploy
```

> **หลักการที่สำคัญ:** Schema ของ database ควรถูก manage ใน code (ผ่าน migration)
> ไม่ใช่รันด้วยมือหรือผ่าน API endpoint ที่ใครก็เรียกได้
