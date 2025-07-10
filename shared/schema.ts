import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
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
  preferredNarrators: jsonb("preferred_narrators").$type<string[]>().default([]),
  preferredLanguages: jsonb("preferred_languages").$type<string[]>().default(["English"]),
  autoPlay: boolean("auto_play").default(true),
  downloadQuality: text("download_quality").default("high"),
  playbackSpeed: real("playback_speed").default(1.0),
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
  tags: text("tags").array().default([]),
  language: text("language").default("English"),
  narrator: text("narrator"),
  audioUrl: text("audio_url"),
  fileSize: text("file_size"),
  releaseDate: timestamp("release_date").defaultNow(),
  totalDurationMinutes: integer("total_duration_minutes"),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  contentId: integer("content_id").references(() => audioContent.id),
  reason: text("reason"),
  score: integer("score").default(0),
});

// New tables for enhanced functionality
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  contentId: integer("content_id").references(() => audioContent.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listeningHistory = pgTable("listening_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  contentId: integer("content_id").references(() => audioContent.id),
  progressMinutes: integer("progress_minutes").default(0),
  completed: boolean("completed").default(false),
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  totalListenTime: integer("total_listen_time").default(0),
});

export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  contentId: integer("content_id").references(() => audioContent.id),
  rating: integer("rating"), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Schema exports for new tables
export const insertUserFavoritesSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertListeningHistorySchema = createInsertSchema(listeningHistory).omit({
  id: true,
  lastPlayedAt: true,
});

export const insertUserRatingsSchema = createInsertSchema(userRatings).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertAudioContent = z.infer<typeof insertAudioContentSchema>;
export type AudioContent = typeof audioContent.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertUserFavorites = z.infer<typeof insertUserFavoritesSchema>;
export type UserFavorites = typeof userFavorites.$inferSelect;
export type InsertListeningHistory = z.infer<typeof insertListeningHistorySchema>;
export type ListeningHistory = typeof listeningHistory.$inferSelect;
export type InsertUserRatings = z.infer<typeof insertUserRatingsSchema>;
export type UserRatings = typeof userRatings.$inferSelect;
