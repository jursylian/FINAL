import mongoose from "mongoose";
import User from "../src/models/User.js";

const MONGO_URI = "mongodb://localhost:27017/posts_db";
const USER_ID = "69778012165947a2fa2c1719";
const USERNAME = "ichgramm";
const NAME = "ichgramm user";

async function main() {
  await mongoose.connect(MONGO_URI);

  const user = await User.findById(USER_ID);
  if (!user) {
    throw new Error("User not found");
  }

  user.username = USERNAME;
  user.name = NAME;
  await user.save();

  console.log("Updated user:");
  console.log({ _id: String(user._id), username: user.username, name: user.name });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
