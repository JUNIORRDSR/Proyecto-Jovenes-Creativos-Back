import createHttpError from "http-errors";
import { Review } from "../models/review.model.js";
import { Game } from "../models/game.model.js";

function normalizeRating(value) {
  const ratingNumber = Number(value);
  if (Number.isNaN(ratingNumber)) {
    return 0;
  }
  return Math.min(5, Math.max(0, Number(ratingNumber.toFixed(1))));
}

function buildPagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limitRaw = Number(query.limit) || 20;
  const limit = Math.min(100, Math.max(1, limitRaw));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function listReviews(req, res) {
  const { page, limit, skip } = buildPagination(req.query);
  const [data, total] = await Promise.all([
    Review.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(),
  ]);

  res.status(200).json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}

export async function listReviewsByGame(req, res) {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = { gameId: req.params.gameId };
  const [data, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}

export async function getReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw createHttpError(404, "Review not found");
  }
  res.status(200).json(review);
}

export async function createReview(req, res) {
  const { gameId, gameName, review, rating, cover } = req.body;
  const game = await Game.findById(gameId);
  if (!game) {
    throw createHttpError(404, "Game not found for provided gameId");
  }

  const payload = {
    gameId: game._id,
    gameName: gameName?.trim() || game.name,
    review: review.trim(),
    rating: normalizeRating(rating),
    cover: cover || game.cover,
  };

  const created = await Review.create(payload);
  res.status(201).json(created);
}

export async function deleteReview(req, res) {
  const deleted = await Review.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw createHttpError(404, "Review not found");
  }
  res.status(204).send();
}
