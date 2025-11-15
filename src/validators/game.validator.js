import { z } from "zod";

const urlRegex =
  /^(https?:\/\/)([\w-]+\.)+[\w-]+(?:\/[\w\-.~:?#@!$&'()*+,;=%]*)*$/i;

const baseGameSchema = z.object({
  name: z.string().min(1, "name is required"),
  genre: z.string().min(1, "genre is required"),
  cover: z.string().regex(urlRegex, "cover must be a valid URL"),
  rating: z
    .coerce.number({ invalid_type_error: "rating must be a number" })
    .min(0, "rating must be between 0 and 5")
    .max(5, "rating must be between 0 and 5"),
  status: z.string().min(1, "status is required"),
  hoursPlayed: z
    .coerce.number({ invalid_type_error: "hoursPlayed must be a number" })
    .int("hoursPlayed must be an integer")
    .min(0, "hoursPlayed must be greater or equal to 0"),
});

export const createGameSchema = baseGameSchema;
export const updateGameSchema = baseGameSchema;
export const patchGameSchema = baseGameSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided",
  }
);

export const idParamSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const sortQuerySchema = z.object({
  sort: z.enum(["createdAt", "updatedAt"]).optional(),
});
