'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { type Match } from '@/components/match-history';
import type { MatchData } from '@/lib/validations';
import { fetchJSON } from '@/lib/api';

interface TopWinner {
  id: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  avatar: string;
}

interface Stats {
  memberCount: number;
  monthlyMatchCount: number;
  todayMatchCount: number;
}

export function useHome() {
  const [stats, setStats] = useState<Stats>({ memberCount: 0, monthlyMatchCount: 0, todayMatchCount: 0 });
  const [topWinners, setTopWinners] = useState<TopWinner[]>([]);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [memberCount, monthlyCount, todayCount, top3, todayMatchData, memberList] =
          await Promise.all([
            fetchJSON<{ count: number }>('/api/members/count'),
            fetchJSON<{ count: number }>('/api/matches/monthly-count'),
            fetchJSON<{ count: number }>('/api/matches/today-count'),
            fetchJSON<TopWinner[]>('/api/members/top3'),
            fetchJSON<Match[]>('/api/matches/today'),
            fetchJSON<{ id: string; name: string }[]>('/api/members'),
          ]);
        setStats({
          memberCount: memberCount.count ?? 0,
          monthlyMatchCount: monthlyCount.count ?? 0,
          todayMatchCount: todayCount.count ?? 0,
        });
        setTopWinners(Array.isArray(top3) ? top3 : []);
        setTodayMatches(Array.isArray(todayMatchData) ? todayMatchData : []);
        setMembers(Array.isArray(memberList) ? memberList : []);
      } catch {
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addMatch = useCallback(async (data: MatchData) => {
    const newMatch = await fetchJSON<Match>('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      toast.error('Thêm trận đấu thất bại');
      return null;
    });
    if (!newMatch) return;
    setTodayMatches((prev) => [newMatch, ...prev]);
    setStats((prev) => ({
      ...prev,
      todayMatchCount: prev.todayMatchCount + 1,
      monthlyMatchCount: prev.monthlyMatchCount + 1,
    }));
    setIsAddMatchOpen(false);
    toast.success('Thêm kết quả thành công');
  }, []);

  return {
    stats,
    topWinners,
    todayMatches,
    members,
    loading,
    isAddMatchOpen,
    setIsAddMatchOpen,
    addMatch,
  };
}
