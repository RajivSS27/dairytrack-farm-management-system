import { createInsertSchema } from "drizzle-zod";
import {
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const villagesTable = pgTable("villages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull(),
});

export const farmsTable = pgTable("farms", {
  id: serial("id").primaryKey(),
  villageId: integer("village_id")
    .notNull()
    .references(() => villagesTable.id),
  farmerName: text("farmer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
});

export const cowsTable = pgTable("cows", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id")
    .notNull()
    .references(() => farmsTable.id),
  tagId: text("tag_id").notNull().unique(),
  breed: text("breed").notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
  lactationStatus: text("lactation_status").notNull(),
});

export const healthRecordsTable = pgTable("health_records", {
  id: serial("id").primaryKey(),
  cowId: integer("cow_id")
    .notNull()
    .references(() => cowsTable.id),
  visitDate: date("visit_date", { mode: "string" }).notNull(),
  diagnosis: text("diagnosis").notNull(),
  vetName: text("vet_name").notNull(),
  notes: text("notes").notNull(),
  nextCheckupDate: date("next_checkup_date", { mode: "string" }),
});

export const collectionCentersTable = pgTable("collection_centers", {
  id: serial("id").primaryKey(),
  villageId: integer("village_id")
    .notNull()
    .references(() => villagesTable.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const milkCollectionsTable = pgTable("milk_collections", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id")
    .notNull()
    .references(() => farmsTable.id),
  collectionCenterId: integer("collection_center_id")
    .notNull()
    .references(() => collectionCentersTable.id),
  collectedOn: timestamp("collected_on", { withTimezone: true })
    .notNull()
    .defaultNow(),
  quantityLiters: numeric("quantity_liters", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  fatPercent: numeric("fat_percent", {
    precision: 5,
    scale: 2,
    mode: "number",
  }).notNull(),
  snfPercent: numeric("snf_percent", {
    precision: 5,
    scale: 2,
    mode: "number",
  }).notNull(),
});

export const fieldLogsTable = pgTable("field_logs", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id")
    .notNull()
    .references(() => farmsTable.id),
  fieldWorkerName: text("field_worker_name").notNull(),
  logDate: date("log_date", { mode: "string" }).notNull(),
  checkIn: timestamp("check_in", { withTimezone: true })
    .notNull()
    .defaultNow(),
  checkOut: timestamp("check_out", { withTimezone: true }),
  milkLiters: numeric("milk_liters", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  gheeKg: numeric("ghee_kg", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  dahiKg: numeric("dahi_kg", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("open"),
});

export const cctvCamerasTable = pgTable("cctv_cameras", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id")
    .notNull()
    .references(() => farmsTable.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  streamUrl: text("stream_url"),
  status: text("status").notNull().default("not_connected"),
  lastSeen: timestamp("last_seen", { withTimezone: true }),
});

export const processingPlantsTable = pgTable("processing_plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const batchesTable = pgTable("batches", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id")
    .notNull()
    .references(() => processingPlantsTable.id),
  collectionCenterId: integer("collection_center_id")
    .notNull()
    .references(() => collectionCentersTable.id),
  processedOn: date("processed_on", { mode: "string" }).notNull(),
  totalLiters: numeric("total_liters", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  status: text("status").notNull().default("ready"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batchesTable.id),
  sku: text("sku").notNull().unique(),
  productType: text("product_type").notNull(),
  quantity: numeric("quantity", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  manufactureDate: date("manufacture_date", { mode: "string" }).notNull(),
  expiryDate: date("expiry_date", { mode: "string" }).notNull(),
});

export const supermarketsTable = pgTable("supermarkets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  supermarketId: integer("supermarket_id")
    .notNull()
    .references(() => supermarketsTable.id),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  quantity: numeric("quantity", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  orderDate: date("order_date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("pending"),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull(),
  linkedEntityId: integer("linked_entity_id"),
});

export const insertVillageSchema = createInsertSchema(villagesTable).omit({
  id: true,
});
export type InsertVillage = z.infer<typeof insertVillageSchema>;
export type Village = typeof villagesTable.$inferSelect;

export const insertFarmSchema = createInsertSchema(farmsTable).omit({
  id: true,
});
export type InsertFarm = z.infer<typeof insertFarmSchema>;
export type Farm = typeof farmsTable.$inferSelect;

export const insertCowSchema = createInsertSchema(cowsTable).omit({
  id: true,
});
export type InsertCow = z.infer<typeof insertCowSchema>;
export type Cow = typeof cowsTable.$inferSelect;

export const insertHealthRecordSchema = createInsertSchema(healthRecordsTable).omit({
  id: true,
});
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecordsTable.$inferSelect;

export const insertCollectionCenterSchema = createInsertSchema(
  collectionCentersTable,
).omit({ id: true });
export type InsertCollectionCenter = z.infer<typeof insertCollectionCenterSchema>;
export type CollectionCenter = typeof collectionCentersTable.$inferSelect;

export const insertMilkCollectionSchema = createInsertSchema(
  milkCollectionsTable,
).omit({ id: true });
export type InsertMilkCollection = z.infer<typeof insertMilkCollectionSchema>;
export type MilkCollection = typeof milkCollectionsTable.$inferSelect;

export const insertFieldLogSchema = createInsertSchema(fieldLogsTable).omit({
  id: true,
});
export type InsertFieldLog = z.infer<typeof insertFieldLogSchema>;
export type FieldLog = typeof fieldLogsTable.$inferSelect;

export const insertCctvCameraSchema = createInsertSchema(cctvCamerasTable).omit({
  id: true,
});
export type InsertCctvCamera = z.infer<typeof insertCctvCameraSchema>;
export type CctvCamera = typeof cctvCamerasTable.$inferSelect;

export const insertProcessingPlantSchema = createInsertSchema(
  processingPlantsTable,
).omit({ id: true });
export type InsertProcessingPlant = z.infer<typeof insertProcessingPlantSchema>;
export type ProcessingPlant = typeof processingPlantsTable.$inferSelect;

export const insertBatchSchema = createInsertSchema(batchesTable).omit({
  id: true,
});
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batchesTable.$inferSelect;

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const insertSupermarketSchema = createInsertSchema(supermarketsTable).omit({
  id: true,
});
export type InsertSupermarket = z.infer<typeof insertSupermarketSchema>;
export type Supermarket = typeof supermarketsTable.$inferSelect;

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;