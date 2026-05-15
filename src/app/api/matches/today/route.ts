import { NextResponse } from 'next/server';
import { getMatchesToday } from '@server/services/match.service';

export async function GET() {
  try {
    const matches = await getMatchesToday();
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
