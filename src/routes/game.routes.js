import { Router } from "express";
import {
  createGame,
  deleteGame,
  getGameById,
  getGames,
  getGamesSummary,
  replaceGame,
  updateGame,
} from "../controllers/game.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createGameSchema,
  idParamSchema,
  patchGameSchema,
  sortQuerySchema,
  updateGameSchema,
} from "../validators/game.validator.js";

const router = Router();

router.get("/", validateRequest({ query: sortQuerySchema }), getGames);
router.get("/summary", getGamesSummary);
router.get("/:id", validateRequest({ params: idParamSchema }), getGameById);
router.post("/", validateRequest({ body: createGameSchema }), createGame);
router.put(
  "/:id",
  validateRequest({ params: idParamSchema, body: updateGameSchema }),
  replaceGame
);
router.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: patchGameSchema }),
  updateGame
);
router.delete("/:id", validateRequest({ params: idParamSchema }), deleteGame);

export default router;
