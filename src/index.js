import "express-async-errors";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import gamesRouter from "./routes/game.routes.js";
import reviewsRouter from "./routes/review.routes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/games", gamesRouter);
app.use("/api/reviews", reviewsRouter);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  connectDB(process.env.MONGODB_URI ?? "")
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server", error);
      process.exit(1);
    });
}
