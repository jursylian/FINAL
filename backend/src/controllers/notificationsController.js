import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import { handleError } from "../utils/errorHandler.js";

export async function listNotifications(req, res) {
  try {
    const userId = req.userId;
    const unread =
      typeof req.query.unread === "string"
        ? req.query.unread === "true"
        : undefined;

    const query = { userId };
    if (typeof unread === "boolean") {
      query.read = !unread ? { $in: [true, false] } : false;
    }

    let items = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("actorId", "username avatar name")
      .lean();

    const commentIds = items
      .filter(
        (item) =>
          (item.type === "comment" || item.type === "like_comment") &&
          item.entityId,
      )
      .map((item) => item.entityId);

    if (commentIds.length) {
      const comments = await Comment.find({ _id: { $in: commentIds } })
        .select("_id postId")
        .lean();
      const commentMap = new Map(
        comments.map((comment) => [String(comment._id), comment.postId]),
      );
      items = items.map((item) => {
        if (item.type === "comment" || item.type === "like_comment") {
          return {
            ...item,
            postId: commentMap.get(String(item.entityId)),
            commentId: item.entityId,
          };
        }
        if (item.type === "like") {
          return { ...item, postId: item.entityId };
        }
        return item;
      });
    } else {
      items = items.map((item) =>
        item.type === "like" ? { ...item, postId: item.entityId } : item,
      );
    }

    return res.status(200).json({ items });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function getUnreadCount(req, res) {
  try {
    const userId = req.userId;
    const count = await Notification.countDocuments({ userId, read: false });
    return res.status(200).json({ count });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function markNotificationRead(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId,
    }).populate("actorId", "username avatar name");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ notification });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function deleteNotification(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    console.log("[notifications] delete request", { userId, id });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const deleted = await Notification.findOneAndDelete({ _id: id, userId });

    console.log("[notifications] delete result", {
      userId,
      id,
      deletedCount: deleted ? 1 : 0,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ success: true, deletedId: id });
  } catch (err) {
    return handleError(err, res);
  }
}
