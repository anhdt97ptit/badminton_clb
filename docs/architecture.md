# Architecture

## Overview

Web app quản lý câu lạc bộ cầu lông: theo dõi thành viên, kết quả trận đấu, và bảng xếp hạng tỷ lệ thắng. Giao diện tiếng Việt, responsive mobile-first.

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16.2 (App Router)                 |
| UI         | React 19, Tailwind CSS v4, shadcn/ui      |
| Database   | PostgreSQL 15 (Docker)                    |
| ORM        | Drizzle ORM (`drizzle-orm/node-postgres`) |
| Validation | Zod v4                                    |
| Forms      | React Hook Form + `@hookform/resolvers`   |
| Toasts     | Sonner                                    |
| Language   | TypeScript 5                              |
| Theme      | `next-themes` (dark/light)                |
| Icons      | `lucide-react`                            |

## Directory Structure

```
badminton_clb/
├── db/
│   ├── schema.ts          # Drizzle table definitions (nguồn sự thật duy nhất)
│   ├── index.ts           # Singleton db client + pg Pool
│   └── migrations/        # Generated SQL migrations (drizzle-kit)
├── server/
│   └── services/
│       └── member.service.ts  # Server-only DB access functions
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout (font, metadata)
│   │   ├── page.tsx       # Trang chủ: dashboard + top winners
│   │   ├── history/
│   │   │   └── page.tsx   # Lịch sử tất cả trận đấu
│   │   └── members/
│   │       └── page.tsx   # Danh sách + quản lý thành viên
│   ├── components/
│   │   ├── ui/            # shadcn primitives (button, card, dialog, ...)
│   │   ├── top-winners.tsx
│   │   ├── match-history.tsx
│   │   ├── member-card.tsx
│   │   ├── member-detail-modal.tsx
│   │   ├── add-match-modal.tsx
│   │   ├── add-member-modal.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   └── use-mobile.ts  # Responsive breakpoint hook
│   └── lib/
│       ├── utils.ts       # cn() helper (clsx + tailwind-merge)
│       └── validations/
│           ├── index.ts   # Re-exports tất cả schemas
│           ├── member.ts  # memberSchema + MemberData type
│           └── match.ts   # matchSchema + MatchData type
├── docker-compose.yml     # PostgreSQL container
└── drizzle.config.ts      # Drizzle Kit config
```

## Database Schema

```
users
├── id          uuid PK (defaultRandom)
├── name        text NOT NULL
└── created_at  timestamp NOT NULL (defaultNow)

matches
├── id          uuid PK
├── played_at   timestamp (nullable)
└── created_by  uuid (FK → users.id, không có constraint)

match_players
├── id          uuid PK
├── match_id    uuid FK → matches.id
├── user_id     uuid FK → users.id
└── team        teamEnum NOT NULL  ('A' | 'B')

match_results
├── id           uuid PK
├── match_id     uuid FK → matches.id
├── team_a_score integer (nullable)
├── team_b_score integer (nullable)
└── winner_team  teamEnum NOT NULL
```

**Mối quan hệ:** Một `match` có nhiều `match_players` (tối đa 4 người, chia team A/B) và một `match_result` duy nhất ghi tỷ số.

## Pages & Routing

| Route      | File                       | Chức năng                                                           |
| ---------- | -------------------------- | ------------------------------------------------------------------- |
| `/`        | `src/app/page.tsx`         | Dashboard: stats cards, top 3 winners, lịch sử hôm nay              |
| `/history` | `src/app/history/page.tsx` | Toàn bộ lịch sử trận đấu: filter theo tên/tháng/kết quả, pagination |
| `/members` | `src/app/members/page.tsx` | Danh sách thành viên: sort theo win rate, search, CRUD              |

Tất cả pages đều là `'use client'` do dùng local state. Không có Route Handlers hay Server Actions hiện tại.

## Component Architecture

### Feature Components

```
AddMatchModal
  Props: isOpen, onClose, onSubmit(MatchData), members[]
  State: matchType (1v1|2v2), player1-4, score1-2, date
  Logic: validate form, prevent chọn trùng player giữa các slot

AddMemberModal
  Props: isOpen, onClose, onSubmit(MemberData)
  State: name, birthYear, phone

MemberCard
  Props: member, originalIndex, onClick
  Hiển thị: avatar, win rate progress bar, W/L/Total stats, badge Top 1-3

MemberDetailModal
  Props: isOpen, member, onClose, onUpdate, onDelete, allMatches[]
  State: isEditing (toggle view/edit), selectedMonth
  Logic: tính monthlyStats từ allMatches (lọc theo member.name)
  Features: xem/sửa thông tin, thống kê theo tháng, xoá member

TopWinners
  Props: winners[]
  Hiển thị: top 3 với nền gold/silver/bronze tương ứng
```

### Key Exported Types

```typescript
// add-match-modal.tsx
interface MatchData {
  type: '1v1' | '2v2';
  player1: string;
  player2?: string;
  player3?: string; // chỉ dùng cho 2v2
  player4?: string; // chỉ dùng cho 2v2
  score1: number;
  score2: number;
  date: string;
}

// add-member-modal.tsx
interface MemberData {
  name: string;
  birthYear: number;
  phone: string;
}

// member-card.tsx
interface MemberCardProps {
  member: { id; name; wins; losses; winRate; avatar; birthYear; phone };
  originalIndex: number; // vị trí trong mảng đã sort → dùng để hiển thị badge Top
  onClick: (member) => void;
}
```

## Validation & Form Layer

### Schemas (Zod v4)

| File                            | Schema         | Mô tả                                                                                      |
| ------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `src/lib/validations/member.ts` | `memberSchema` | Tên (1–100 ký tự), năm sinh (1930–nay), SĐT Việt Nam                                       |
| `src/lib/validations/match.ts`  | `matchSchema`  | Loại trận 1v1/2v2, UUID người chơi, điểm số, ngày; refine kiểm tra đủ người và không trùng |

Types được infer từ schema — **không khai báo interface trùng lặp**.

### React Hook Form

Tất cả form client dùng `useForm` từ `react-hook-form` kết hợp `zodResolver`:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema, type MemberData } from '@/lib/validations';

const form = useForm<MemberData>({
  resolver: zodResolver(memberSchema),
  defaultValues: { name: '', birthYear: 2000, phone: '' },
});
```

- `register` / `Controller` để bind field; `formState.errors` để hiển thị lỗi
- Không gọi `safeParse` thủ công trong submit handler — resolver đã xử lý
- Ở server (Route Handler): dùng `schema.parse()` để Next.js bắt và trả 400

### Toasts (Sonner)

```typescript
import { toast } from 'sonner';

toast.success('Thêm thành viên thành công');
toast.error('Đã xảy ra lỗi');
toast.promise(asyncFn(), { loading: '...', success: 'OK', error: 'Lỗi' });
```

`<Toaster />` được mount một lần trong `src/app/layout.tsx`. **Không dùng `alert()`** hoặc inline error state cho thông báo tạm thời.

## Data Flow

### Trạng thái hiện tại (Hardcoded)

```
Page component (useState)
  └── hardcoded initialData (inline arrays trong mỗi page)
       └── Client-side mutations (add / update / delete qua setState)
            └── Props → Feature Components
```

Dữ liệu **không persist** sau khi reload. Mỗi page khai báo bản sao dữ liệu mẫu riêng — có sự trùng lặp giữa các file.

### Kiến trúc mục tiêu (khi kết nối DB)

```
PostgreSQL
  └── db/index.ts (Drizzle Pool)
       └── server/services/*.service.ts
            └── Server Component (async, fetch data)
                 └── Props → 'use client' Components (interactive)
```

`server/services/member.service.ts` đã có `createMember()` và `getMembers()` làm mẫu cho pattern này.

## UI Conventions

- **Theme:** `ThemeProvider` trong `layout.tsx`, toggle dark/light qua `next-themes`
- **Responsive:** Mobile-first; component thường có 2 nhánh JSX (`hidden sm:flex` desktop, `sm:hidden` mobile)
- **Colors:** CSS variables (`text-primary`, `bg-accent`, `border-border/40`) — không hardcode màu hex
- **Pagination:** Client-side — 6 items/page (members), 8 items/page (history)
- **Avatar:** DiceBear (`https://api.dicebear.com/7.x/avataaars/svg?seed={id}`)
- **shadcn:** Thêm component mới bằng `npx shadcn add <component>`

## Infrastructure

```yaml
# docker-compose.yml
postgres:
  image: postgres:15
  port: 5432
  POSTGRES_DB: badminton_clb
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
```

Yêu cầu `.env` tại root:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/badminton_clb
```
