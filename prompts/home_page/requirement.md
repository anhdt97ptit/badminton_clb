# Feature: Home Page

## Purpose

url: /

Trang tổng quan của câu lạc bộ cầu lông. Hiển thị các số liệu thống kê nhanh, top 3 cầu thủ xuất sắc nhất, lịch sử trận đấu hôm nay, và các thao tác nhanh.

---

# UI

Existing UI already implemented. (`src/app/page.tsx`)

Do not redesign UI.

Relevant components:

- `src/components/top-winners.tsx` — hiển thị top 3 cầu thủ (rank badge, avatar, tên, W/L, win rate)
- `src/components/match-history.tsx` — hiển thị danh sách match rows (desktop + mobile layout, win/loss color coding)
- `src/components/add-match-modal.tsx` — modal thêm kết quả trận đấu mới

---

# User Flow

1. User truy cập trang `/`
2. User thấy 4 stat cards (ẩn trên mobile, hiện từ md trở lên):
   - **Tổng Thành Viên**: tổng số member trong DB
   - **Tổng Trận Đấu**: tổng số match trong DB
   - **Trận Hôm Nay**: số match có `played_at` là ngày hôm nay
   - **Win Rate Cao Nhất**: win rate của cầu thủ dẫn đầu (tính từ dữ liệu thực)
3. User thấy **Top 3 Cầu Thủ Xuất Sắc** (cột trái 2/3 desktop): xếp hạng theo win rate giảm dần, hiển thị tên, số trận thắng/thua, win rate
4. User thấy **Thao Tác Nhanh** (cột phải 1/3 desktop): 2 nút điều hướng tới `/history` và `/members`
5. User thấy **Gợi Ý** (dưới Thao Tác Nhanh): hiển thị tên cầu thủ dẫn đầu và win rate của họ (dynamic từ real data)
6. User thấy **Lịch Sử Đấu Hôm Nay**: tối đa 4 trận gần nhất trong ngày hôm nay, kèm tên đội/cầu thủ, tỷ số, giờ thi đấu; winner side màu xanh lá, loser side màu đỏ
7. User click **"+ Thêm Kết Quả"** (nút ở header của section lịch sử): mở `AddMatchModal`
8. User submit form hợp lệ → match mới được lưu vào DB, danh sách today's matches và stat cards được cập nhật, toast success
9. User thấy layout responsive: mobile hiển thị match dạng 2 cột (mỗi cột 1 đội), desktop dạng hàng ngang

---

# Data Requirements

## Từ API

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Tổng thành viên | `GET /api/members` | `length` của mảng trả về |
| Top 3 cầu thủ | Tính từ `GET /api/members` | Sort theo `winRate` giảm dần, lấy 3 đầu |
| Win rate cao nhất | Tính từ `GET /api/members` | `members[0].winRate` sau khi sort |
| Tổng trận đấu | `GET /api/matches` | `length` của mảng trả về |
| Trận hôm nay | Lọc từ `GET /api/matches` | `played_at` starts with today's date (`YYYY-MM-DD`) |
| Danh sách trận hôm nay | Lọc từ `GET /api/matches` | Tối đa 4 trận, lấy từ đầu mảng |
| Danh sách member cho modal | `GET /api/members` | Dùng cho `AddMatchModal` props |

## Member object (từ `/api/members`)

```ts
{
  id: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;   // wins / (wins + losses) * 100, hoặc 0 nếu chưa đấu
  avatar: string;    // URL dicebear
}
```

## Match object (từ `/api/matches`)

```ts
{
  id: string;
  played_at: string;         // ISO date string, e.g. "2025-05-12T..."
  team_a: { id: string; name: string }[];
  team_b: { id: string; name: string }[];
  score_a: number;
  score_b: number;
  winner_team: 'A' | 'B';
}
```

### Mapping match → today's match display

- Tên đội A: `team_a.map(p => p.name).join(' & ')`
- Tên đội B: `team_b.map(p => p.name).join(' & ')`
- Winner side (màu xanh lá): `winner_team === 'A'` → team A side xanh, team B side đỏ
- Giờ thi đấu: `new Date(played_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })`

---

# Shared Components

## `MatchHistory` (`src/components/match-history.tsx`)

Component này đã tồn tại nhưng dùng interface cũ (shape `player1/player2` string, `result: 'win'|'loss'`). Cần cập nhật để nhận đúng shape từ API, sau đó dùng lại ở cả home page lẫn history page — tránh duplicate JSX render match row.

### Interface mới

```ts
interface Match {
  id: string;
  played_at: string;
  team_a: { id: string; name: string }[];
  team_b: { id: string; name: string }[];
  score_a: number;
  score_b: number;
  winner_team: 'A' | 'B';
}

interface MatchHistoryProps {
  matches: Match[];          // danh sách match cần hiển thị
  onAddMatch?: () => void;   // nếu có → hiển thị nút "+ Thêm Kết Quả" ở header card
  onDelete?: (id: string) => void; // nếu có → hiển thị nút xóa trên mỗi row (dùng cho history page)
  title?: string;            // tiêu đề card, default "Lịch Sử Đấu Hôm Nay"
  maxItems?: number;         // giới hạn số row, default không giới hạn
}
```

### Nơi sử dụng

| Trang | Props truyền vào | Ghi chú |
|---|---|---|
| `src/app/page.tsx` | `matches={todayMatches}` `onAddMatch={...}` `maxItems={4}` | Không có `onDelete` |
| `src/app/history/page.tsx` | `matches={paginatedMatches}` `onDelete={handleDeleteMatch}` `title="Lịch Sử Đấu"` | Không có `onAddMatch` |

### Render logic (giữ nguyên visual, chỉ đổi data shape)

- Tên đội A: `team_a.map(p => p.name).join(' & ')`
- Tên đội B: `team_b.map(p => p.name).join(' & ')`
- Winner (xanh lá) / loser (đỏ): dựa vào `winner_team`
- Giờ: `new Date(played_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })`
- Desktop: hàng ngang (team A | score | team B | [delete button nếu có])
- Mobile: 2 cột (team A trái, team B phải), delete button ở footer row

---

# Implementation Notes

Tasks:

1. **Cập nhật `MatchHistory` component**: đổi interface sang API shape, thêm props `onAddMatch`, `onDelete`, `title`, `maxItems`; xóa JSX cũ dùng `player1/player2`
2. **Cập nhật `history/page.tsx`**: thay inline match row JSX bằng `<MatchHistory>` với `onDelete` và `title`
3. Thêm `winRate` vào member service: tính `wins / (wins + losses) * 100`, làm tròn 1 chữ số thập phân
4. Fetch song song `GET /api/members` và `GET /api/matches` trong `useEffect` khi trang mount
5. Tính toán client-side: `topWinners` (sort by winRate, take 3), `todayMatches` (filter by today), `allMatches.length`, `allMembers.length`
6. Kết nối `TopWinners` component với dữ liệu thực (thay hardcoded `topWinners`)
7. Kết nối stat cards với dữ liệu thực
8. Kết nối "Gợi Ý" card với tên và win rate của `topWinners[0]`
9. Dùng `<MatchHistory matches={todayMatches} onAddMatch={...} maxItems={4}>` trong `page.tsx` thay inline JSX
10. Xử lý `handleAddMatch`: POST lên `/api/matches`, sau khi thành công prepend match mới vào state, toast success
11. Xử lý loading state và empty state (không có trận hôm nay)
12. Pass `members` thực vào `AddMatchModal`

Constraints:

- Giữ nguyên UI, không thiết kế lại
- Dùng các shadcn components hiện có
- Tránh over-abstraction
- Dữ liệu `winRate` tính từ số trận thắng/thua thực trong DB (không hardcode)
- Không tạo thêm component mới nếu component hiện có (`MatchHistory`, `TopWinners`) đã đủ dùng sau khi cập nhật interface
