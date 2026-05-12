'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopWinner {
  id: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  avatar: string;
}

interface TopWinnersProps {
  winners: TopWinner[];
}

export function TopWinners({ winners }: TopWinnersProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-primary">🏆 Top 3 Cầu Thủ Xuất Sắc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {winners.map((winner, index) => {
            let bgColor = 'bg-secondary/40 hover:bg-secondary/60';
            let badgeColor = 'bg-primary text-primary-foreground';

            if (index === 0) {
              // Top 1 - Gold
              bgColor =
                'bg-yellow-100/60 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 border border-yellow-300/50';
              badgeColor = 'bg-yellow-500 text-white';
            } else if (index === 1) {
              // Top 2 - Silver
              bgColor =
                'bg-gray-200/60 hover:bg-gray-200/80 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 border border-gray-400/50';
              badgeColor = 'bg-gray-400 text-white';
            } else if (index === 2) {
              // Top 3 - Bronze
              bgColor =
                'bg-orange-100/60 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 border border-orange-300/50';
              badgeColor = 'bg-orange-500 text-white';
            }

            return (
              <div
                key={winner.id}
                className={`flex items-center gap-4 p-3 rounded-lg ${bgColor} transition-colors`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${badgeColor} font-bold text-sm`}
                >
                  {index + 1}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={winner.avatar} alt={winner.name} />
                  <AvatarFallback>{winner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{winner.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {winner.wins}W - {winner.losses}L
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{winner.winRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
