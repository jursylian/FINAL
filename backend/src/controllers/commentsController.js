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
    const commentObj = comment.toObject();

    if (String(post.authorId) !== String(userId)) {
      await Notification.create({
        userId: post.authorId,
        actorId: userId,
        type: "comment",
        entityId: comment._id,
      });
    }

    return res.status(201).json({
      comment: {
        ...commentObj,
        likesCount: commentObj.likes?.length || 0,
        likedByMe: false,
      },
    });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function listComments(req, res) {
  try {
    const postId = req.params.id;
    const { page, limit, skip } = parsePagination(req.query);
    const userId = req.userId;

    const [items, total] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username avatar name"),
      Comment.countDocuments({ postId }),
    ]);

    const mapped = items.map((comment) => {
      const obj = comment.toObject();
      const likes = Array.isArray(obj.likes) ? obj.likes : [];
      const likedByMe = userId
        ? likes.some((id) => String(id) === String(userId))
        : false;
      return {
        ...obj,
        likesCount: likes.length,
        likedByMe,
      };
    });

    return res.status(200).json({ items: mapped, page, limit, total });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function toggleCommentLike(req, res) {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;

    const comment = await Comment.findById(commentId).populate(
      "userId",
      "username avatar name",
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.some(
      (id) => String(id) === String(userId),
    );
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (id) => String(id) !== String(userId),
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    const isOwnComment =
      String(comment.userId?._id || comment.userId) === String(userId);
    if (!alreadyLiked && !isOwnComment) {
      const exists = await Notification.exists({
        userId: comment.userId,
        actorId: userId,
        type: "like_comment",
        entityId: comment._id,
      });
      if (!exists) {
        await Notification.create({
          userId: comment.userId,
          actorId: userId,
          type: "like_comment",
          entityId: comment._id,
        });
      }
    }
    if (alreadyLiked) {
      await Notification.findOneAndDelete({
        userId: comment.userId,
        actorId: userId,
        type: "like_comment",
        entityId: comment._id,
      });
    }
    const obj = comment.toObject();

    return res.status(200).json({
      comment: {
        ...obj,
        likesCount: obj.likes?.length || 0,
        likedByMe: !alreadyLiked,
      },
    });
  } catch (err) {
    return handleError(err, res);
  }
}
