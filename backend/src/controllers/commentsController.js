import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function handleCommentError(err, res) {
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message, details: err.errors });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
}

export async function createComment(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const text = String(req.body.text || "").trim();

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const post = await Post.findById(postId).select("_id");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({ postId, userId, text });
    await comment.populate("userId", "username avatar name");

    return res.status(201).json({ comment });
  } catch (err) {
    return handleCommentError(err, res);
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
    return handleCommentError(err, res);
  }
}
