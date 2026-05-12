import { NextRequest, NextResponse } from 'next/server';
import { getMemberById, updateMember, deleteMember } from '@server/services/member.service';
import { memberSchema } from '@/lib/validations';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await getMemberById(id);
    if (!member) return NextResponse.json({ error: 'Không tìm thấy thành viên' }, { status: 404 });
    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = memberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const member = await updateMember(id, result.data);
    if (!member) return NextResponse.json({ error: 'Không tìm thấy thành viên' }, { status: 404 });
    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await getMemberById(id);
    if (!member) return NextResponse.json({ error: 'Không tìm thấy thành viên' }, { status: 404 });
    await deleteMember(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
