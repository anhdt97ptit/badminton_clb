import { z } from 'zod';

const CURRENT_YEAR = new Date().getFullYear();

export const memberSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên tối đa 100 ký tự').trim(),
  birthYear: z
    .number()
    .int('Năm sinh phải là số nguyên')
    .min(1900, 'Năm sinh không hợp lệ')
    .max(CURRENT_YEAR, `Năm sinh không được lớn hơn ${CURRENT_YEAR}`),
  phone: z
    .union([z.literal(''), z.string().regex(/^\d{10,15}$/, 'Số điện thoại gồm 10–15 chữ số')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type MemberData = z.output<typeof memberSchema>;
export type MemberFormValues = z.input<typeof memberSchema>;
