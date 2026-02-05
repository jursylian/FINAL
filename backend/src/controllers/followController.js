import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { handleError } from "../utils/errorHandler.js";
import { parsePagination } from "../utils/pagination.js";

export async function toggleFollow(req, res) {
  try {
    const targetId = req.params.id;
    const userId = req.userId;

    if (String(targetId) === String(userId)) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const target = await User.findById(targetId).select("_id");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await Follow.findOne({
      followerId: userId,
      followingId: targetId,
    });

    let following = false;

    if (existing) {
      await existing.deleteOne();
      following = false;
    } else {
      await Follow.create({ followerId: userId, followingId: targetId });
      following = true;
    }

    if (following) {
      await Notification.create({
        userId: targetId,
        actorId: userId,
        type: "follow",
        entityId: targetId,
      });
    }

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ followingId: targetId }),
      Follow.countDocuments({ followerId: targetId }),
    ]);

    return res.status(200).json({
      following,
      followersCount,
      followingCount,
    });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function listFollowers(req, res) {
  try {
    const userId = req.params.id;
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      Follow.find({ followingId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("followerId", "username avatar name"),
      Follow.countDocuments({ followingId: userId }),
    ]);

    const mapped = items.map((item) => item.followerId);
    return res.status(200).json({ items: mapped, page, limit, total });
  } catch (err) {
    return handleError(err, res);
  }
}

export async function listFollowing(req, res) {
  try {
    const userId = req.params.id;
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      Follow.find({ followerId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("followingId", "username avatar name"),
      Follow.countDocuments({ followerId: userId }),
    ]);

    const mapped = items.map((item) => item.followingId);
    return res.status(200).json({ items: mapped, page, limit, total });
  } catch (err) {
    return handleError(err, res);
  }
}
