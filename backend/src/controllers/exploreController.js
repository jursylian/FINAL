import mongoose from "mongoose";
import Post from "../models/Post.js";
import Follow from "../models/Follow.js";

function toObjectId(value) {
  if (!value) {
    return null;
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
}

async function getFollowingIds(userId) {
  if (!userId) {
    return [];
  }
  const follows = await Follow.find({ followerId: userId })
    .select("followingId")
    .lean();
  return follows.map((item) => item.followingId);
}

export async function listExplorePosts(req, res) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30));
    const currentUserId = toObjectId(req.userId);
    const followingIds = await getFollowingIds(req.userId);
    const excludedIds = currentUserId
      ? [...followingIds, currentUserId]
      : [];
    const match = excludedIds.length
      ? { authorId: { $nin: excludedIds } } // Explore: exclude following + me
      : null;

    const pipeline = [
      ...(match ? [{ $match: match }] : []),
      { $sample: { size: limit } },
    ];
    const items = await Post.aggregate(pipeline);
    const populated = await Post.populate(items, {
      path: "authorId",
      select: "username avatar",
    });

    return res.status(200).json({ items: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
