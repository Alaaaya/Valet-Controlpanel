import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { GetSettingsResponse, UpdateSettingsBody, UpdateSettingsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    result[key] = val instanceof Date ? val.toISOString() : val;
  }
  return result;
}

async function ensureSettingsRow() {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(siteSettingsTable).values({}).returning();
    return created;
  }
  return rows[0];
}

router.get("/settings", async (req, res): Promise<void> => {
  const settings = await ensureSettingsRow();
  res.json(GetSettingsResponse.parse(serializeDates(settings as Record<string, unknown>)));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid settings body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await ensureSettingsRow();

  const [updated] = await db
    .update(siteSettingsTable)
    .set(parsed.data)
    .where(eq(siteSettingsTable.id, existing.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(serializeDates(updated as Record<string, unknown>)));
});

export default router;
