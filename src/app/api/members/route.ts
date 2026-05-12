import { NextRequest, NextResponse } from 'next/server';
import { getMembersWithStats, createMember } from '@server/services/member.service';
import { memberSchema } from '@/lib/validations';

export async function GET() {
  try {
    const data = await getMembersWithStats();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = memberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const member = await createMember(result.data);
    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
