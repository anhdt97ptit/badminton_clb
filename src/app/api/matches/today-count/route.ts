import { NextResponse } from 'next/server';
import { getMatchesTodayCount } from '@server/services/match.service';

export async function GET() {
  try {
    const count = await getMatchesTodayCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
