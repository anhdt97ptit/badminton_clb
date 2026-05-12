# Implementation Plan: Member Page

## Tổng quan

Kết nối trang `/members` (UI đã có) với PostgreSQL thông qua Route Handlers. Dữ liệu hardcoded được thay bằng API calls thực sự. `wins`/`losses`/`winRate` được tính toán trực tiếp từ `match_results` qua JOIN query — không lưu cache trong DB.

---

## Phân tích hiện trạng

### Đã có

- UI hoàn chỉnh: `src/app/members/page.tsx`, `src/components/member-card.tsx`, `src/components/add-member-modal.tsx`, `src/components/member-detail-modal.tsx`
- DB client: `db/index.ts` (Drizzle + pg Pool)
- Service skeleton: `server/services/member.service.ts` (tham chiếu `users` — sẽ thay bằng `members`)
- Zod schema: `src/lib/validations/member.ts` (cần sửa nhỏ)

### Vấn đề cần giải quyết

| Vấn đề                                  | Hành động                                      |
| --------------------------------------- | ---------------------------------------------- |
| Dùng `users` table cho member           | Tạo bảng `members` riêng, xử lý `users` sau    |
| Schema thiếu `birth_year`, `phone`      | Thiết kế lại toàn bộ DB schema                 |
| `match_players.user_id` → sai FK        | Đổi thành `member_id` FK → `members.id`        |
| `wins`/`losses` hardcoded trong UI      | Tính từ JOIN `match_players` + `match_results` |
| `memberSchema` phone required, regex VN | Đổi thành optional, digits 10–15               |
| `memberSchema` birthYear min 1930       | Đổi thành 1900                                 |
| Không có Route Handlers                 | Tạo mới                                        |
| `add-member-modal` dùng `alert()`       | Dùng Zod, inline errors                        |

---

## Thiết kế DB Schema mới

### Thay đổi so với schema cũ

| Bảng cũ         | Trạng thái            | Ghi chú                                                                          |
| --------------- | --------------------- | -------------------------------------------------------------------------------- |
| `users`         | Giữ nguyên, không xoá | Có thể dùng cho auth sau này                                                     |
| `matches`       | Thay đổi              | Bỏ `created_by`                                                                  |
| `match_players` | Thay đổi              | `user_id` → `member_id` FK → `members`                                           |
| `match_results` | Thay đổi              | Đổi tên cột `score_a/score_b`, giữ `winner_team`, thêm UNIQUE + CHECK constraint |
| `members`       | **Tạo mới**           | Thay thế `users` cho member management                                           |

### Schema mới

```
members
├── id          uuid PK defaultRandom()
├── name        text NOT NULL
├── birth_year  integer nullable
├── phone       text nullable
└── created_at  timestamp NOT NULL defaultNow()

matches
├── id          uuid PK defaultRandom()
├── played_at   timestamp NOT NULL defaultNow()
└── note        text nullable   -- ghi chú tuỳ chọn

match_players
├── id          uuid PK defaultRandom()
├── match_id    uuid FK → matches.id  ON DELETE CASCADE
├── member_id   uuid FK → members.id
└── team        teamEnum NOT NULL     -- 'A' | 'B'
  UNIQUE (match_id, member_id)        -- mỗi người chỉ xuất hiện 1 lần/trận

match_results
├── id          uuid PK defaultRandom()
├── match_id    uuid FK → matches.id  ON DELETE CASCADE  UNIQUE
├── score_a     integer NOT NULL
├── score_b     integer NOT NULL
└── winner_team teamEnum NOT NULL     -- 'A' | 'B'
  CHECK: (score_a > score_b AND winner_team = 'A') OR (score_b > score_a AND winner_team = 'B')
```

### Lý do thiết kế

- **`members` tách khỏi `users`**: `users` có thể dùng cho authentication sau này; `members` là domain entity của ứng dụng.
- **Bỏ `match_type`**: Số người chơi đã ngầm định từ số rows trong `match_players` (2 người = 1v1, 4 người = 2v2) — không cần lưu riêng.
- **Giữ `winner_team` + CHECK constraint**: Mặc dù có thể suy ra từ điểm số, việc lưu trực tiếp giúp query wins/losses đơn giản hơn nhiều (`mp.team = mr.winner_team` thay vì CASE WHEN multi-condition). CHECK constraint đảm bảo `winner_team` luôn nhất quán với `score_a`/`score_b` ở DB level — loại bỏ nguy cơ inconsistency.
- **`match_players` có UNIQUE(match_id, member_id)**: Ngăn chọn trùng người ở DB level (defense in depth).
- **`match_results.match_id` là UNIQUE**: Một trận chỉ có một kết quả duy nhất, enforce bằng DB constraint.
- **CASCADE DELETE từ `matches`**: Xoá trận → tự xoá `match_players` và `match_results`, tránh orphan rows.
- **Bỏ `matches.created_by`**: Không cần thiết cho MVP, thêm lại khi có auth.
- **Không lưu `wins`/`losses` trong DB**: Tính toán realtime từ JOIN — luôn chính xác, không cần sync.

---

## Cách tính wins / losses / winRate

`winner_team` được lưu sẵn nên query rất gọn — chỉ so sánh `mp.team = mr.winner_team`:

```sql
SELECT
  m.id,
  m.name,
  m.birth_year,
  m.phone,
  COUNT(CASE WHEN mp.team = mr.winner_team THEN 1 END)  AS wins,
  COUNT(CASE WHEN mp.team != mr.winner_team THEN 1 END) AS losses
FROM members m
LEFT JOIN match_players mp ON mp.member_id = m.id
LEFT JOIN match_results mr ON mr.match_id = mp.match_id
GROUP BY m.id
```

`winRate = wins / (wins + losses) * 100` — tính trong service layer, trả về 0 nếu chưa có trận nào.

Dùng Drizzle ORM với `sql<number>` template và `.leftJoin` — không viết raw SQL.

**Lưu ý khi insert `match_results`**: application phải tính `winner_team` từ `score_a`/`score_b` trước khi insert. CHECK constraint ở DB sẽ reject nếu giá trị không khớp.

---

## Shape dữ liệu

### DB row `members`

```ts
{
  id: string;
  name: string;
  birth_year: number | null;
  phone: string | null;
  created_at: Date;
}
```

### API response `Member` (shape UI đang dùng)

```ts
{
  id: string;
  name: string;
  birthYear: number | null;
  phone: string;
  wins: number; // tính từ match_results
  losses: number; // tính từ match_results
  winRate: number; // tính từ wins / (wins + losses) * 100
  avatar: string; // computed: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
}
```

---

## Các bước thực hiện

### Bước 1 — Cập nhật Zod schema

**File:** `src/lib/validations/member.ts`

```ts
birthYear: z.number().int().min(1900, ...).max(currentYear, ...) // min 1930 → 1900
phone: z.string().regex(/^\d{10,15}$/, 'Số điện thoại gồm 10–15 chữ số').optional()
```

---

### Bước 2 — Thiết kế lại DB schema

**File:** `db/schema.ts`

Thêm bảng `members`. Sửa `matches` (bỏ `created_by`). Sửa `match_players` (`user_id` → `member_id`, thêm UNIQUE). Sửa `match_results` (đổi tên cột `score_a/score_b`, bỏ `winner_team`, thêm UNIQUE constraint + CASCADE).

Giữ nguyên bảng `users` — không xoá.

Sau đó chạy:

```bash
npm run db:generate
npm run db:migrate
```

---

### Bước 3 — Viết lại service layer

**File:** `server/services/member.service.ts`

```ts
// Import members thay vì users
import { members } from '@db/schema';

getMembersWithStats(): Promise<Member[]>
  // LEFT JOIN match_players + match_results, GROUP BY members.id
  // tính winRate = wins / (wins + losses) * 100

createMember(data: { name: string; birthYear?: number; phone?: string }): Promise<Member>

updateMember(id: string, data: { name: string; birthYear?: number; phone?: string }): Promise<Member>

deleteMember(id: string): Promise<void>
```

---

### Bước 4 — Tạo Route Handlers

**`src/app/api/members/route.ts`**

- `GET` → gọi `getMembersWithStats()`, trả về `Member[]` (đã có wins/losses/winRate thực)
- `POST` → `memberSchema.parse(body)`, gọi `createMember()`, trả về `201` + member mới

**`src/app/api/members/[id]/route.ts`**

- `PATCH` → `memberSchema.parse(body)`, gọi `updateMember()`, trả về member đã cập nhật
- `DELETE` → gọi `deleteMember()`, trả về `204 No Content`

Lỗi Zod → `400` + `{ errors: error.flatten().fieldErrors }`.
Không tìm thấy member → `404`.

---

### Bước 5 — Cập nhật `add-member-modal.tsx`

- Xoá `interface MemberData` thủ công, import `MemberData` từ `@/lib/validations`
- Thay `alert()` bằng inline error messages dưới từng field
- Dùng `memberSchema.safeParse()` trong `handleSubmit`

---

### Bước 6 — Cập nhật `members/page.tsx`

- Xoá toàn bộ `initialMembers` và `initialMatches` hardcoded
- Thêm state: `loading: boolean`, `error: string | null`
- `useEffect` → fetch `GET /api/members` khi mount
- `handleAddMember` → `POST /api/members`, refresh list
- `handleUpdateMember` → `PATCH /api/members/{id}`
- `handleDeleteMember` → `DELETE /api/members/{id}`
- Dùng `toast` từ `sonner` cho success/error feedback
- Loading: skeleton cards thay cho grid
- Error: message + nút retry

---

### Bước 7 — Cập nhật `member-detail-modal.tsx`

- `handleSave` → gọi `PATCH /api/members/{id}`, sau đó gọi `onUpdate` để sync state parent
- `handleDelete` → gọi `DELETE /api/members/{id}`, sau đó gọi `onDelete`
- Bỏ `window.confirm`, dùng loading state trên nút thay thế
- Thêm loading state trên nút "Lưu" và "Xoá"

---

## Thứ tự thực hiện

```
1 (Zod) → 2 (DB schema + migrate) → 3 (service) → 4 (API routes) → 5 (modal) → 6 (page) → 7 (detail modal)
```

Bước 1–4 là backend-only. Bước 5–7 kết nối UI.

---

## Constraints

- Không thay đổi layout/design UI
- Chỉ dùng shadcn components đã có
- Không thêm abstraction layer (custom hooks, repositories)
- Bảng `users` giữ nguyên, không xoá

---

## Files bị ảnh hưởng

| File                                     | Loại thay đổi                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/validations/member.ts`          | Sửa: phone optional, birthYear min=1900                                |
| `db/schema.ts`                           | Sửa: bảng `members` mới, sửa `matches`/`match_players`/`match_results` |
| `db/migrations/`                         | Tạo mới (auto-generated)                                               |
| `server/services/member.service.ts`      | Viết lại: dùng `members`, thêm JOIN stats query                        |
| `src/app/api/members/route.ts`           | Tạo mới                                                                |
| `src/app/api/members/[id]/route.ts`      | Tạo mới                                                                |
| `src/components/add-member-modal.tsx`    | Sửa: Zod validation, inline errors                                     |
| `src/components/member-detail-modal.tsx` | Sửa: gọi API trong edit/delete                                         |
| `src/app/members/page.tsx`               | Sửa: xoá hardcode, kết nối API                                         |
