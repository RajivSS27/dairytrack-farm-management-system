import { Router, type IRouter } from "express";
import {
  and,
  asc,
  desc,
  eq,
  sql,
} from "drizzle-orm";
import {
  CreateFieldLogBody,
  CreateFieldLogResponse,
  CreateCctvCameraResponse,
  CreateCctvCameraBody,
  CheckoutFieldLogParams,
  CheckoutFieldLogResponse,
  GetFieldLogSummaryResponse,
  ListCctvCamerasResponse,
  ListFieldLogsResponse,
} from "@workspace/api-zod";
import {
  cctvCamerasTable,
  db,
  farmsTable,
  fieldLogsTable,
} from "@workspace/db";

const router: IRouter = Router();

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (value: Date | string) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

const fieldLogSelect = {
  id: fieldLogsTable.id,
  farmId: fieldLogsTable.farmId,
  farmName: farmsTable.farmerName,
  fieldWorkerName: fieldLogsTable.fieldWorkerName,
  logDate: fieldLogsTable.logDate,
  checkIn: fieldLogsTable.checkIn,
  checkOut: fieldLogsTable.checkOut,
  milkLiters: fieldLogsTable.milkLiters,
  gheeKg: fieldLogsTable.gheeKg,
  dahiKg: fieldLogsTable.dahiKg,
  notes: fieldLogsTable.notes,
  status: fieldLogsTable.status,
};

router.get("/field-logs", async (_req, res): Promise<void> => {
  const rows = await db
    .select(fieldLogSelect)
    .from(fieldLogsTable)
    .innerJoin(farmsTable, eq(fieldLogsTable.farmId, farmsTable.id))
    .orderBy(desc(fieldLogsTable.checkIn));

  res.json(ListFieldLogsResponse.parse(rows));
});

router.post("/field-logs", async (req, res): Promise<void> => {
  const parsed = CreateFieldLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(fieldLogsTable)
    .values({
      farmId: parsed.data.farmId,
      fieldWorkerName: parsed.data.fieldWorkerName,
      logDate: formatDate(parsed.data.logDate),
      milkLiters: parsed.data.milkLiters,
      gheeKg: parsed.data.gheeKg,
      dahiKg: parsed.data.dahiKg,
      notes: parsed.data.notes ?? "",
      status: "open",
    })
    .returning();

  const [row] = await db
    .select(fieldLogSelect)
    .from(fieldLogsTable)
    .innerJoin(farmsTable, eq(fieldLogsTable.farmId, farmsTable.id))
    .where(eq(fieldLogsTable.id, created.id));

  res.status(201).json(CreateFieldLogResponse.parse(row));
});

router.post("/field-logs/:id/checkout", async (req, res): Promise<void> => {
  const params = CheckoutFieldLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(fieldLogsTable)
    .set({ checkOut: new Date(), status: "closed" })
    .where(
      and(
        eq(fieldLogsTable.id, params.data.id),
        eq(fieldLogsTable.status, "open"),
      ),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Open field session not found" });
    return;
  }

  const [row] = await db
    .select(fieldLogSelect)
    .from(fieldLogsTable)
    .innerJoin(farmsTable, eq(fieldLogsTable.farmId, farmsTable.id))
    .where(eq(fieldLogsTable.id, updated.id));

  res.json(CheckoutFieldLogResponse.parse(row));
});

router.get("/field-logs/summary", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      milkLiters: sql<string>`coalesce(sum(${fieldLogsTable.milkLiters}), 0)`,
      gheeKg: sql<string>`coalesce(sum(${fieldLogsTable.gheeKg}), 0)`,
      dahiKg: sql<string>`coalesce(sum(${fieldLogsTable.dahiKg}), 0)`,
      activeSessions: sql<string>`count(*) filter (where ${fieldLogsTable.status} = 'open')`,
      completedLogs: sql<string>`count(*) filter (where ${fieldLogsTable.status} = 'closed')`,
    })
    .from(fieldLogsTable)
    .where(eq(fieldLogsTable.logDate, today()));

  const row = rows[0] ?? {
    milkLiters: "0",
    gheeKg: "0",
    dahiKg: "0",
    activeSessions: "0",
    completedLogs: "0",
  };
  res.json(
    GetFieldLogSummaryResponse.parse({
      milkLiters: Number(row.milkLiters),
      gheeKg: Number(row.gheeKg),
      dahiKg: Number(row.dahiKg),
      activeSessions: Number(row.activeSessions),
      completedLogs: Number(row.completedLogs),
    }),
  );
});

router.get("/cctv/cameras", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: cctvCamerasTable.id,
      farmId: cctvCamerasTable.farmId,
      farmName: farmsTable.farmerName,
      name: cctvCamerasTable.name,
      location: cctvCamerasTable.location,
      streamUrl: cctvCamerasTable.streamUrl,
      status: cctvCamerasTable.status,
      lastSeen: cctvCamerasTable.lastSeen,
    })
    .from(cctvCamerasTable)
    .innerJoin(farmsTable, eq(cctvCamerasTable.farmId, farmsTable.id))
    .orderBy(asc(farmsTable.farmerName), asc(cctvCamerasTable.name));

  res.json(ListCctvCamerasResponse.parse(rows));
});

router.post("/cctv/cameras", async (req, res): Promise<void> => {
  const parsed = CreateCctvCameraBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const streamUrl = parsed.data.streamUrl ?? null;
  const [created] = await db
    .insert(cctvCamerasTable)
    .values({
      farmId: parsed.data.farmId,
      name: parsed.data.name,
      location: parsed.data.location,
      streamUrl,
      status: streamUrl ? "online" : "not_connected",
      lastSeen: streamUrl ? new Date() : null,
    })
    .returning();

  const [row] = await db
    .select({
      id: cctvCamerasTable.id,
      farmId: cctvCamerasTable.farmId,
      farmName: farmsTable.farmerName,
      name: cctvCamerasTable.name,
      location: cctvCamerasTable.location,
      streamUrl: cctvCamerasTable.streamUrl,
      status: cctvCamerasTable.status,
      lastSeen: cctvCamerasTable.lastSeen,
    })
    .from(cctvCamerasTable)
    .innerJoin(farmsTable, eq(cctvCamerasTable.farmId, farmsTable.id))
    .where(eq(cctvCamerasTable.id, created.id));

  res.status(201).json(CreateCctvCameraResponse.parse(row));
});

export default router;