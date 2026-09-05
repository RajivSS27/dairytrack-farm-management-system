import { Router, type IRouter } from "express";
import {
  and,
  asc,
  eq,
  gte,
  isNotNull,
  lte,
  sql,
} from "drizzle-orm";
import {
  batchesTable,
  collectionCentersTable,
  cowsTable,
  db,
  farmsTable,
  healthRecordsTable,
  milkCollectionsTable,
  ordersTable,
  processingPlantsTable,
  supermarketsTable,
  villagesTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetMilkVolumeTrendResponse,
  ListCollectionCentersResponse,
  ListCowsResponse,
  ListFarmsResponse,
  ListProcessingPlantsResponse,
  ListSupermarketsResponse,
  ListVillagesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const startOfToday = () => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = startOfToday();
  const [
    villageCount,
    farmCount,
    cowCount,
    healthAlertCount,
    milkToday,
    pendingOrderCount,
  ] = await Promise.all([
    db.select({ count: sql<string>`count(*)` }).from(villagesTable),
    db.select({ count: sql<string>`count(*)` }).from(farmsTable),
    db.select({ count: sql<string>`count(*)` }).from(cowsTable),
    db
      .select({ count: sql<string>`count(*)` })
      .from(healthRecordsTable)
      .where(
        and(
          isNotNull(healthRecordsTable.nextCheckupDate),
          lte(healthRecordsTable.nextCheckupDate, formatDate(today)),
        ),
      ),
    db
      .select({
        liters: sql<string>`coalesce(sum(${milkCollectionsTable.quantityLiters}), 0)`,
      })
      .from(milkCollectionsTable)
      .where(gte(milkCollectionsTable.collectedOn, today)),
    db
      .select({ count: sql<string>`count(*)` })
      .from(ordersTable)
      .where(eq(ordersTable.status, "pending")),
  ]);

  const data = GetDashboardSummaryResponse.parse({
    villages: Number(villageCount[0]?.count ?? 0),
    farms: Number(farmCount[0]?.count ?? 0),
    cows: Number(cowCount[0]?.count ?? 0),
    activeHealthAlerts: Number(healthAlertCount[0]?.count ?? 0),
    milkCollectedToday: Number(milkToday[0]?.liters ?? 0),
    pendingOrders: Number(pendingOrderCount[0]?.count ?? 0),
  });

  res.json(data);
});

router.get("/dashboard/milk-volume", async (_req, res): Promise<void> => {
  const start = startOfToday();
  start.setUTCDate(start.getUTCDate() - 6);

  const rows = await db
    .select({
      date: sql<string>`${milkCollectionsTable.collectedOn}::date`,
      liters: sql<string>`coalesce(sum(${milkCollectionsTable.quantityLiters}), 0)`,
    })
    .from(milkCollectionsTable)
    .where(gte(milkCollectionsTable.collectedOn, start))
    .groupBy(sql`${milkCollectionsTable.collectedOn}::date`)
    .orderBy(asc(sql`${milkCollectionsTable.collectedOn}::date`));

  const byDate = new Map(rows.map((row) => [row.date, Number(row.liters)]));
  const data = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = formatDate(date);
    return { date: key, liters: byDate.get(key) ?? 0 };
  });

  res.json(GetMilkVolumeTrendResponse.parse(data));
});

router.get("/villages", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: villagesTable.id,
      name: villagesTable.name,
      district: villagesTable.district,
      state: villagesTable.state,
    })
    .from(villagesTable)
    .orderBy(asc(villagesTable.name));

  res.json(ListVillagesResponse.parse(rows));
});

router.get("/farms", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: farmsTable.id,
      villageId: farmsTable.villageId,
      villageName: villagesTable.name,
      farmerName: farmsTable.farmerName,
      phone: farmsTable.phone,
      address: farmsTable.address,
      cowCount: sql<string>`count(${cowsTable.id})`,
    })
    .from(farmsTable)
    .innerJoin(villagesTable, eq(farmsTable.villageId, villagesTable.id))
    .leftJoin(cowsTable, eq(cowsTable.farmId, farmsTable.id))
    .groupBy(
      farmsTable.id,
      farmsTable.villageId,
      villagesTable.name,
      farmsTable.farmerName,
      farmsTable.phone,
      farmsTable.address,
    )
    .orderBy(asc(farmsTable.farmerName));

  res.json(
    ListFarmsResponse.parse(
      rows.map((row) => ({ ...row, cowCount: Number(row.cowCount) })),
    ),
  );
});

router.get("/cows", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: cowsTable.id,
      farmId: cowsTable.farmId,
      farmName: farmsTable.farmerName,
      tagId: cowsTable.tagId,
      breed: cowsTable.breed,
      dateOfBirth: cowsTable.dateOfBirth,
      lactationStatus: cowsTable.lactationStatus,
    })
    .from(cowsTable)
    .innerJoin(farmsTable, eq(cowsTable.farmId, farmsTable.id))
    .orderBy(asc(cowsTable.tagId));

  res.json(ListCowsResponse.parse(rows));
});

router.get("/collection-centers", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: collectionCentersTable.id,
      villageId: collectionCentersTable.villageId,
      villageName: villagesTable.name,
      name: collectionCentersTable.name,
      location: collectionCentersTable.location,
      farmCount: sql<string>`count(distinct ${milkCollectionsTable.farmId})`,
    })
    .from(collectionCentersTable)
    .innerJoin(
      villagesTable,
      eq(collectionCentersTable.villageId, villagesTable.id),
    )
    .leftJoin(
      milkCollectionsTable,
      eq(
        milkCollectionsTable.collectionCenterId,
        collectionCentersTable.id,
      ),
    )
    .groupBy(
      collectionCentersTable.id,
      collectionCentersTable.villageId,
      villagesTable.name,
      collectionCentersTable.name,
      collectionCentersTable.location,
    )
    .orderBy(asc(collectionCentersTable.name));

  res.json(
    ListCollectionCentersResponse.parse(
      rows.map((row) => ({ ...row, farmCount: Number(row.farmCount) })),
    ),
  );
});

router.get("/processing-plants", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: processingPlantsTable.id,
      name: processingPlantsTable.name,
      location: processingPlantsTable.location,
      batchCount: sql<string>`count(${batchesTable.id})`,
    })
    .from(processingPlantsTable)
    .leftJoin(batchesTable, eq(batchesTable.plantId, processingPlantsTable.id))
    .groupBy(
      processingPlantsTable.id,
      processingPlantsTable.name,
      processingPlantsTable.location,
    )
    .orderBy(asc(processingPlantsTable.name));

  res.json(
    ListProcessingPlantsResponse.parse(
      rows.map((row) => ({ ...row, batchCount: Number(row.batchCount) })),
    ),
  );
});

router.get("/supermarkets", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: supermarketsTable.id,
      name: supermarketsTable.name,
      location: supermarketsTable.location,
      orderCount: sql<string>`count(${ordersTable.id})`,
    })
    .from(supermarketsTable)
    .leftJoin(ordersTable, eq(ordersTable.supermarketId, supermarketsTable.id))
    .groupBy(
      supermarketsTable.id,
      supermarketsTable.name,
      supermarketsTable.location,
    )
    .orderBy(asc(supermarketsTable.name));

  res.json(
    ListSupermarketsResponse.parse(
      rows.map((row) => ({ ...row, orderCount: Number(row.orderCount) })),
    ),
  );
});

export default router;