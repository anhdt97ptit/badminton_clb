# Implementation Plan Update: Member Page

## Mục tiêu

Áp dụng các yêu cầu bổ sung từ `requirement_update.md` lên codebase hiện tại:

1. Dùng **react-hook-form** + **zodResolver** để quản lý form state và validation (thay thế manual `useState` + `safeParse` inline trong form).
2. Tạo **custom hook `useMembers`** để tách biệt business logic (fetch, create, update, delete) khỏi `page.tsx`.
3. Dùng **Sonner toast** nhất quán cho mọi feedback success/error (đã có một phần, cần hoàn thiện).

---

## Phân tích hiện trạng (gap analysis)

### Đã hoàn thành (không cần làm lại)

| Hạng mục                                                                              | File                                     | Trạng thái                      |
| ------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------- |
| API GET/POST `/api/members`                                                           | `src/app/api/members/route.ts`           | ✅ Done                         |
| API PATCH/DELETE `/api/members/[id]`                                                  | `src/app/api/members/[id]/route.ts`      | ✅ Done                         |
| Service layer (`getMembersWithStats`, `createMember`, `updateMember`, `deleteMember`) | `server/services/member.service.ts`      | ✅ Done                         |
| Zod schema `memberSchema`                                                             | `src/lib/validations/member.ts`          | ✅ Done                         |
| API fetch + CRUD trong `page.tsx`                                                     | `src/app/members/page.tsx`               | ✅ Done (sẽ refactor sang hook) |
| Toast success/error trong `page.tsx` và `member-detail-modal.tsx`                     | —                                        | ✅ Done                         |
| Loading state (skeleton), error state, empty state                                    | `src/app/members/page.tsx`               | ✅ Done                         |
| Edit/delete với API call trong `member-detail-modal.tsx`                              | `src/components/member-detail-modal.tsx` | ✅ Done                         |

### Chưa làm — cần thực hiện trong plan này

| Hạng mục                                                                 | Lý do                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `<Toaster />` chưa có trong root layout                                  | `layout.tsx` không mount Toaster → toast không hiển thị |
| `add-member-modal.tsx` dùng manual `useState` per field + `safeParse`    | Cần chuyển sang `useForm` + `zodResolver`               |
| `member-detail-modal.tsx` edit form dùng manual `useState` + `safeParse` | Cần chuyển sang `useForm` + `zodResolver`               |
| Không có `useMembers` hook                                               | Fetch/CRUD logic đang inline trong `page.tsx`           |

---

## Các bước thực hiện

### Bước 1 — Thêm `<Toaster />` vào root layout

**File:** `src/app/layout.tsx`

```tsx
import { Toaster } from 'sonner';

// trong <body>:
<body className="font-sans antialiased">
  {children}
  <Toaster richColors position="top-right" />
</body>;
```

Không cần `ThemeProvider` wrapper vì Sonner tự detect dark/light qua CSS.

---

### Bước 2 — Tạo `useMembers` hook

**File:** `src/hooks/use-members.ts`

Extract toàn bộ fetch/CRUD logic từ `members/page.tsx` ra hook riêng. Hook trả về:

```ts
interface UseMembersReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  addMember: (data: MemberData) => Promise<void>;
  updateMember: (updated: Member) => void; // optimistic update từ API response
  deleteMember: (memberId: string) => void; // cập nhật local state
}
```

Quy tắc:

- `fetchMembers` gọi `GET /api/members`, set `loading`/`error`/`members`
- `addMember` gọi `POST /api/members`, append member mới vào state, `toast.success/error`
- `updateMember` và `deleteMember` chỉ cập nhật local state (API call đã thực hiện trong các modal) và sync `selectedMember`
- Không truyền toast vào hook — hook tự gọi `toast` trực tiếp

---

### Bước 3 — Refactor `add-member-modal.tsx` dùng React Hook Form

**File:** `src/components/add-member-modal.tsx`

**Trước:** 3 `useState` riêng (`name`, `birthYear`, `phone`) + 1 `errors` state + `safeParse` trong `handleSubmit`.

**Sau:** 1 `useForm` với `zodResolver`.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema, type MemberData } from '@/lib/validations';

const form = useForm<MemberData>({
  resolver: zodResolver(memberSchema),
  defaultValues: { name: '', phone: '' },
});

const onSubmit = form.handleSubmit((data) => {
  onSubmit(data);
  form.reset();
  onClose();
});
```

- Dùng `form.register(...)` cho các Input field
- Lỗi lấy từ `form.formState.errors.fieldName?.message`
- `handleClose` gọi `form.reset()` để clear form khi đóng modal
- Xoá toàn bộ `useState` cũ và logic `safeParse` thủ công

**Lưu ý `birthYear`:** Là `number` trong schema nhưng `<Input type="number">` bind string. Dùng `valueAsNumber` option của `register`:

```tsx
<Input type="number" {...form.register('birthYear', { valueAsNumber: true })} />
```

---

### Bước 4 — Refactor edit form trong `member-detail-modal.tsx` dùng React Hook Form

**File:** `src/components/member-detail-modal.tsx`

**Trước:** 3 `useState` riêng (`editName`, `editPhone`, `editBirthYear`) + `errors` state + `safeParse` trong `handleSave`.

**Sau:** 1 `useForm` với `zodResolver`, reset khi mở edit mode.

```tsx
const form = useForm<MemberData>({
  resolver: zodResolver(memberSchema),
});

const handleEdit = () => {
  if (!member) return;
  form.reset({
    name: member.name,
    birthYear: member.birthYear ?? undefined,
    phone: member.phone ?? '',
  });
  setIsEditing(true);
};

const handleSave = form.handleSubmit(async (data) => {
  if (!member) return;
  setIsSaving(true);
  try {
    const res = await fetch(`/api/members/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    const updated: Member = await res.json();
    onUpdate(updated);
    setIsEditing(false);
    toast.success('Đã cập nhật thông tin');
  } catch {
    toast.error('Cập nhật thất bại');
  } finally {
    setIsSaving(false);
  }
});
```

- Xoá `editName`, `editBirthYear`, `editPhone`, `errors` states
- Dùng `form.register(...)` và `form.formState.errors` trong JSX edit mode
- `isSaving` và `isDeleting` giữ nguyên (không phải form state)
- `birthYear`: dùng `{ valueAsNumber: true }` như bước 3

---

### Bước 5 — Cập nhật `members/page.tsx` dùng `useMembers`

**File:** `src/app/members/page.tsx`

```tsx
import { useMembers } from '@/hooks/use-members';

const { members, loading, error, fetchMembers, addMember, updateMember, deleteMember } =
  useMembers();
```

- Xoá `useState` cho `members`, `loading`, `error`
- Xoá `fetchMembers` callback và `useEffect` (đã trong hook)
- Xoá `handleAddMember` (thay bằng `addMember` từ hook)
- `handleUpdateMember` → gọi `updateMember(updated)` + `setSelectedMember(updated)`
- `handleDeleteMember` → gọi `deleteMember(memberId)` + `setIsDetailModalOpen(false)`
- Giữ nguyên toàn bộ UI, phần search/pagination/modal state vẫn trong page

---

## Thứ tự thực hiện

```
1 (Toaster layout) → 2 (useMembers hook) → 3 (add-member-modal) → 4 (member-detail-modal) → 5 (page refactor)
```

Bước 1 là độc lập. Bước 2 trước bước 5 vì page phụ thuộc hook.

---

## Files bị ảnh hưởng

| File                                     | Loại thay đổi                                                       |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `src/app/layout.tsx`                     | Thêm `<Toaster />`                                                  |
| `src/hooks/use-members.ts`               | **Tạo mới** — extract fetch/CRUD logic                              |
| `src/components/add-member-modal.tsx`    | Refactor: `useForm` + `zodResolver`, xoá manual state               |
| `src/components/member-detail-modal.tsx` | Refactor: `useForm` + `zodResolver` cho edit form, xoá manual state |
| `src/app/members/page.tsx`               | Refactor: dùng `useMembers` hook, xoá inline fetch/CRUD             |

---

## Constraints

- Không thay đổi layout/design UI
- Không thay đổi API routes hay service layer
- Không thêm abstraction ngoài `useMembers` hook đã yêu cầu
