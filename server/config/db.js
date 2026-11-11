import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Changed to true so Mongoose safely buffers queries during connection establishment
      serverSelectionTimeoutMS: 5000,
    };

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Please define the MONGO_URI environment variable");
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connectDB;