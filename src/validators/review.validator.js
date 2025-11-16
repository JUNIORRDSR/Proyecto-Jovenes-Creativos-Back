import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const urlRegex =
  /^(https?:\/\/)([\w-]+\.)+[\w-]+(?:\/[\w\-.~:?#@!$&'()*+,;=%]*)*$/i;

const ratingSchema = z
  .coerce.number({ invalid_type_error: "rating must be a number" })
  .min(0, "rating must be between 0 and 5")
  .max(5, "rating must be between 0 and 5");

export const createReviewSchema = z.object({
  gameId: z
    .string()
    .regex(objectIdRegex, "gameId must be a valid ObjectId"),
  gameName: z.string().min(1, "gameName is required"),
  review: z.string().min(10, "review must be at least 10 characters").max(2000),
  rating: ratingSchema,
  cover: z.string().regex(urlRegex, "cover must be a valid URL").optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, "id must be a valid ObjectId"),
});

export const gameIdParamSchema = z.object({
  gameId: z.string().regex(objectIdRegex, "gameId must be a valid ObjectId"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
