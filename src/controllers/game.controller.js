import createHttpError from "http-errors";
import { Game } from "../models/game.model.js";

function normalizePayload(payload) {
  const normalized = { ...payload };

  if (normalized.rating !== undefined) {
    const ratingNumber = Number(normalized.rating);
    if (!Number.isNaN(ratingNumber)) {
      normalized.rating = Math.min(5, Math.max(0, Number(ratingNumber.toFixed(1))));
    }
  }

  if (normalized.hoursPlayed !== undefined) {
    const hoursNumber = Number(normalized.hoursPlayed);
    if (!Number.isNaN(hoursNumber)) {
      normalized.hoursPlayed = Math.max(0, Math.trunc(hoursNumber));
    }
  }

  return normalized;
}

export async function getGames(req, res) {
  const sortField = req.query.sort ?? "createdAt";
  const games = await Game.find().sort({ [sortField]: 1 });
  res.status(200).json(games);
}

export async function getGameById(req, res) {
  const game = await Game.findById(req.params.id);
  if (!game) {
    throw createHttpError(404, "Game not found");
  }
  res.status(200).json(game);
}

export async function createGame(req, res) {
  const created = await Game.create(normalizePayload(req.body));
  res.status(201).json(created);
}

export async function replaceGame(req, res) {
  const updated = await Game.findByIdAndUpdate(req.params.id, normalizePayload(req.body), {
    new: true,
    runValidators: true,
    overwrite: true,
  });

  if (!updated) {
    throw createHttpError(404, "Game not found");
  }

  res.status(200).json(updated);
}

export async function updateGame(req, res) {
  const updated = await Game.findByIdAndUpdate(req.params.id, normalizePayload(req.body), {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw createHttpError(404, "Game not found");
  }

  res.status(200).json(updated);
}

export async function deleteGame(req, res) {
  const deleted = await Game.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw createHttpError(404, "Game not found");
  }
  res.status(204).send();
}

export async function getGamesSummary(_req, res) {
  const [statusStats, totals] = await Promise.all([
    Game.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          hoursPlayed: { $sum: "$hoursPlayed" },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          hoursPlayed: 1,
        },
      },
    ]),
    Game.aggregate([
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          totalHoursPlayed: { $sum: "$hoursPlayed" },
          ratingAverage: { $avg: "$rating" },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  res.status(200).json({
    breakdown: statusStats,
    totals: totals[0] ?? {
      totalGames: 0,
      totalHoursPlayed: 0,
      ratingAverage: 0,
    },
  });
}
