import { db, pool } from "./index";
import {
  batchesTable,
  collectionCentersTable,
  cowsTable,
  farmsTable,
  healthRecordsTable,
  milkCollectionsTable,
  ordersTable,
  processingPlantsTable,
  productsTable,
  supermarketsTable,
  usersTable,
  villagesTable,
} from "./schema";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const daysAgo = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

async function seed() {
  const existing = await db
    .select({ id: villagesTable.id })
    .from(villagesTable)
    .limit(1);

  if (existing.length > 0) {
    console.info("DairyTrack seed skipped: data already exists.");
    return;
  }

  const villages = await db
    .insert(villagesTable)
    .values([
      { name: "Sundarpur", district: "Nashik", state: "Maharashtra" },
      { name: "Devgaon", district: "Pune", state: "Maharashtra" },
      { name: "Haritwadi", district: "Satara", state: "Maharashtra" },
    ])
    .returning();

  const farms = await db
    .insert(farmsTable)
    .values([
      {
        villageId: villages[0].id,
        farmerName: "Ramesh Patil",
        phone: "+91 98765 40101",
        address: "Main road, Sundarpur",
      },
      {
        villageId: villages[0].id,
        farmerName: "Lata Shinde",
        phone: "+91 98765 40102",
        address: "Lake side, Sundarpur",
      },
      {
        villageId: villages[1].id,
        farmerName: "Suresh Jadhav",
        phone: "+91 98765 40103",
        address: "Temple lane, Devgaon",
      },
      {
        villageId: villages[1].id,
        farmerName: "Meena More",
        phone: "+91 98765 40104",
        address: "Canal road, Devgaon",
      },
      {
        villageId: villages[2].id,
        farmerName: "Anil Gaikwad",
        phone: "+91 98765 40105",
        address: "Market road, Haritwadi",
      },
    ])
    .returning();

  const breeds = ["Gir", "Sahiwal", "Jersey"];
  const cows = await db
    .insert(cowsTable)
    .values(
      farms.flatMap((farm, farmIndex) =>
        Array.from({ length: 3 }, (_, cowIndex) => ({
          farmId: farm.id,
          tagId: `DT-${String(farmIndex + 1).padStart(2, "0")}-${String(
            cowIndex + 1,
          ).padStart(2, "0")}`,
          breed: breeds[(farmIndex + cowIndex) % breeds.length],
          dateOfBirth: `202${(farmIndex + cowIndex) % 4}-0${
            (cowIndex % 8) + 1
          }-15`,
          lactationStatus:
            cowIndex === 2 && farmIndex === 3 ? "Dry period" : "In milk",
        })),
      ),
    )
    .returning();

  await db.insert(healthRecordsTable).values([
    {
      cowId: cows[1].id,
      visitDate: formatDate(daysAgo(4)),
      diagnosis: "Mild mineral deficiency",
      vetName: "Dr. Kavita Rao",
      notes: "Added mineral supplement to feed plan.",
      nextCheckupDate: formatDate(daysAgo(1)),
    },
    {
      cowId: cows[7].id,
      visitDate: formatDate(daysAgo(10)),
      diagnosis: "Routine wellness check",
      vetName: "Dr. Kavita Rao",
      notes: "Healthy and cleared for regular collection.",
      nextCheckupDate: formatDate(daysAgo(2)),
    },
    {
      cowId: cows[12].id,
      visitDate: formatDate(daysAgo(2)),
      diagnosis: "Routine wellness check",
      vetName: "Dr. Mahesh Kulkarni",
      notes: "No concerns reported.",
      nextCheckupDate: formatDate(daysAgo(-28)),
    },
  ]);

  const centers = await db
    .insert(collectionCentersTable)
    .values([
      {
        villageId: villages[0].id,
        name: "Sundarpur Milk Point",
        location: "Near the Gram Panchayat",
      },
      {
        villageId: villages[1].id,
        name: "Devgaon Chilling Center",
        location: "Old market yard",
      },
    ])
    .returning();

  const plants = await db
    .insert(processingPlantsTable)
    .values([
      {
        name: "Sahyadri Dairy Plant",
        location: "MIDC Industrial Area, Pune",
      },
    ])
    .returning();

  const collectionRows = [];
  for (let day = 6; day >= 0; day -= 1) {
    for (let farmIndex = 0; farmIndex < farms.length; farmIndex += 1) {
      collectionRows.push({
        farmId: farms[farmIndex].id,
        collectionCenterId: farmIndex < 2 ? centers[0].id : centers[1].id,
        collectedOn: new Date(
          `${formatDate(daysAgo(day))}T07:00:00.000Z`,
        ),
        quantityLiters: 32 + farmIndex * 5 + (6 - day) * 1.5,
        fatPercent: 3.8 + (farmIndex % 3) * 0.2,
        snfPercent: 8.4 + (farmIndex % 2) * 0.15,
      });
    }
  }
  const collections = await db
    .insert(milkCollectionsTable)
    .values(collectionRows)
    .returning();

  const batches = await db
    .insert(batchesTable)
    .values([
      {
        plantId: plants[0].id,
        collectionCenterId: centers[0].id,
        processedOn: formatDate(daysAgo(1)),
        totalLiters: 246.5,
        status: "ready",
      },
      {
        plantId: plants[0].id,
        collectionCenterId: centers[1].id,
        processedOn: formatDate(daysAgo(2)),
        totalLiters: 318.25,
        status: "sent",
        sentAt: new Date(`${formatDate(daysAgo(1))}T12:30:00.000Z`),
      },
    ])
    .returning();

  const products = await db
    .insert(productsTable)
    .values([
      {
        batchId: batches[0].id,
        sku: "SD-MILK-500",
        productType: "Toned milk 500ml",
        quantity: 420,
        manufactureDate: formatDate(daysAgo(1)),
        expiryDate: formatDate(daysAgo(-5)),
      },
      {
        batchId: batches[1].id,
        sku: "SD-CURD-400",
        productType: "Fresh curd 400g",
        quantity: 280,
        manufactureDate: formatDate(daysAgo(2)),
        expiryDate: formatDate(daysAgo(-10)),
      },
    ])
    .returning();

  const supermarkets = await db
    .insert(supermarketsTable)
    .values([
      { name: "Green Basket Kothrud", location: "Kothrud, Pune" },
      { name: "Daily Needs Baner", location: "Baner, Pune" },
      { name: "FreshMart Satara", location: "Rajwada, Satara" },
    ])
    .returning();

  await db.insert(ordersTable).values([
    {
      supermarketId: supermarkets[0].id,
      productId: products[0].id,
      quantity: 80,
      orderDate: formatDate(daysAgo(1)),
      status: "pending",
    },
    {
      supermarketId: supermarkets[1].id,
      productId: products[1].id,
      quantity: 45,
      orderDate: formatDate(daysAgo(2)),
      status: "pending",
    },
    {
      supermarketId: supermarkets[2].id,
      productId: products[0].id,
      quantity: 60,
      orderDate: formatDate(daysAgo(3)),
      status: "fulfilled",
    },
  ]);

  await db.insert(usersTable).values([
    {
      name: "DairyTrack Admin",
      email: "admin@dairytrack.demo",
      role: "admin",
    },
  ]);

  console.info(
    `DairyTrack seed complete: ${villages.length} villages, ${farms.length} farms, ${cows.length} cows, ${collections.length} milk collections.`,
  );
}

seed()
  .catch((error) => {
    console.error("DairyTrack seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });