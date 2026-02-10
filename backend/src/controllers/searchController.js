import User from "../models/User.js";
import { handleError } from "../utils/errorHandler.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    if (!q) {
      const items = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.status(200).json({ items });
    }

    const escaped = escapeRegex(q);
    const startsWithRegex = new RegExp(`^${escaped}`, "i");
    const containsRegex = new RegExp(escaped, "i");

    const [startsWith, contains] = await Promise.all([
      User.find({
        $or: [
          { username: startsWithRegex },
          { name: startsWithRegex },
          { email: startsWithRegex },
        ],
      })
        .select("-password")
        .limit(limit),
      User.find({
        $or: [
          { username: containsRegex },
          { name: containsRegex },
          { email: containsRegex },
        ],
      })
        .select("-password")
        .limit(limit),
    ]);

    const seen = new Set();
    const items = [];
    for (const user of [...startsWith, ...contains]) {
      const id = user._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        items.push(user);
      }
    }

    return res.status(200).json({ items: items.slice(0, limit) });
  } catch (err) {
    return handleError(err, res);
  }
}
