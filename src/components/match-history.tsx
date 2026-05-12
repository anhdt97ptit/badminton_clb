'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Match {
  id: string;
  played_at: string;
  team_a: { id: string; name: string }[];
  team_b: { id: string; name: string }[];
  score_a: number;
  score_b: number;
  winner_team: 'A' | 'B';
}

interface MatchHistoryProps {
  matches: Match[];
  onDelete?: (id: string) => void;
  maxItems?: number;
}

export function MatchHistory({ matches, onDelete, maxItems }: MatchHistoryProps) {
  const displayed = maxItems ? matches.slice(0, maxItems) : matches;

  if (displayed.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Không có trận đấu nào</p>;
  }

  return (
    <div className="space-y-3">
      {displayed.map((match) => {
        const teamAIsWinner = match.winner_team === 'A';
        const date = new Date(match.played_at);
        const dateStr = date.toLocaleDateString('vi-VN');

        return (
          <div key={match.id}>
            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center rounded-lg border border-border overflow-hidden hover:shadow-md transition-all">
              <div
                className={`flex-1 p-3 ${teamAIsWinner ? 'bg-green-100/40 dark:bg-green-900/20' : 'bg-red-100/40 dark:bg-red-900/20'}`}
              >
                <div className="font-semibold text-foreground text-sm">
                  {match.team_a.map((p) => (
                    <p key={p.id} className="truncate">{p.name}</p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{dateStr}</p>
              </div>

              <div className="px-3 py-2 bg-card border-x border-border min-w-fit">
                <p className="font-bold text-center text-lg">
                  <span
                    className={
                      teamAIsWinner
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {match.score_a}
                  </span>
                  <span className="text-muted-foreground mx-2">-</span>
                  <span
                    className={
                      !teamAIsWinner
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {match.score_b}
                  </span>
                </p>
              </div>

              <div
                className={`flex-1 p-3 text-right ${!teamAIsWinner ? 'bg-green-100/40 dark:bg-green-900/20' : 'bg-red-100/40 dark:bg-red-900/20'}`}
              >
                <div className="font-semibold text-foreground text-sm">
                  {match.team_b.map((p) => (
                    <p key={p.id} className="truncate">{p.name}</p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">&nbsp;</p>
              </div>

              {onDelete && (
                <div className="px-2 bg-card">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(match.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Layout */}
            <div className="sm:hidden rounded-lg border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="grid grid-cols-2 gap-0">
                <div
                  className={`p-3 ${teamAIsWinner ? 'bg-green-100/40 dark:bg-green-900/20' : 'bg-red-100/40 dark:bg-red-900/20'}`}
                >
                  <div className="font-semibold text-foreground text-xs">
                    {match.team_a.map((p) => (
                      <p key={p.id} className="truncate">{p.name}</p>
                    ))}
                  </div>
                  <p className="font-bold text-lg mt-2">
                    <span
                      className={
                        teamAIsWinner
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {match.score_a}
                    </span>
                  </p>
                </div>

                <div
                  className={`p-3 ${!teamAIsWinner ? 'bg-green-100/40 dark:bg-green-900/20' : 'bg-red-100/40 dark:bg-red-900/20'}`}
                >
                  <div className="font-semibold text-foreground text-xs text-right">
                    {match.team_b.map((p) => (
                      <p key={p.id} className="truncate">{p.name}</p>
                    ))}
                  </div>
                  <p className="font-bold text-lg mt-2 text-right">
                    <span
                      className={
                        !teamAIsWinner
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {match.score_b}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">&nbsp;</p>
                </div>
              </div>

              {onDelete && (
                <div className="flex justify-end px-2 py-1 border-t border-border bg-card">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(match.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
