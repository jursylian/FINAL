import Notification from "../src/models/Notification.js";
import { connectDb } from "../src/utils/db.js";

async function run() {
  const uri = process.env.MONGO_URI;
  await connectDb(uri);

  const result = await Notification.deleteMany({ read: true });
  console.log(`Deleted: ${result.deletedCount}`);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
