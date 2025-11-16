import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  console.error("MONGODB_URI is not defined in your environment");
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(uri, {
      dbName: dbName && dbName.length ? dbName : undefined,
    });

    const db = mongoose.connection.db;

    const gameValidator = {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "genre", "cover", "rating", "status", "hoursPlayed"],
        properties: {
          name: { bsonType: "string", minLength: 1 },
          genre: { bsonType: "string", minLength: 1 },
          cover: {
            bsonType: "string",
            pattern:
              "^(https?:\\/\\/)([\\w-]+\\.)+[\\w-]+(?:\\/[\\w\\-.~:?#@!$&'()*+,;=%]*)*$",
          },
          rating: { bsonType: ["double", "int", "long"], minimum: 0, maximum: 5 },
          status: { bsonType: "string", minLength: 1 },
          hoursPlayed: { bsonType: ["int", "long", "double"], minimum: 0 },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };

    const reviewValidator = {
      $jsonSchema: {
        bsonType: "object",
        required: ["gameId", "gameName", "review", "rating"],
        properties: {
          gameId: { bsonType: "objectId" },
          gameName: { bsonType: "string", minLength: 1 },
          review: { bsonType: "string", minLength: 10, maxLength: 2000 },
          rating: { bsonType: ["double", "int", "long"], minimum: 0, maximum: 5 },
          cover: {
            bsonType: "string",
            pattern:
              "^(https?:\\/\\/)([\\w-]+\\.)+[\\w-]+(?:\\/[\\w\\-.~:?#@!$&'()*+,;=%]*)*$",
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };

    await upsertCollection(db, "games", gameValidator);
    await upsertCollection(db, "reviews", reviewValidator, async (collection) => {
      await collection.createIndex({ gameId: 1, createdAt: -1 });
    });

    console.log("Validators synced successfully");
  } catch (error) {
    console.error("Failed to update validator", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

async function upsertCollection(db, name, validator, onCollectionReady) {
  const exists = await db.listCollections({ name }).hasNext();
  if (!exists) {
    await db.createCollection(name, {
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`Created ${name} collection with validator`);
  } else {
    await db.command({
      collMod: name,
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`Updated ${name} collection validator`);
  }

  if (onCollectionReady) {
    const collection = db.collection(name);
    await onCollectionReady(collection);
  }
}

main();
