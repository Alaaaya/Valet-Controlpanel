import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactInfoTable = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  whatsappNumber: text("whatsapp_number").notNull().default("+4917612345678"),
  whatsappMessage: text("whatsapp_message").notNull().default("مرحباً، أود حجز خدمة الفاليه"),
  email: text("email").notNull().default("info@travelvalet-dus.de"),
  phone: text("phone").notNull().default("+49 176 12345678"),
  address: text("address").notNull().default("Düsseldorf, Deutschland"),
  bookingUrl: text("booking_url").notNull().default("https://wa.me/4917612345678"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContactInfoSchema = createInsertSchema(contactInfoTable).omit({ id: true, updatedAt: true });
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;
export type ContactInfo = typeof contactInfoTable.$inferSelect;
