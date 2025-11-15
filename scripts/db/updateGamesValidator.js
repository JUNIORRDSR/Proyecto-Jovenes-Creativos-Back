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

    const validator = {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "genre", "cover", "rating", "status", "hoursPlayed"],
        properties: {
          name: {
            bsonType: "string",
            minLength: 1,
            description: "Game title (required)",
          },
          genre: {
            bsonType: "string",
            minLength: 1,
            description: "Game genre (required)",
          },
          cover: {
            bsonType: "string",
            pattern:
              "^(https?:\\/\\/)([\\w-]+\\.)+[\\w-]+(?:\\/[\\w\\-.~:?#@!$&'()*+,;=%]*)*$",
            description: "Cover must be a valid URL",
          },
          rating: {
            bsonType: ["double", "int", "long"],
            minimum: 0,
            maximum: 5,
            description: "Rating between 0 and 5",
          },
          status: {
            bsonType: "string",
            minLength: 1,
            description: "Playback status (required)",
          },
          hoursPlayed: {
            bsonType: ["int", "long", "double"],
            minimum: 0,
            description: "Total hours played, integer >= 0",
          },
          createdAt: {
            bsonType: "date",
          },
          updatedAt: {
            bsonType: "date",
          },
        },
      },
    };

    await mongoose.connection.db.command({
      collMod: "games",
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });

    console.log("Updated games collection validator successfully");
  } catch (error) {
    console.error("Failed to update validator", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
