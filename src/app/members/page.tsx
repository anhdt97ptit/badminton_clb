'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AddMemberModal } from '@/components/add-member-modal';
import { MemberDetailModal } from '@/components/member-detail-modal';
import { MemberCard } from '@/components/member-card';
import { useMembers } from '@/hooks/use-members';

export default function MembersPage() {
  const {
    members,
    loading,
    error,
    sortedMembers,
    paginatedMembers,
    totalPages,
    currentPage,
    searchName,
    updateSearchName,
    clearSearch,
    isAddMemberOpen,
    setIsAddMemberOpen,
    selectedMember,
    isDetailModalOpen,
    setIsDetailModalOpen,
    openMemberDetail,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    setCurrentPage,
  } = useMembers();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="text-primary hover:text-primary/80 text-sm mb-2 inline-block"
              >
                ← Quay lại
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Tất Cả Thành Viên</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Danh sách {members.length} thành viên
              </p>
            </div>
            <Button
              onClick={() => setIsAddMemberOpen(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
            >
              + Thêm Thành Viên
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Filter Box */}
        <Card className="border-primary/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-primary">Bộ Lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={searchName}
                onChange={(e) => updateSearchName(e.target.value)}
                className="bg-white dark:bg-slate-900"
              />
              <Button onClick={clearSearch} variant="outline" className="shrink-0">
                Xóa Bộ Lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-12 rounded-lg" />
                    <Skeleton className="h-12 rounded-lg" />
                    <Skeleton className="h-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
              Thử lại
            </Button>
          </div>
        )}

        {/* Members Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  originalIndex={sortedMembers.indexOf(member)}
                  onClick={openMemberDetail}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      className={currentPage === page ? 'bg-primary hover:bg-primary/90' : ''}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Sau
                </Button>
              </div>
            )}

            {/* Empty State */}
            {paginatedMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchName ? 'Không tìm thấy thành viên phù hợp' : 'Chưa có thành viên nào'}
                </p>
                {!searchName && (
                  <Button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Thêm Thành Viên Đầu Tiên
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={addMember}
      />
      <MemberDetailModal
        isOpen={isDetailModalOpen}
        member={selectedMember}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdate={updateMember}
        onDelete={deleteMember}
      />
    </div>
  );
}
