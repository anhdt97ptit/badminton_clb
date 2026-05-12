import { NextResponse } from 'next/server';
import { getTopMembers } from '@server/services/member.service';

export async function GET() {
  const top3 = await getTopMembers(3);
  return NextResponse.json(top3);
}
