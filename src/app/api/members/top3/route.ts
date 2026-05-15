import { NextResponse } from 'next/server';
import { getTopMembers } from '@server/services/member.service';

export async function GET() {
  try {
    const top3 = await getTopMembers(3);
    return NextResponse.json(top3);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
