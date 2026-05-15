'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { type Match } from '@/components/match-history';
import type { MatchData } from '@/lib/validations';
import { fetchJSON } from '@/lib/api';

const LIMIT = 8;

interface FetchParams {
  member?: string;
  month?: string;
  result?: string;
  page?: number;
}

export function useHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [searchMonth, setSearchMonth] = useState('');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'lose'>('all');

  const fetchMatches = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.member) query.set('member', params.member);
      if (params.month) query.set('month', params.month);
      if (params.result && params.result !== 'all') query.set('result', params.result);
      query.set('page', String(params.page ?? 1));
      query.set('limit', String(LIMIT));

      const json = await fetchJSON<{ data: Match[]; total: number; page: number; totalPages: number }>(
        `/api/matches?${query.toString()}`,
      );
      setMatches(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
      setCurrentPage(json.page);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchMatches(), fetchJSON<{ id: string; name: string }[]>('/api/members')])
      .then(([, memberData]) => setMembers(Array.isArray(memberData) ? memberData : []))
      .catch(() => toast.error('Không thể tải dữ liệu'));
  }, [fetchMatches]);

  const search = useCallback(
    (page = 1) => {
      fetchMatches({ member: searchMember, month: searchMonth, result: filterResult, page });
    },
    [fetchMatches, searchMember, searchMonth, filterResult],
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchMatches({ member: searchMember, month: searchMonth, result: filterResult, page });
    },
    [fetchMatches, searchMember, searchMonth, filterResult],
  );

  const clearFilters = useCallback(() => {
    setSearchMember('');
    setSearchMonth('');
    setFilterResult('all');
    fetchMatches({ page: 1 });
  }, [fetchMatches]);

  const updateSearchMember = useCallback((value: string) => setSearchMember(value), []);
  const updateSearchMonth = useCallback((value: string) => setSearchMonth(value), []);
  const updateFilterResult = useCallback((value: 'all' | 'win' | 'lose') => setFilterResult(value), []);

  const hasActiveFilters = !!(searchMember || searchMonth || (searchMember && filterResult !== 'all'));

  const addMatch = useCallback(async (data: MatchData) => {
    try {
      await fetchJSON('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setIsAddMatchOpen(false);
      toast.success('Thêm kết quả thành công');
      fetchMatches({ member: searchMember, month: searchMonth, result: filterResult, page: 1 });
    } catch {
      toast.error('Thêm trận đấu thất bại');
    }
  }, [fetchMatches, searchMember, searchMonth, filterResult]);

  const deleteMatch = useCallback(async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa trận đấu này?')) return;
    const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Xóa trận đấu thất bại'); return; }
    toast.success('Đã xóa trận đấu');
    fetchMatches({ member: searchMember, month: searchMonth, result: filterResult, page: currentPage });
  }, [fetchMatches, searchMember, searchMonth, filterResult, currentPage]);

  return {
    members,
    matches,
    total,
    loading,
    totalPages,
    currentPage,
    searchMember,
    searchMonth,
    filterResult,
    hasActiveFilters,
    updateSearchMember,
    updateSearchMonth,
    updateFilterResult,
    search,
    goToPage,
    clearFilters,
    isAddMatchOpen,
    setIsAddMatchOpen,
    addMatch,
    deleteMatch,
  };
}
