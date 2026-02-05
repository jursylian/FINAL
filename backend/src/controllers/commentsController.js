import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { handleError } from "../utils/errorHandler.js";
import { parsePagination } from "../utils/pagination.js";

export async function createComment(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const text = String(req.body.text || "").trim();

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const post = await Post.findById(postId).select("_id authorId");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({ postId, userId, text });
    await comment.populate("userId", "username avatar name");

    if (String(post.authorId) !== String(userId)) {
      await Notification.create({
        userId: post.authorId,
        actorId: userId,
        type: "comment",
        entityId: comment._id,
      });
    }

    return res.status(201).json({ comment });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function listComments(req, res) {
  try {
    const postId = req.params.id;
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username avatar name"),
      Comment.countDocuments({ postId }),
    ]);

    return res.status(200).json({ items, page, limit, total });
  } catch (err) {
    return handleError(err, res);
  }
}
