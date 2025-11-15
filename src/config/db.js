import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    const dbName = process.env.MONGODB_DB?.trim();
    const connection = await mongoose.connect(uri, {
      autoIndex: true,
      dbName: dbName?.length ? dbName : undefined,
    });

    const { host, name } = connection.connection;
    console.log(`Mongo connected: ${host}/${name}`);
    return connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
