import User from "../models/User.js";
import Post from "../models/Post.js";
import Follow from "../models/Follow.js";
import { toPublicUser } from "../utils/publicUser.js";
import { handleError } from "../utils/errorHandler.js";
import { parsePagination } from "../utils/pagination.js";

function isOwner(req, userId) {
  return String(req.userId) === String(userId);
}

function handleUserError(err, res) {
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Email or username already in use" });
  }
  return handleError(err, res);
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userObj = user.toObject();
    const ownerCheck = String(req.userId || "") === String(user._id);
    if (!ownerCheck) {
      delete userObj.email;
    }

    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ authorId: user._id }),
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
    ]);
    const isFollowing =
      !ownerCheck && req.userId
        ? Boolean(
            await Follow.exists({
              followerId: req.userId,
              followingId: user._id,
            })
          )
        : false;

    return res.status(200).json({
      user: userObj,
      stats: {
        posts: postsCount,
        followers: followersCount,
        following: followingCount,
        isFollowing,
      },
    });
  } catch (err) {
    return handleUserError(err, res);
  }
}

export async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    if (!isOwner(req, id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedFields = ["name", "bio", "username", "email", "website"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.set(updates);
    await user.save();

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    return handleUserError(err, res);
  }
}

export async function updateAvatar(req, res) {
  try {
    const { id } = req.params;
    if (!isOwner(req, id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const mimeType = req.file.mimetype || "image/jpeg";
    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = dataUrl;
    await user.save();

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    return handleUserError(err, res);
  }
}

export async function listUserPosts(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10);
    const userId = req.params.id;

    const [items, total] = await Promise.all([
      Post.find({ authorId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "username avatar"),
      Post.countDocuments({ authorId: userId }),
    ]);

    return res.status(200).json({ items, page, limit, total });
  } catch (err) {
    return handleUserError(err, res);
  }
}
