import { NextResponse } from 'next/server';
import { getMembersCount } from '@server/services/member.service';

export async function GET() {
  try {
    const count = await getMembersCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
