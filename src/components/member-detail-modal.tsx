'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { memberSchema, type MemberData, type MemberFormValues } from '@/lib/validations';
import type { Member } from '@server/services/member.service';

interface MemberDetailModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onUpdate: (updated: Member) => void;
  onDelete: (memberId: string) => void;
}

export function MemberDetailModal({
  isOpen,
  member,
  onClose,
  onUpdate,
  onDelete,
}: MemberDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<MemberFormValues, unknown, MemberData>({
    resolver: zodResolver(memberSchema),
  });

  const handleEdit = () => {
    if (!member) return;
    form.reset({
      name: member.name,
      birthYear: member.birthYear ?? undefined,
      phone: member.phone ?? '',
    });
    setIsEditing(true);
  };

  const handleSave = form.handleSubmit(async (data) => {
    if (!member) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated: Member = await res.json();
      onUpdate(updated);
      setIsEditing(false);
      toast.success('Đã cập nhật thông tin');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!member) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      onDelete(member.id);
      onClose();
      toast.success('Đã xoá thành viên');
    } catch {
      toast.error('Xoá thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thông Tin Thành Viên</DialogTitle>
          <DialogDescription>Xem và chỉnh sửa thông tin cầu thủ</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-16 w-16 mb-3">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {isEditing ? (
              <div className="w-full space-y-2">
                <div>
                  <Input
                    {...form.register('name')}
                    placeholder="Tên cầu thủ"
                    className="bg-white dark:bg-slate-900 text-center"
                  />
                  {form.formState.errors.name && (
                    <p className="text-destructive text-xs mt-1 text-center">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    {...form.register('birthYear', { valueAsNumber: true })}
                    placeholder="Năm sinh"
                    className="bg-white dark:bg-slate-900 text-center"
                  />
                  {form.formState.errors.birthYear && (
                    <p className="text-destructive text-xs mt-1 text-center">
                      {form.formState.errors.birthYear.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...form.register('phone')}
                    placeholder="Số điện thoại (tuỳ chọn)"
                    className="bg-white dark:bg-slate-900 text-center"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-destructive text-xs mt-1 text-center">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="text-lg font-bold text-foreground">{member.name}</p>
                {member.birthYear && (
                  <p className="text-sm text-muted-foreground">Sinh năm {member.birthYear}</p>
                )}
                {member.phone && (
                  <p className="text-sm text-muted-foreground mt-1">{member.phone}</p>
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Thống Kê Toàn Bộ</p>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Tỷ Lệ Thắng</p>
                  <p className="text-sm font-bold text-primary">{member.winRate.toFixed(1)}%</p>
                </div>
                <Progress value={member.winRate} className="h-2 mb-3" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <p className="text-sm font-bold text-green-600">{member.wins}</p>
                  <p className="text-xs text-muted-foreground">Thắng</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <p className="text-sm font-bold text-red-600">{member.losses}</p>
                  <p className="text-xs text-muted-foreground">Thua</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <p className="text-sm font-bold text-primary">{member.wins + member.losses}</p>
                  <p className="text-xs text-muted-foreground">Tổng</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4 flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEdit} className="flex-1 bg-accent hover:bg-accent/90">
                  Sửa
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xoá...' : 'Xoá'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
