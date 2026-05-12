'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { type Match } from '@/components/match-history';
import type { MatchData } from '@/lib/validations';

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
    Promise.all([
      fetch('/api/members/count').then((r) => r.json()),
      fetch('/api/matches/monthly-count').then((r) => r.json()),
      fetch('/api/matches/today-count').then((r) => r.json()),
      fetch('/api/members/top3').then((r) => r.json()),
      fetch('/api/matches/today').then((r) => r.json()),
      fetch('/api/members').then((r) => r.json()),
    ])
      .then(([memberCount, monthlyCount, todayCount, top3, todayMatchData, memberList]) => {
        setStats({
          memberCount: memberCount.count ?? 0,
          monthlyMatchCount: monthlyCount.count ?? 0,
          todayMatchCount: todayCount.count ?? 0,
        });
        setTopWinners(Array.isArray(top3) ? top3 : []);
        setTodayMatches(Array.isArray(todayMatchData) ? todayMatchData : []);
        setMembers(Array.isArray(memberList) ? memberList : []);
      })
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const addMatch = useCallback(async (data: MatchData) => {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error('Thêm trận đấu thất bại');
      return;
    }
    const newMatch: Match = await res.json();
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
