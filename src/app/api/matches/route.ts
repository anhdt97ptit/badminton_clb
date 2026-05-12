import { NextRequest, NextResponse } from 'next/server';
import { getMatches, createMatch } from '@server/services/match.service';
import { matchSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberName = searchParams.get('member') ?? undefined;
    const month = searchParams.get('month') ?? undefined;
    const memberResult = (searchParams.get('result') as 'win' | 'lose') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') ?? '8', 10));

    const result = await getMatches({ memberName, month, memberResult }, { page, limit });
    return NextResponse.json({ ...result, page, totalPages: Math.ceil(result.total / limit) });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = matchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const match = await createMatch(result.data);
    return NextResponse.json(match, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
