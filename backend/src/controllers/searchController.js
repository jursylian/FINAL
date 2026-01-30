import User from "../models/User.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const regex = new RegExp(escapeRegex(q), "i");

    const items = await User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select("-password")
      .limit(limit);

    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
