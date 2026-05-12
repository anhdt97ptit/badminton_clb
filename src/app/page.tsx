'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopWinners } from '@/components/top-winners';
import { MatchHistory } from '@/components/match-history';
import { AddMatchModal } from '@/components/add-match-modal';
import { useHome } from '@/hooks/use-home';

export default function Home() {
  const {
    stats,
    topWinners,
    todayMatches,
    members,
    loading,
    isAddMatchOpen,
    setIsAddMatchOpen,
    addMatch,
  } = useHome();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Badminton Club</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Thống kê tỷ lệ thắng - Cập nhật 2026
              </p>
            </div>
            <div className="hidden sm:block text-right text-sm text-muted-foreground">
              <p>Hôm nay</p>
              <p className="font-semibold text-foreground">
                {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Thành Viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.memberCount}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Trận Đấu/Tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.monthlyMatchCount}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trận Hôm Nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.todayMatchCount}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Win Rate Cao Nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {topWinners[0] ? `${topWinners[0].winRate.toFixed(1)}%` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 order-first lg:order-0">
          {/* Left Column - Top Winners */}
          <div className="lg:col-span-2 order-1 lg:order-0">
            <TopWinners winners={topWinners} />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4 order-3 lg:order-0">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-primary">Thao Tác Nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link href="/history">Xem Toàn Bộ Lịch Sử</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link href="/members">Xem Toàn Bộ Thành Viên</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-linear-to-br from-accent/5 to-accent/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-primary">Gợi Ý</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {topWinners[0]
                    ? `${topWinners[0].name} dẫn đầu với tỷ lệ thắng ${topWinners[0].winRate.toFixed(1)}%. Thực hiện tốt nhất của câu lạc bộ!`
                    : 'Chưa có dữ liệu thống kê.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Match History Section */}
        <div className="mt-6 order-2 lg:order-0">
          <Card className="border-primary/20">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-primary">
                Lịch Sử Đấu Hôm Nay
              </CardTitle>
              <Button
                onClick={() => setIsAddMatchOpen(true)}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                + Thêm Kết Quả
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Đang tải...</p>
              ) : (
                <MatchHistory matches={todayMatches} maxItems={4} />
              )}
            </CardContent>
          </Card>
        </div>
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
