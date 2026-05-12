import { NextResponse } from 'next/server';
import { getMatchesTodayCount } from '@server/services/match.service';

export async function GET() {
  const count = await getMatchesTodayCount();
  return NextResponse.json({ count });
}
