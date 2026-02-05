import Post from "../models/Post.js";
import { handleError } from "../utils/errorHandler.js";
import { toObjectId } from "../utils/objectId.js";
import { getFollowingIds } from "../utils/followingIds.js";

export async function listExplorePosts(req, res) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30));
    const currentUserId = toObjectId(req.userId);
    const followingIds = await getFollowingIds(req.userId);
    const excludedIds = currentUserId
      ? [...followingIds, currentUserId]
      : [];
    const match = excludedIds.length
      ? { authorId: { $nin: excludedIds } }
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
    return handleError(err, res);
  }
}
