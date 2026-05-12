import { NextResponse } from 'next/server';
import { getMatchesMonthlyCount } from '@server/services/match.service';

export async function GET() {
  const count = await getMatchesMonthlyCount();
  return NextResponse.json({ count });
}
