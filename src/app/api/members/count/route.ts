import { NextResponse } from 'next/server';
import { getMembersCount } from '@server/services/member.service';

export async function GET() {
  const count = await getMembersCount();
  return NextResponse.json({ count });
}
