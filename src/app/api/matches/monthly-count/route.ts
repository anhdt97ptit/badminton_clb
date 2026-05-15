import { NextResponse } from 'next/server';
import { getMatchesMonthlyCount } from '@server/services/match.service';

export async function GET() {
  try {
    const count = await getMatchesMonthlyCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
