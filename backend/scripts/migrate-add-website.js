import mongoose from "mongoose";
import User from "../src/models/User.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ichgramm";

async function main() {
  await mongoose.connect(MONGO_URI);

  const result = await User.updateMany(
    { website: { $exists: false } },
    { $set: { website: "" } },
  );

  console.log("Migration complete.");
  console.log({
    matched: result.matchedCount ?? result.n ?? 0,
    modified: result.modifiedCount ?? result.nModified ?? 0,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
