import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PayCart API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

// 04bhaskarbiswas_db_user
// NNlgoOg5QG9aUsFQ
// mongodb+srv://04bhaskarbiswas_db_user:NNlgoOg5QG9aUsFQ@cluster0.thy2qaw.mongodb.net/
