import { Schema, model } from "mongoose";

const gameSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    cover: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    status: { type: String, required: true, trim: true },
    hoursPlayed: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

export const Game = model("Game", gameSchema);
