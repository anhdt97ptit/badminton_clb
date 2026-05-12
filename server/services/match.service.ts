import { eq, ne, desc, and, gte, lt, count, inArray, ilike, SQL } from 'drizzle-orm';
import { db } from '@db';
import { matches, matchPlayers, matchResults, members } from '@db/schema';
import type { MatchData } from '@/lib/validations';

export interface Match {
  id: string;
  played_at: string;
  team_a: { id: string; name: string }[];
  team_b: { id: string; name: string }[];
  score_a: number;
  score_b: number;
  winner_team: 'A' | 'B';
}

function todayRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  };
}

function monthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

async function fetchMatches(where?: SQL): Promise<Match[]> {
  const playerRows = await db
    .select({
      matchId: matches.id,
      played_at: matches.played_at,
      memberId: members.id,
      memberName: members.name,
      team: matchPlayers.team,
    })
    .from(matches)
    .leftJoin(matchPlayers, eq(matchPlayers.match_id, matches.id))
    .leftJoin(members, eq(members.id, matchPlayers.member_id))
    .where(where)
    .orderBy(desc(matches.played_at));

  if (playerRows.length === 0) return [];

  const matchIds = [...new Set(playerRows.map((r) => r.matchId))];
  const resultRows = await db
    .select()
    .from(matchResults)
    .where(inArray(matchResults.match_id, matchIds));
  const resultMap = new Map(resultRows.map((r) => [r.match_id, r]));

  const matchMap = new Map<
    string,
    { played_at: Date; team_a: { id: string; name: string }[]; team_b: { id: string; name: string }[] }
  >();

  for (const row of playerRows) {
    if (!matchMap.has(row.matchId)) {
      matchMap.set(row.matchId, { played_at: row.played_at, team_a: [], team_b: [] });
    }
    const m = matchMap.get(row.matchId)!;
    if (row.memberId && row.memberName) {
      if (row.team === 'A') m.team_a.push({ id: row.memberId, name: row.memberName });
      else m.team_b.push({ id: row.memberId, name: row.memberName });
    }
  }

  return Array.from(matchMap.entries())
    .map(([id, m]) => {
      const r = resultMap.get(id);
      if (!r) return null;
      return {
        id,
        played_at: m.played_at.toISOString(),
        team_a: m.team_a,
        team_b: m.team_b,
        score_a: r.score_a,
        score_b: r.score_b,
        winner_team: r.winner_team,
      } satisfies Match;
    })
    .filter((m): m is Match => m !== null);
}

export async function getMatchesTodayCount(): Promise<number> {
  const { start, end } = todayRange();
  const [result] = await db
    .select({ count: count() })
    .from(matches)
    .where(and(gte(matches.played_at, start), lt(matches.played_at, end)));
  return result.count;
}

export async function getMatchesMonthlyCount(): Promise<number> {
  const { start, end } = monthRange();
  const [result] = await db
    .select({ count: count() })
    .from(matches)
    .where(and(gte(matches.played_at, start), lt(matches.played_at, end)));
  return result.count;
}

export async function getMatchesToday(): Promise<Match[]> {
  const { start, end } = todayRange();
  return fetchMatches(and(gte(matches.played_at, start), lt(matches.played_at, end)));
}

export interface MatchFilters {
  memberName?: string;
  month?: string;        // YYYY-MM
  memberResult?: 'win' | 'lose';
}

export interface PaginatedMatches {
  data: Match[];
  total: number;
}

export async function getMatches(
  filters?: MatchFilters,
  pagination = { page: 1, limit: 8 },
): Promise<PaginatedMatches> {
  const conditions: SQL[] = [];

  if (filters?.month) {
    const [year, month] = filters.month.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    conditions.push(gte(matches.played_at, start), lt(matches.played_at, end));
  }

  if (filters?.memberName) {
    const nameCondition = ilike(members.name, `%${filters.memberName}%`);
    const resultCondition =
      filters.memberResult === 'win'
        ? eq(matchPlayers.team, matchResults.winner_team)
        : filters.memberResult === 'lose'
          ? ne(matchPlayers.team, matchResults.winner_team)
          : undefined;

    const rows = await db
      .select({ matchId: matchPlayers.match_id })
      .from(matchPlayers)
      .innerJoin(members, eq(members.id, matchPlayers.member_id))
      .innerJoin(matchResults, eq(matchResults.match_id, matchPlayers.match_id))
      .where(resultCondition ? and(nameCondition, resultCondition) : nameCondition);

    if (rows.length === 0) return { data: [], total: 0 };
    conditions.push(inArray(matches.id, rows.map((r) => r.matchId)));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return paginateMatches(where, pagination);
}

async function paginateMatches(
  where: SQL | undefined,
  { page, limit }: { page: number; limit: number },
): Promise<PaginatedMatches> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(matches)
    .where(where);

  if (total === 0) return { data: [], total: 0 };

  const offset = (page - 1) * limit;
  const pageIds = await db
    .select({ id: matches.id })
    .from(matches)
    .where(where)
    .orderBy(desc(matches.played_at))
    .limit(limit)
    .offset(offset);

  if (pageIds.length === 0) return { data: [], total };

  const data = await fetchMatches(inArray(matches.id, pageIds.map((r) => r.id)));
  // Re-sort to match the intended order (fetchMatches orders by played_at desc)
  return { data, total };
}

export async function getMatchById(id: string): Promise<Match | null> {
  const [match] = await fetchMatches(eq(matches.id, id));
  return match ?? null;
}

export async function createMatch(data: MatchData): Promise<Match> {
  const winner_team: 'A' | 'B' = data.score1 > data.score2 ? 'A' : 'B';

  const [match] = await db
    .insert(matches)
    .values({ played_at: new Date(data.date) })
    .returning();

  const playerInserts =
    data.type === '1v1'
      ? [
          { match_id: match.id, member_id: data.player1, team: 'A' as const },
          { match_id: match.id, member_id: data.player2, team: 'B' as const },
        ]
      : [
          { match_id: match.id, member_id: data.player1, team: 'A' as const },
          { match_id: match.id, member_id: data.player2, team: 'A' as const },
          { match_id: match.id, member_id: data.player3!, team: 'B' as const },
          { match_id: match.id, member_id: data.player4!, team: 'B' as const },
        ];

  await db.insert(matchPlayers).values(playerInserts);
  await db.insert(matchResults).values({
    match_id: match.id,
    score_a: data.score1,
    score_b: data.score2,
    winner_team,
  });

  return (await getMatchById(match.id))!;
}

export async function deleteMatch(id: string): Promise<void> {
  await db.delete(matches).where(eq(matches.id, id));
}
