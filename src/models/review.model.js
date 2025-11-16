import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    gameName: { type: String, required: true, trim: true },
    review: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    cover: { type: String, trim: true },
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

reviewSchema.index({ gameId: 1, createdAt: -1 });

export const Review = model("Review", reviewSchema);
