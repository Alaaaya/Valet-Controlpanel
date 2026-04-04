import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, contactInfoTable } from "@workspace/db";
import { GetContactResponse, UpdateContactBody, UpdateContactResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    result[key] = val instanceof Date ? val.toISOString() : val;
  }
  return result;
}

async function ensureContactRow() {
  const rows = await db.select().from(contactInfoTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(contactInfoTable).values({}).returning();
    return created;
  }
  return rows[0];
}

router.get("/contact", async (req, res): Promise<void> => {
  const contact = await ensureContactRow();
  res.json(GetContactResponse.parse(serializeDates(contact as Record<string, unknown>)));
});

router.patch("/contact", async (req, res): Promise<void> => {
  const parsed = UpdateContactBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid contact body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await ensureContactRow();

  const [updated] = await db
    .update(contactInfoTable)
    .set(parsed.data)
    .where(eq(contactInfoTable.id, existing.id))
    .returning();

  res.json(UpdateContactResponse.parse(serializeDates(updated as Record<string, unknown>)));
});

export default router;
