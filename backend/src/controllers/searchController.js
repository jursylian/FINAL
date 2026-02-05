import User from "../models/User.js";
import { handleError } from "../utils/errorHandler.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    let query = {};
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      query = { $or: [{ username: regex }, { name: regex }] };
    }

    const items = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ items });
  } catch (err) {
    return handleError(err, res);
  }
}
