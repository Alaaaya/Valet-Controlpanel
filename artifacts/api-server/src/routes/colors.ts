import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, colorThemeTable } from "@workspace/db";
import { GetColorsResponse, UpdateColorsBody, UpdateColorsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    result[key] = val instanceof Date ? val.toISOString() : val;
  }
  return result;
}

async function ensureColorsRow() {
  const rows = await db.select().from(colorThemeTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(colorThemeTable).values({}).returning();
    return created;
  }
  return rows[0];
}

router.get("/colors", async (req, res): Promise<void> => {
  const colors = await ensureColorsRow();
  res.json(GetColorsResponse.parse(serializeDates(colors as Record<string, unknown>)));
});

router.patch("/colors", async (req, res): Promise<void> => {
  const parsed = UpdateColorsBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid colors body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await ensureColorsRow();

  const [updated] = await db
    .update(colorThemeTable)
    .set(parsed.data)
    .where(eq(colorThemeTable.id, existing.id))
    .returning();

  res.json(UpdateColorsResponse.parse(serializeDates(updated as Record<string, unknown>)));
});

export default router;
