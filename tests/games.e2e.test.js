import request from "supertest";
import mongoose from "mongoose";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/index.js";
import { Game } from "../src/models/game.model.js";

const baseGame = {
  name: "Cyberpunk 2077",
  genre: "Acción",
  cover: "https://cdn.example.com/cyberpunk.webp",
  rating: 4.5,
  status: "Jugando",
  hoursPlayed: 45,
};

describe("Games API", () => {
  beforeEach(async () => {
    await Game.deleteMany({});
  });

  it("creates and lists games", async () => {
    const createRes = await request(app).post("/api/games").send(baseGame);
    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject({
      name: baseGame.name,
      genre: baseGame.genre,
      rating: baseGame.rating,
      status: baseGame.status,
      hoursPlayed: baseGame.hoursPlayed,
    });
    expect(createRes.body).toHaveProperty("id");

    const listRes = await request(app).get("/api/games");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].name).toBe(baseGame.name);
  });

  it("returns 404 when game does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/games/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it("updates a game and normalizes rating", async () => {
    const { body: created } = await request(app).post("/api/games").send(baseGame);

    const patchRes = await request(app)
      .patch(`/api/games/${created.id}`)
      .send({ rating: 3.678, status: "Completado" });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.rating).toBe(3.7);
    expect(patchRes.body.status).toBe("Completado");
  });

  it("builds summary grouped by status", async () => {
    await Promise.all([
      request(app).post("/api/games").send(baseGame),
      request(app)
        .post("/api/games")
        .send({ ...baseGame, name: "Hades", status: "Pendiente", rating: 5, hoursPlayed: 0 }),
    ]);

    const res = await request(app).get("/api/games/summary");
    expect(res.status).toBe(200);
    expect(res.body.totals.totalGames).toBe(2);
    expect(res.body.breakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: "Jugando", count: 1 }),
        expect.objectContaining({ status: "Pendiente", count: 1 }),
      ])
    );
  });
});
