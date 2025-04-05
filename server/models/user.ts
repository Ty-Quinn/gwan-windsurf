
import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { matches } from './match';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  totalMatches: integer('total_matches').default(0).notNull(),
  wins: integer('wins').default(0).notNull(),
  losses: integer('losses').default(0).notNull(),
  draws: integer('draws').default(0).notNull(),
  rankPoints: integer('rank_points').default(1000).notNull(), // ELO-like ranking system
});

export const userRelations = relations(users, ({ many }) => ({
  matches: many(matches),
}));
