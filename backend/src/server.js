import "dotenv/config";

import app from "./app.js";
import { connectDb } from "./utils/db.js";


const PORT = process.env.PORT || 4000;

connectDb(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
