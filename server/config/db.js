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

// ------------------------------------------------------------

// import mongoose from "mongoose";

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// const connectDB = async () => {
//   // If connection is ready, reuse it
//   if (cached.conn && mongoose.connection.readyState === 1) {
//     return cached.conn;
//   }

//   const uri = process.env.MONGODB_URI;

//   if (!uri) {
//     throw new Error("CRITICAL: MONGODB_URI environment variable is missing.");
//   }

//   // If a connection is already being established, wait for it
//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false, // Fail fast if disconnected instead of hanging
//       serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if Atlas is unreachable
//       socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
//     };

//     cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
//       console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
//       return mongooseInstance;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null; // Clear the failed promise so the next request can retry
//     cached.conn = null;
//     console.error("MongoDB Connection Error:", e);
//     throw e;
//   }

//   return cached.conn;
// };

// export default connectDB;