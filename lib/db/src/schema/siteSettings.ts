import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Travel Valet Düsseldorf"),
  heroTitle: text("hero_title").notNull().default("خدمة فاليه السفر"),
  heroSubtitle: text("hero_subtitle").notNull().default("نقدم لكم أفضل خدمات النقل والسفر في دوسلدورف"),
  aboutTitle: text("about_title").notNull().default("من نحن"),
  aboutText: text("about_text").notNull().default("نحن شركة متخصصة في تقديم خدمات النقل والفاليه بأعلى معايير الجودة والاحترافية"),
  servicesTitle: text("services_title").notNull().default("خدماتنا"),
  bookingTitle: text("booking_title").notNull().default("احجز الآن"),
  bookingSubtitle: text("booking_subtitle").notNull().default("تواصل معنا عبر واتساب لحجز خدمتك"),
  footerText: text("footer_text").notNull().default("جميع الحقوق محفوظة © 2025 Travel Valet Düsseldorf"),
  metaDescription: text("meta_description").notNull().default("خدمة فاليه السفر المتميزة في دوسلدورف - نقل فاخر وموثوق"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
