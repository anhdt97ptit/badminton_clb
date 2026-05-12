import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import React from 'react';

export interface MemberCardProps {
  member: {
    id: string;
    name: string;
    wins: number;
    losses: number;
    winRate: number;
    avatar: string;
    birthYear: number | null;
    phone: string;
  };
  originalIndex: number;
  onClick: (member: MemberCardProps['member']) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, originalIndex, onClick }) => (
  <Card
    key={member.id}
    className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
    onClick={() => onClick(member)}
  >
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground truncate">
              {member.name}
            </CardTitle>
            {member.birthYear && (
              <p className="text-xs text-muted-foreground">Sinh năm {member.birthYear}</p>
            )}
          </div>
        </div>
        {originalIndex < 3 && (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white ml-2 shrink-0">
            Top {originalIndex + 1}
          </Badge>
        )}
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* Win Rate Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Tỷ Lệ Thắng</p>
          <p className="text-sm font-bold text-primary">{member.winRate.toFixed(1)}%</p>
        </div>
        <Progress value={member.winRate} className="h-2" />
      </div>

      {/* Stats */}
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

      {/* Phone */}
      <div className="border-t border-border/30 pt-3">
        <p className="text-xs text-muted-foreground">Điện Thoại</p>
        <p className="text-sm font-medium text-foreground">{member.phone}</p>
      </div>
    </CardContent>
  </Card>
);
