import Like from "../models/Like.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

function handleLikeError(err, res) {
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message, details: err.errors });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Like already exists" });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
}

export async function toggleLike(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId).select("_id authorId");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await Like.findOne({ userId, postId });

    let liked = false;
    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await Like.create({ userId, postId });
      liked = true;
    }

    if (liked && String(post.authorId) !== String(userId)) {
      await Notification.create({
        userId: post.authorId,
        actorId: userId,
        type: "like",
        entityId: postId,
      });
    }

    const likesCount = await Like.countDocuments({ postId });

    return res.status(200).json({ liked, likesCount });
  } catch (err) {
    return handleLikeError(err, res);
  }
}
