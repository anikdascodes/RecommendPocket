import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  genres: jsonb("genres").$type<string[]>().notNull(),
  duration: text("duration").notNull(),
  completedOnboarding: boolean("completed_onboarding").default(false),
});

export const audioContent = pgTable("audio_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  duration: text("duration").notNull(),
  rating: text("rating").notNull(),
  thumbnail: text("thumbnail").notNull(),
  playCount: integer("play_count").default(0),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  contentId: integer("content_id").references(() => audioContent.id),
  reason: text("reason"),
  score: integer("score").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  userId: true,
});

export const insertAudioContentSchema = createInsertSchema(audioContent).omit({
  id: true,
  playCount: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertAudioContent = z.infer<typeof insertAudioContentSchema>;
export type AudioContent = typeof audioContent.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
