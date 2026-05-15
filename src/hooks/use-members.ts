'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Member } from '@server/services/member.service';
import type { MemberData } from '@/lib/validations';
import { fetchJSON } from '@/lib/api';

const ITEMS_PER_PAGE = 6;

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON<Member[]>('/api/members');
      setMembers(data);
    } catch {
      setError('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const sortedMembers = useMemo(
    () =>
      [...members]
        .sort((a, b) => b.winRate - a.winRate)
        .filter((m) => m.name.toLowerCase().includes(searchName.toLowerCase())),
    [members, searchName],
  );

  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(
    () => sortedMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [sortedMembers, currentPage],
  );

  const updateSearchName = useCallback((value: string) => {
    setSearchName(value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchName('');
    setCurrentPage(1);
  }, []);

  const openMemberDetail = useCallback((member: Member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  }, []);

  const addMember = useCallback(async (data: MemberData) => {
    try {
      const newMember = await fetchJSON<Member>('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setMembers((prev) => [...prev, newMember]);
      setIsAddMemberOpen(false);
      toast.success('Đã thêm thành viên mới');
    } catch {
      toast.error('Thêm thành viên thất bại');
    }
  }, []);

  const updateMember = useCallback((updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelectedMember(updated);
  }, []);

  const deleteMember = useCallback((memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setIsDetailModalOpen(false);
  }, []);

  return {
    // data
    members,
    loading,
    error,
    sortedMembers,
    paginatedMembers,
    totalPages,
    currentPage,
    // search
    searchName,
    updateSearchName,
    clearSearch,
    // modal - add
    isAddMemberOpen,
    setIsAddMemberOpen,
    // modal - detail
    selectedMember,
    isDetailModalOpen,
    setIsDetailModalOpen,
    openMemberDetail,
    // actions
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    setCurrentPage,
  };
}
