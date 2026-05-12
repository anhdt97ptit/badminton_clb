# Feature: Member Page

## Purpose

url: /members

Cho phép user xem danh sách member, tìm kiếm, paginate
Cho phép user tạo member mới

---

# UI

Existing UI already implemented. (src/app/members)

Do not redesign UI.

Relevant components:

- Các component

---

# User Flow

1. User truy cập trang /members
2. User thấy danh sách member (tên, năm sinh, số điện thoại ... UI đã có `/src/components/member-card.tsx`))
3. User có thể tìm kiếm member theo tên
4. User có thể paginate qua các trang nếu có nhiều member
5. User có thể click vào nút "Thêm thành viên mới" để mở form tạo `/src/components/add-member-modal.tsx`
6. User điền thông tin member mới (tên, năm sinh, số điện thoại)
7. User submit form, nếu có lỗi validate thì show lỗi, nếu thành công thì đóng modal và refresh danh sách member
8. User có thể click vào một member để xem chi tiết
9. User có thể edit thông tin member hoặc xóa member nếu cần

---

- valid name: non-empty string
- valid birth year: number between 1900 and current year
- valid phone number: string of digits, length 10-15, ko cần required

---

# Implementation Notes

Tasks:
Tasks:

1. Analyze current UI and identify required business flow
2. Create drizzle schema
3. Generate database migration
4. Create zod validation schemas
5. Implement backend API endpoints
6. Implement business/service layer
7. Add API request handlers in Next.js frontend
8. Connect existing UI to backend APIs
9. Handle loading, error, and empty states
10. Add basic validation and success feedback
11. Test full flow end-to-end

Constraints:

- Keep UI unchanged
- Use existing shadcn components
- Avoid over abstraction
