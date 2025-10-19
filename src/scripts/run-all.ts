import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import { connectDB, disconnectDB } from "../db";
import { Brand, IBrand } from "../models/brand.schema";
import { Db } from "mongodb";

async function clearCollection(db: Db) {
  console.log('\n2/7: Clearing the "brands" collection...');
  await db.collection("brands").deleteMany({});
  console.log("Collection cleared.");
}

async function importDirtyData(db: Db) {
  console.log("\n3/7: Importing 10 dirty documents...");
  const initialDataPath = path.join(__dirname, "../../brands.json");
  const initialData = JSON.parse(fs.readFileSync(initialDataPath, "utf-8"));

  const processedData = initialData.map((doc: any) => ({
    ...doc,
    _id: new mongoose.Types.ObjectId(doc._id.$oid),
  }));

  await db.collection("brands").insertMany(processedData);
  console.log("Dirty data imported.");
}

async function transformData(db: Db) {
  console.log("\n4/7: Transforming 10 documents in-place...");
  const rawBrands = await db.collection("brands").find().toArray();
  let transformedCount = 0;

  for (const doc of rawBrands) {
    const transformed: any = {
      brandName: doc.brandName || doc.name,
      headquarters: doc.hqAddress || doc.mainOffice || "Unknown",
    };

    let year = parseInt(doc.yearFounded, 10) || parseInt(doc.established, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1600) year = 1600;
    if (year > currentYear) year = currentYear; // Corrects future years
    transformed.yearFounded = year;

    let locations =
      parseInt(doc.numberOfLocations, 10) || parseInt(doc.storeCount, 10);
    if (isNaN(locations) || locations < 1) locations = 1;
    transformed.numberOfLocations = locations;

    await Brand.updateOne(
      { _id: doc._id },
      { $set: transformed },
      { runValidators: true }
    );
    transformedCount++;
  }
  console.log(`${transformedCount} documents transformed.`);
}

async function seedNewData() {
  console.log("\n5/7: Seeding 10 new valid documents...");
  const newBrands: Partial<IBrand>[] = Array.from({ length: 10 }, () => ({
    brandName: faker.company.name(),
    yearFounded: faker.number.int({ min: 1980, max: new Date().getFullYear() }),
    headquarters: `${faker.location.city()}, ${faker.location.state({
      abbreviated: true,
    })}`,
    numberOfLocations: faker.number.int({ min: 1, max: 5000 }),
  }));

  await Brand.create(newBrands);
  console.log("10 new brands seeded.");
}

async function exportData() {
  console.log("\n6/7: Exporting all 20 documents...");
  const allBrands = await Brand.find().lean();
  const exportPath = path.join(__dirname, "../../brands-transformed.json");
  fs.writeFileSync(exportPath, JSON.stringify(allBrands, null, 2));
  console.log(`Export complete! File created at: ${exportPath}`);
}

const runAllTasks = async () => {
  try {
    // 1. Connect
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection is not established.");
    console.log("1/7: Successfully connected to MongoDB.");

    // 2. Clear
    await clearCollection(db);

    // 3. Import
    await importDirtyData(db);

    // 4. Transform
    await transformData(db);

    // 5. Seed
    await seedNewData();

    // 6. Export
    await exportData();
  } catch (error) {
    console.error("\nAn error occurred during the process:", error);
  } finally {
    // 7. Disconnect
    await disconnectDB();
    console.log("\n7/7: Disconnected from MongoDB.");
  }
};

runAllTasks();
