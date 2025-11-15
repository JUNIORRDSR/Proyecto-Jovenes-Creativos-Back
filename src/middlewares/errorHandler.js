import mongoose from "mongoose";

export function notFound(_req, res) {
  res.status(404).json({ message: "Resource not found" });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid identifier provided" });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = err.statusCode ?? 500;
  const responseBody = {
    message: err.message || "Internal server error",
  };

  console.error(err);
  res.status(statusCode).json(responseBody);
}
