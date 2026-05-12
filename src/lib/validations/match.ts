import { z } from 'zod';

export const matchSchema = z
  .object({
    type: z.enum(['1v1', '2v2']),
    player1: z.string().uuid('ID người chơi không hợp lệ'),
    player2: z.string().uuid('ID người chơi không hợp lệ'),
    player3: z.string().uuid('ID người chơi không hợp lệ').optional(),
    player4: z.string().uuid('ID người chơi không hợp lệ').optional(),
    score1: z.number().int().min(0, 'Điểm không được âm'),
    score2: z.number().int().min(0, 'Điểm không được âm'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
  })
  .refine(
    (data) => {
      if (data.type === '2v2') return !!data.player3 && !!data.player4;
      return true;
    },
    { message: 'Trận 2v2 yêu cầu đủ 4 người chơi', path: ['player3'] },
  )
  .refine(
    (data) => {
      const players = [data.player1, data.player2, data.player3, data.player4].filter(Boolean);
      return new Set(players).size === players.length;
    },
    { message: 'Không được chọn trùng người chơi', path: ['player1'] },
  )
  .refine((data) => data.score1 !== data.score2, {
    message: 'Tỷ số hai đội không được bằng nhau (không cho phép hòa)',
    path: ['score1'],
  })
  .refine(
    (data) => {
      const today = new Date().toISOString().split('T')[0];
      return data.date <= today;
    },
    { message: 'Ngày thi đấu không được ở tương lai', path: ['date'] },
  );

export type MatchData = z.infer<typeof matchSchema>;
