import { db, pool } from "./index";
import { cctvCamerasTable, farmsTable, fieldLogsTable } from "./schema";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const daysAgo = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

async function seedFeatures() {
  const farms = await db
    .select({ id: farmsTable.id, farmerName: farmsTable.farmerName })
    .from(farmsTable)
    .orderBy(farmsTable.id);

  if (farms.length === 0) {
    throw new Error("Seed the core DairyTrack data before seeding feature data.");
  }

  const existingLogs = await db
    .select({ id: fieldLogsTable.id })
    .from(fieldLogsTable)
    .limit(1);
  if (existingLogs.length === 0) {
    await db.insert(fieldLogsTable).values([
      {
        farmId: farms[0].id,
        fieldWorkerName: "Arjun Deshmukh",
        logDate: formatDate(daysAgo(0)),
        checkIn: new Date(`${formatDate(daysAgo(0))}T05:45:00.000Z`),
        milkLiters: 58,
        gheeKg: 4.5,
        dahiKg: 18,
        notes: "Morning collection and dairy unit check.",
        status: "open",
      },
      {
        farmId: farms[1].id,
        fieldWorkerName: "Pooja Kale",
        logDate: formatDate(daysAgo(0)),
        checkIn: new Date(`${formatDate(daysAgo(0))}T06:10:00.000Z`),
        checkOut: new Date(`${formatDate(daysAgo(0))}T11:30:00.000Z`),
        milkLiters: 44.5,
        gheeKg: 3.2,
        dahiKg: 14,
        notes: "Completed the chilling room checklist.",
        status: "closed",
      },
      {
        farmId: farms[2].id,
        fieldWorkerName: "Vikram Pawar",
        logDate: formatDate(daysAgo(1)),
        checkIn: new Date(`${formatDate(daysAgo(1))}T06:00:00.000Z`),
        checkOut: new Date(`${formatDate(daysAgo(1))}T12:15:00.000Z`),
        milkLiters: 52,
        gheeKg: 3.8,
        dahiKg: 20,
        notes: "Checked feed stock before collection.",
        status: "closed",
      },
      {
        farmId: farms[3].id,
        fieldWorkerName: "Neha Jagtap",
        logDate: formatDate(daysAgo(2)),
        checkIn: new Date(`${formatDate(daysAgo(2))}T05:55:00.000Z`),
        checkOut: new Date(`${formatDate(daysAgo(2))}T11:45:00.000Z`),
        milkLiters: 47,
        gheeKg: 3.5,
        dahiKg: 16,
        notes: "All production readings within the expected range.",
        status: "closed",
      },
    ]);
  }

  const existingCameras = await db
    .select({ id: cctvCamerasTable.id })
    .from(cctvCamerasTable)
    .limit(1);
  if (existingCameras.length === 0) {
    await db.insert(cctvCamerasTable).values(
      farms.map((farm, index) => ({
        farmId: farm.id,
        name: `Farm ${index + 1} main view`,
        location: index % 2 === 0 ? "Milking shed" : "Collection room",
        streamUrl: null,
        status: "not_connected",
        lastSeen: null,
      })),
    );
  }

  console.info("DairyTrack field logs and CCTV camera slots are ready.");
}

seedFeatures()
  .catch((error) => {
    console.error("DairyTrack feature seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });