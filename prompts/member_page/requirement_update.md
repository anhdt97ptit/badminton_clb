# Feature: Member Page

# Implementation Notes

1. Sửa dụng react_hook-form để handle form state và validation trong feature member page
2. Tạo custom hook useMembers để handle business logic liên quan đến member (fetching, creating, updating, deleting)
3. Sử dụng zod để define validation schema cho member form, bao gồm:
   - name: non-empty string
   - birthYear: number between 1900 và current year
   - phoneNumber: optional string of digits, length 10-15
4. Sử dụng soner toast để show success và error messages khi user tạo hoặc cập nhật member
