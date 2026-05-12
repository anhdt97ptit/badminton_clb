import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const teamEnum = pgEnum('team', ['A', 'B']);

// Giữ nguyên — có thể dùng cho auth sau này
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  birth_year: integer('birth_year'),
  phone: text('phone'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  played_at: timestamp('played_at').defaultNow().notNull(),
  note: text('note'),
});

export const matchPlayers = pgTable(
  'match_players',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    match_id: uuid('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    member_id: uuid('member_id')
      .notNull()
      .references(() => members.id),
    team: teamEnum('team').notNull(),
  },
  (table) => [unique('match_players_match_member_unique').on(table.match_id, table.member_id)],
);

export const matchResults = pgTable(
  'match_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    match_id: uuid('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    score_a: integer('score_a').notNull(),
    score_b: integer('score_b').notNull(),
    winner_team: teamEnum('winner_team').notNull(),
  },
  (table) => [
    unique('match_results_match_id_unique').on(table.match_id),
    check(
      'match_results_winner_check',
      sql`(score_a > score_b AND winner_team = 'A') OR (score_b > score_a AND winner_team = 'B')`,
    ),
  ],
);
