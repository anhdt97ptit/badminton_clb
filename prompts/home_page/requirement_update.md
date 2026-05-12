# Feature: Home Page

## Purpose
url: /
page: src/app/page.tsx

Hiện tại xử lý gồm có:
- Hiển thị số liệu thống kê nhanh (tổng thành viên, tổng trận đấu, trận hôm nay, win rate cao nhất)
- Hiển thị top 3 cầu thủ xuất sắc nhất
- Hiển thị lịch sử trận đấu hôm nay
- Thao tác nhanh (nút điều hướng tới /history và /members)


## Implementation Notes

Tasks:
1: Hiển thị số liệu thống kê nhanh: 
    - Tổng thành viên: tạo api riêng `GET /api/members/count` để trả về số lượng member, tránh phải fetch toàn bộ data member
    - Tổng trận đấu: sửa thành Tổng Trận Đấu/Tháng. tạo api riêng `GET /api/matches/monthly-count` để trả
    - Trận Hôm Nay: tạo api riêng `GET /api/matches/today-count` để trả về số lượng trận đấu hôm nay
2: Hiển thị top 3 cầu thủ xuất sắc nhất:
    - Không sử dụng api '/api/members'. mà viết riêng api top 3 cầu thủ xuất sắc nhất để tối ưu hiệu suất
2: Lịch Sử Đấu Hôm Nay:
    - Tạo api riêng `GET /api/matches/today` để trả về danh sách trận đấu hôm nay

