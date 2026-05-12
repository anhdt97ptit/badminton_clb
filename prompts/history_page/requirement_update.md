# Feature: history Page

## Purpose
url: /history
page: src/app/history/page.tsx

Hiện tại xử lý gồm có:
- Tổng số trận đấu
- Hiển thị lịch sử đấu
- Phần tìm kiếm: theo tên đối thủ, theo ngày tháng, theo kết quả thắng thua

## Implementation Notes

Tasks:
1: phần tìm kiếm yêu cầu: 
    - khi filter sẽ call api để lấy dữ liệu đã filter
    - Kết quả sẽ ẩn đi, chỉ khi có filter thành viên thì ms hiển thị 
    - button tìm kiếm cho màu khác đi, thêm icon filter vào button tìm kiếm
