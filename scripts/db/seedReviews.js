import mongoose from "mongoose";
import dotenv from "dotenv";
import { Game } from "../../src/models/game.model.js";
import { Review } from "../../src/models/review.model.js";

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

    const game = await Game.findOne();
    if (!game) {
      console.error("No games found. Create a game before seeding reviews.");
      process.exitCode = 1;
      return;
    }

    const review = await Review.create({
      gameId: game._id,
      gameName: game.name,
      review: "Impresionante experiencia de juego, recomendable al 100%.",
      rating: 4.5,
      cover: game.cover,
    });

    console.log(`Inserted sample review with id ${review.id}`);
  } catch (error) {
    console.error("Failed to seed review", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
