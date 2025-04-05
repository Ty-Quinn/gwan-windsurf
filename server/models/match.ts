
import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { users } from './user';

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  player1Id: integer('player1_id').notNull().references(() => users.id),
  player2Id: integer('player2_id').notNull().references(() => users.id),
  winnerId: integer('winner_id').references(() => users.id),
  player1Score: integer('player1_score').notNull(),
  player2Score: integer('player2_score').notNull(),
  roundsPlayed: integer('rounds_played').notNull(),
  gameData: jsonb('game_data'), // Store detailed game data if needed
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  gameType: varchar('game_type', { length: 50 }).default('pvp').notNull(), // 'pvp' or 'ai'
});

export const matchRelations = relations(matches, ({ many }) => ({
  players: many(users),
}));
