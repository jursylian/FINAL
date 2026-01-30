import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

function handlePostError(err, res) {
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message, details: err.errors });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
}

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

export async function createPost(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const mimeType = req.file.mimetype || "image/jpeg";
    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const caption = req.body.caption ? String(req.body.caption) : undefined;

    const post = await Post.create({
      authorId: req.userId,
      image: dataUrl,
      caption,
    });

    return res.status(201).json({ post });
  } catch (err) {
    return handlePostError(err, res);
  }
}

export async function listFeed(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const itcareer = await User.findOne({ username: "itcareerhub" })
      .select("_id")
      .lean();
    const excludeMatch = itcareer?._id
      ? { authorId: { $ne: itcareer._id } }
      : {};
    const [items, total] = await Promise.all([
      Post.aggregate([
        ...(excludeMatch.authorId ? [{ $match: excludeMatch }] : []),
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "authorId",
          },
        },
        { $unwind: "$authorId" },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "postId",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comments",
          },
        },
        {
          $addFields: {
            likesCount: { $size: "$likes" },
            commentsCount: { $size: "$comments" },
          },
        },
        {
          $project: {
            likes: 0,
            comments: 0,
            "authorId.password": 0,
          },
        },
      ]),
      Post.countDocuments(excludeMatch),
    ]);

    return res.status(200).json({ items, page, limit, total });
  } catch (err) {
    return handlePostError(err, res);
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id).populate(
      "authorId",
      "username avatar"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const [likesCount, liked] = await Promise.all([
      Like.countDocuments({ postId: post._id }),
      req.userId
        ? Like.exists({ userId: req.userId, postId: post._id })
        : false,
    ]);
    return res.status(200).json({
      post,
      stats: {
        likes: likesCount,
        liked: Boolean(liked),
      },
    });
  } catch (err) {
    return handlePostError(err, res);
  }
}

export async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (String(post.authorId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.body.caption !== undefined) {
      post.caption = String(req.body.caption);
    }

    await post.save();
    return res.status(200).json({ post });
  } catch (err) {
    return handlePostError(err, res);
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (String(post.authorId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await post.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return handlePostError(err, res);
  }
}

export async function listUserPosts(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
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
    return handlePostError(err, res);
  }
}
