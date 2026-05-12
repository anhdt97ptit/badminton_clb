'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SingleSelectCombobox } from '@/components/ui/shared/single-select-combobox';
import { matchSchema, type MatchData } from '@/lib/validations';

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MatchData) => void;
  members: Array<{ id: string; name: string }>;
}


export function AddMatchModal({ isOpen, onClose, onSubmit, members }: AddMatchModalProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MatchData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      type: '2v2',
      player1: '',
      player2: '',
      score1: 0,
      score2: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const matchType = watch('type');
  const player1 = watch('player1');
  const player2 = watch('player2');
  const player3 = watch('player3');

  useEffect(() => {
    if (!isOpen)
      reset({
        type: '2v2',
        player1: '',
        player2: '',
        score1: 0,
        score2: 0,
        date: new Date().toISOString().split('T')[0],
      });
  }, [isOpen, reset]);

  const memberOptions = members.map((m) => ({ label: m.name, value: m.id }));
  const availableFor = (excludeIds: (string | undefined)[]) =>
    memberOptions.filter((o) => !excludeIds.filter(Boolean).includes(o.value));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm Kết Quả Trận Đấu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Match Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Loại Trận</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-10 bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Chọn loại trận" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1v1">1 vs 1</SelectItem>
                    <SelectItem value="2v2">2 vs 2</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ngày</label>
            <Input type="date" {...register('date')} className="bg-white dark:bg-slate-900" />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {/* Team 1 - Left Side */}
            <div className="border-r pr-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 bg-blue-100/30 dark:bg-blue-900/20 rounded px-3 py-2">
                Đội 1
              </h3>
              {matchType === '1v1' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cầu Thủ</label>
                    <Controller
                      name="player1"
                      control={control}
                      render={({ field }) => (
                        <SingleSelectCombobox
                          options={memberOptions}
                          selectedValue={field.value}
                          onChange={field.onChange}
                          emptySelectionPlaceholder="Chọn cầu thủ"
                          inputPlaceholder="Tìm cầu thủ..."
                        />
                      )}
                    />
                    {errors.player1 && (
                      <p className="text-xs text-red-500 mt-1">{errors.player1.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tỷ Số</label>
                    <Input
                      type="number"
                      min="0"
                      {...register('score1', { valueAsNumber: true })}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.score1 && (
                      <p className="text-xs text-red-500 mt-1">{errors.score1.message}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cầu Thủ 1</label>
                    <Controller
                      name="player1"
                      control={control}
                      render={({ field }) => (
                        <SingleSelectCombobox
                          options={memberOptions}
                          selectedValue={field.value}
                          onChange={field.onChange}
                          emptySelectionPlaceholder="Chọn cầu thủ"
                          inputPlaceholder="Tìm cầu thủ..."
                        />
                      )}
                    />
                    {errors.player1 && (
                      <p className="text-xs text-red-500 mt-1">{errors.player1.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cầu Thủ 2</label>
                    <Controller
                      name="player2"
                      control={control}
                      render={({ field }) => (
                        <SingleSelectCombobox
                          options={availableFor([player1])}
                          selectedValue={field.value}
                          onChange={field.onChange}
                          emptySelectionPlaceholder="Chọn cầu thủ"
                          inputPlaceholder="Tìm cầu thủ..."
                        />
                      )}
                    />
                    {errors.player2 && (
                      <p className="text-xs text-red-500 mt-1">{errors.player2.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tỷ Số</label>
                    <Input
                      type="number"
                      min="0"
                      {...register('score1', { valueAsNumber: true })}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.score1 && (
                      <p className="text-xs text-red-500 mt-1">{errors.score1.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Team 2 - Right Side */}
            <div className="border-l pl-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 bg-red-100/30 dark:bg-red-900/20 rounded px-3 py-2">
                Đội 2
              </h3>
              {matchType === '1v1' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cầu Thủ</label>
                    <Controller
                      name="player2"
                      control={control}
                      render={({ field }) => (
                        <SingleSelectCombobox
                          options={availableFor([player1])}
                          selectedValue={field.value}
                          onChange={field.onChange}
                          emptySelectionPlaceholder="Chọn cầu thủ"
                          inputPlaceholder="Tìm cầu thủ..."
                        />
                      )}
                    />
                    {errors.player2 && (
                      <p className="text-xs text-red-500 mt-1">{errors.player2.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tỷ Số</label>
                    <Input
                      type="number"
                      min="0"
                      {...register('score2', { valueAsNumber: true })}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.score2 && (
                      <p className="text-xs text-red-500 mt-1">{errors.score2.message}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cầu Thủ 1</label>
                    <Controller
                      name="player3"
                      control={control}
                      shouldUnregister
                      render={({ field }) => (
                        <SingleSelectCombobox
                          options={availableFor([player1, player2])}
                          selectedValue={field.value ?? ''}
                          onChange={field.onChange}
                          emptySelectionPlaceholder="Chọn cầu thủ"
                          inputPlaceholder="Tìm cầu thủ..."
                        />
                      )}
                    />
                    {errors.player3 && (
                      <p className="text-xs text-red-500 mt-1">{errors.player3.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cầu Thủ 2</label>
                    <Controller
                      name="player4"
                      control={control}
                      shouldUnregister
                      render={({ field }) => (
                        <SingleSelectCombobox
                          options={availableFor([player1, player2, player3])}
                          selectedValue={field.value ?? ''}
                          onChange={field.onChange}
                          emptySelectionPlaceholder="Chọn cầu thủ"
                          inputPlaceholder="Tìm cầu thủ..."
                        />
                      )}
                    />
                    {errors.player4 && (
                      <p className="text-xs text-red-500 mt-1">{errors.player4.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tỷ Số</label>
                    <Input
                      type="number"
                      min="0"
                      {...register('score2', { valueAsNumber: true })}
                      className="bg-white dark:bg-slate-900"
                    />
                    {errors.score2 && (
                      <p className="text-xs text-red-500 mt-1">{errors.score2.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">
            Thêm Kết Quả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
