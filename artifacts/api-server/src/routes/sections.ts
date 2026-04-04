import { Router, type IRouter } from "express";
import { db, sectionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  GetSectionsResponse,
  CreateSectionBody,
  ReorderSectionsBody,
  ReorderSectionsResponse,
  GetSectionParams,
  GetSectionResponse,
  UpdateSectionParams,
  UpdateSectionBody,
  UpdateSectionResponse,
  DeleteSectionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    result[key] = val instanceof Date ? val.toISOString() : val;
  }
  return result;
}

function serializeRows(rows: Record<string, unknown>[]) {
  return rows.map(serializeDates);
}

router.get("/sections", async (_req, res): Promise<void> => {
  const sections = await db
    .select()
    .from(sectionsTable)
    .orderBy(asc(sectionsTable.sortOrder));
  res.json(GetSectionsResponse.parse(serializeRows(sections as Record<string, unknown>[])));
});

router.post("/sections", async (req, res): Promise<void> => {
  const parsed = CreateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db.insert(sectionsTable).values(parsed.data).returning();
  res.status(201).json(GetSectionResponse.parse(serializeDates(section as Record<string, unknown>)));
});

router.patch("/sections/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderSectionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { orderedIds } = parsed.data;

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(sectionsTable)
        .set({ sortOrder: index })
        .where(eq(sectionsTable.id, id))
    )
  );

  const sections = await db
    .select()
    .from(sectionsTable)
    .orderBy(asc(sectionsTable.sortOrder));

  res.json(ReorderSectionsResponse.parse(serializeRows(sections as Record<string, unknown>[])));
});

router.get("/sections/:id", async (req, res): Promise<void> => {
  const params = GetSectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [section] = await db
    .select()
    .from(sectionsTable)
    .where(eq(sectionsTable.id, params.data.id));

  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.json(GetSectionResponse.parse(serializeDates(section as Record<string, unknown>)));
});

router.patch("/sections/:id", async (req, res): Promise<void> => {
  const params = UpdateSectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db
    .update(sectionsTable)
    .set(parsed.data)
    .where(eq(sectionsTable.id, params.data.id))
    .returning();

  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.json(UpdateSectionResponse.parse(serializeDates(section as Record<string, unknown>)));
});

router.delete("/sections/:id", async (req, res): Promise<void> => {
  const params = DeleteSectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [section] = await db
    .delete(sectionsTable)
    .where(eq(sectionsTable.id, params.data.id))
    .returning();

  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
