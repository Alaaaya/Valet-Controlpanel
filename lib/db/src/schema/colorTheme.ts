import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const colorThemeTable = pgTable("color_theme", {
  id: serial("id").primaryKey(),
  primaryColor: text("primary_color").notNull().default("#1a3c5e"),
  secondaryColor: text("secondary_color").notNull().default("#c9a227"),
  accentColor: text("accent_color").notNull().default("#e8b84b"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  textColor: text("text_color").notNull().default("#1a1a1a"),
  headerBgColor: text("header_bg_color").notNull().default("#1a3c5e"),
  footerBgColor: text("footer_bg_color").notNull().default("#0f2540"),
  buttonColor: text("button_color").notNull().default("#c9a227"),
  buttonTextColor: text("button_text_color").notNull().default("#ffffff"),
  linkColor: text("link_color").notNull().default("#c9a227"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertColorThemeSchema = createInsertSchema(colorThemeTable).omit({ id: true, updatedAt: true });
export type InsertColorTheme = z.infer<typeof insertColorThemeSchema>;
export type ColorTheme = typeof colorThemeTable.$inferSelect;
