'use client';

import Link from 'next/link';
import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddMatchModal } from '@/components/add-match-modal';
import { MatchHistory } from '@/components/match-history';
import { useHistory } from '@/hooks/use-history';

export default function HistoryPage() {
  const {
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
  } = useHistory();

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
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Lịch Sử Đấu</h1>
              <p className="text-sm text-muted-foreground mt-1">Tất cả {total} trận đấu</p>
            </div>
            <Button
              onClick={() => setIsAddMatchOpen(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
            >
              + Thêm Kết Quả
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="border-primary/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-primary">Bộ Lọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Tìm Kiếm Thành Viên</label>
                <Input
                  placeholder="Nhập tên..."
                  value={searchMember}
                  onChange={(e) => updateSearchMember(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tìm Kiếm Tháng</label>
                <Input
                  type="month"
                  value={searchMonth}
                  onChange={(e) => updateSearchMonth(e.target.value)}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              {searchMember && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Kết Quả</label>
                  <Select
                    value={filterResult}
                    onValueChange={(value) => {
                      if (value) updateFilterResult(value as 'all' | 'win' | 'lose');
                    }}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất Cả</SelectItem>
                      <SelectItem value="win">Thắng</SelectItem>
                      <SelectItem value="lose">Thua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-end">
                <Button onClick={() => search()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ListFilter className="h-4 w-4" />
                  Tìm Kiếm
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Xóa Bộ Lọc
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matches List */}
        <div className="mb-6">
          {loading ? (
            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Đang tải...</p>
              </CardContent>
            </Card>
          ) : (
            <MatchHistory matches={matches} onDelete={deleteMatch} />
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => goToPage(currentPage - 1)}
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
                  onClick={() => goToPage(page)}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className={currentPage === page ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Sau
            </Button>
          </div>
        )}
      </main>

      <AddMatchModal
        isOpen={isAddMatchOpen}
        onClose={() => setIsAddMatchOpen(false)}
        onSubmit={addMatch}
        members={members}
      />
    </div>
  );
}
