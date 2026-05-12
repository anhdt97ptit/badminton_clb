# Feature: History Page

## Purpose

url: /history

Cho phép user xem toàn bộ lịch sử trận đấu, tìm kiếm, lọc, và paginate.
Cho phép user ghi nhận kết quả trận đấu mới.
Cho phép user xóa một trận đấu nếu cần.

---

# UI

Existing UI already implemented. (`src/app/history/page.tsx`)

Do not redesign UI.

Relevant components:

- `src/app/history/page.tsx` — trang chính, hiện dùng hardcoded data
- `src/components/add-match-modal.tsx` — modal thêm kết quả trận đấu (cần refactor, xem Notes)
- `src/components/match-history.tsx` — widget "Lịch Sử Đấu Hôm Nay" trên trang chủ (dùng chung shape dữ liệu)

---

# User Flow

1. User truy cập `/history`
2. User thấy danh sách tất cả trận đấu, sắp xếp mới nhất trước
3. Mỗi trận hiển thị: Đội A (tên các thành viên) — tỷ số — Đội B, ngày thi đấu; đội thắng highlight màu xanh, đội thua highlight màu đỏ
4. User có thể tìm kiếm trận đấu theo tên thành viên (lọc những trận có thành viên đó tham gia)
5. User có thể lọc theo tháng (`played_at`)
6. User có thể lọc theo kết quả: Tất Cả / Đội A Thắng (`winner_team = 'A'`) / Đội B Thắng (`winner_team = 'B'`)
7. User có thể paginate qua các trang (8 trận/trang)
8. User click "+ Thêm Kết Quả" để mở `AddMatchModal`
9. Trong modal, user:
   - Chọn loại trận: 1v1 hoặc 2v2
   - Chọn ngày thi đấu (mặc định hôm nay)
   - Chọn các thành viên từ danh sách thực (fetch từ `GET /api/members`)
   - Nhập tỷ số Đội A và Đội B (score_a, score_b) — phải khác nhau (không cho phép hòa)
   - Hệ thống tự tính `winner_team` từ điểm số
10. User submit form — validate bằng Zod + react-hook-form
    - Lỗi → hiển thị inline dưới từng field
    - Thành công → đóng modal, prepend trận mới vào đầu danh sách, toast success
11. User có thể xóa một trận đấu bằng nút Xóa trên mỗi row (confirm trước khi xóa)
    - Thành công → xóa khỏi danh sách, toast success
    - Thất bại → toast error

---

# Validation Rules

- `type`: `'1v1'` hoặc `'2v2'`
- `player1`: UUID thành viên, required — Đội A (người 1)
- `player2`: UUID thành viên, required (1v1) hoặc optional nếu Đội A chỉ 1 người (2v2: Đội A người 2)
  - Đối với logic thực tế: xem Notes bên dưới về mapping player→team
- `player3`: UUID thành viên — Đội B người 1, required
- `player4`: UUID thành viên — Đội B người 2, required nếu 2v2
- Không được chọn trùng thành viên trong cùng một trận
- `score_a`: số nguyên ≥ 0
- `score_b`: số nguyên ≥ 0
- `score_a ≠ score_b` (không cho phép hòa)
- `date`: định dạng `YYYY-MM-DD`, không được ở tương lai

---

# Data Model (DB → API Shape)

## API Response `Match` (shape UI dùng)

```ts
interface Match {
  id: string;
  played_at: string; // ISO 8601
  team_a: { id: string; name: string }[]; // 1–2 thành viên
  team_b: { id: string; name: string }[]; // 1–2 thành viên
  score_a: number;
  score_b: number;
  winner_team: 'A' | 'B';
}
```

## Mapping player → team (khi tạo trận)

Từ `MatchData` (form output) sang `match_players` insert:

| Loại | player1 | player2 | player3 | player4 |
| ---- | ------- | ------- | ------- | ------- |
| 1v1  | team A  | team B  | —       | —       |
| 2v2  | team A  | team A  | team B  | team B  |

`winner_team` được tính tự động: `score_a > score_b ? 'A' : 'B'`

---

# Implementation Notes

## Vấn đề cần giải quyết

| Vấn đề                                                                  | Hành động                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------- |
| `history/page.tsx` dùng hardcoded members và matches                    | Fetch từ API                                        |
| `add-match-modal.tsx` dùng `player.name` làm value (string)             | Đổi thành member UUID; `matchSchema` đã expect UUID |
| `add-match-modal.tsx` export `MatchData` riêng (dùng string cho player) | Xóa, dùng `MatchData` từ `@/lib/validations/match`  |
| `add-match-modal.tsx` validate bằng `alert()` thủ công                  | Dùng react-hook-form + zodResolver(matchSchema)     |
| Không có service/route handler cho matches                              | Tạo mới                                             |
| Không có nút xóa trận đấu trên UI                                       | Thêm nút Xóa vào mỗi match row                      |
| `matchSchema` thiếu rule: score_a ≠ score_b                             | Thêm refine                                         |

## Tasks

1. Cập nhật `matchSchema` — thêm refine kiểm tra score_a ≠ score_b và date không tương lai
2. Tạo service layer `server/services/match.service.ts`
3. Tạo Route Handlers `src/app/api/matches/route.ts` (GET, POST) và `src/app/api/matches/[id]/route.ts` (DELETE)
4. Refactor `add-match-modal.tsx` — dùng UUID cho player values, react-hook-form + zodResolver, xóa `MatchData` interface riêng
5. Cập nhật `history/page.tsx` — fetch members + matches từ API, kết nối modal, xử lý loading/error/empty state, thêm nút xóa

## Constraints

- Không thay đổi layout/design UI
- Chỉ dùng shadcn components đã có
- Không thêm abstraction layer (không cần custom hook — logic đủ đơn giản để để trong page)
- `winner_team` tính phía client trước khi POST, DB CHECK constraint sẽ reject nếu sai
