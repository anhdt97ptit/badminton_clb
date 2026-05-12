'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { memberSchema, type MemberData, type MemberFormValues } from '@/lib/validations';

export type { MemberData };

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberData) => void;
}

export function AddMemberModal({ isOpen, onClose, onSubmit }: AddMemberModalProps) {
  const form = useForm<MemberFormValues, unknown, MemberData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', phone: '' },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    form.reset();
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm Thành Viên Mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tên</label>
            <Input {...form.register('name')} placeholder="Nhập tên thành viên" />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Năm Sinh</label>
            <Input
              type="number"
              {...form.register('birthYear', { valueAsNumber: true })}
              placeholder="Ví dụ: 1995"
              min="1900"
              max={new Date().getFullYear()}
            />
            {form.formState.errors.birthYear && (
              <p className="text-destructive text-xs mt-1">
                {form.formState.errors.birthYear.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Số Điện Thoại <span className="text-muted-foreground">(tuỳ chọn)</span>
            </label>
            <Input {...form.register('phone')} placeholder="Nhập số điện thoại" type="tel" />
            {form.formState.errors.phone && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            Thêm Thành Viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
