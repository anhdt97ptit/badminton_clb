import { eq, sql, count } from 'drizzle-orm';
import { db } from '@db';
import { members, matchPlayers, matchResults } from '@db/schema';

export interface Member {
  id: string;
  name: string;
  birthYear: number | null;
  phone: string;
  wins: number;
  losses: number;
  winRate: number;
  avatar: string;
}

function toMember(row: {
  id: string;
  name: string;
  birth_year: number | null;
  phone: string | null;
  wins: number;
  losses: number;
}): Member {
  const wins = Number(row.wins) || 0;
  const losses = Number(row.losses) || 0;
  const total = wins + losses;
  return {
    id: row.id,
    name: row.name,
    birthYear: row.birth_year,
    phone: row.phone ?? '',
    wins,
    losses,
    winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.id}`,
  };
}

const statsSelect = {
  id: members.id,
  name: members.name,
  birth_year: members.birth_year,
  phone: members.phone,
  wins: sql<number>`CAST(COALESCE(SUM(CASE WHEN ${matchPlayers.team} = ${matchResults.winner_team} THEN 1 ELSE 0 END), 0) AS INTEGER)`,
  losses: sql<number>`CAST(COALESCE(SUM(CASE WHEN ${matchPlayers.team} != ${matchResults.winner_team} THEN 1 ELSE 0 END), 0) AS INTEGER)`,
};

export async function getMembersCount(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(members);
  return result.count;
}

export async function getTopMembers(limit: number): Promise<Member[]> {
  const rows = await db
    .select(statsSelect)
    .from(members)
    .leftJoin(matchPlayers, eq(matchPlayers.member_id, members.id))
    .leftJoin(matchResults, eq(matchResults.match_id, matchPlayers.match_id))
    .groupBy(members.id);

  return rows
    .map(toMember)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, limit);
}

export async function getMembersWithStats(): Promise<Member[]> {
  const rows = await db
    .select(statsSelect)
    .from(members)
    .leftJoin(matchPlayers, eq(matchPlayers.member_id, members.id))
    .leftJoin(matchResults, eq(matchResults.match_id, matchPlayers.match_id))
    .groupBy(members.id);

  return rows.map(toMember);
}

export async function getMemberById(id: string): Promise<Member | null> {
  const rows = await db
    .select(statsSelect)
    .from(members)
    .leftJoin(matchPlayers, eq(matchPlayers.member_id, members.id))
    .leftJoin(matchResults, eq(matchResults.match_id, matchPlayers.match_id))
    .where(eq(members.id, id))
    .groupBy(members.id);

  return rows[0] ? toMember(rows[0]) : null;
}

export async function createMember(data: {
  name: string;
  birthYear?: number;
  phone?: string;
}): Promise<Member> {
  const [row] = await db
    .insert(members)
    .values({ name: data.name, birth_year: data.birthYear ?? null, phone: data.phone ?? null })
    .returning();

  return toMember({ ...row, wins: 0, losses: 0 });
}

export async function updateMember(
  id: string,
  data: { name: string; birthYear?: number; phone?: string },
): Promise<Member | null> {
  await db
    .update(members)
    .set({ name: data.name, birth_year: data.birthYear ?? null, phone: data.phone ?? null })
    .where(eq(members.id, id));

  return getMemberById(id);
}

export async function deleteMember(id: string): Promise<void> {
  await db.delete(members).where(eq(members.id, id));
}
