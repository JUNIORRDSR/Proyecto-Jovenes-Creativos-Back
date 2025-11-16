import { Router } from "express";
import {
  createReview,
  deleteReview,
  getReview,
  listReviews,
  listReviewsByGame,
} from "../controllers/review.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createReviewSchema,
  gameIdParamSchema,
  idParamSchema,
  paginationQuerySchema,
} from "../validators/review.validator.js";

const router = Router();

router.get("/", validateRequest({ query: paginationQuerySchema }), listReviews);
router.get(
  "/game/:gameId",
  validateRequest({ params: gameIdParamSchema, query: paginationQuerySchema }),
  listReviewsByGame
);
router.get("/:id", validateRequest({ params: idParamSchema }), getReview);
router.post("/", validateRequest({ body: createReviewSchema }), createReview);
router.delete("/:id", validateRequest({ params: idParamSchema }), deleteReview);

export default router;
