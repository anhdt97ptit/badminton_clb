import { NextResponse } from 'next/server';
import { getMatchesToday } from '@server/services/match.service';

export async function GET() {
  const matches = await getMatchesToday();
  return NextResponse.json(matches);
}
