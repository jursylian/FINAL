import Post from "../models/Post.js";
import Like from "../models/Like.js";
import { handleError } from "../utils/errorHandler.js";
import { parsePagination } from "../utils/pagination.js";
import { toObjectId } from "../utils/objectId.js";
import { getFollowingIds } from "../utils/followingIds.js";

function buildFeedMatch(matchClauses) {
  if (!matchClauses.length) {
    return {};
  }
  if (matchClauses.length === 1) {
    return matchClauses[0];
  }
  return { $and: matchClauses };
}

async function fetchFeed({ match, page, limit, skip }) {
  const [items, total] = await Promise.all([
    Post.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
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
    Post.countDocuments(match),
  ]);

  return { items, total, page, limit };
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
    return handleError(err, res);
  }
}

export async function listFeed(req, res) {
  return listHomeFeed(req, res);
}

export async function listHomeFeed(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const currentUserId = toObjectId(req.userId);
    const followingIds = await getFollowingIds(req.userId);

    if (!followingIds.length) {
      return res.status(200).json({ items: [], page, limit, total: 0 });
    }

    const matchClauses = [
      { authorId: { $in: followingIds } },
    ];
    if (currentUserId) {
      matchClauses.push({ authorId: { $ne: currentUserId } });
    }

    const match = buildFeedMatch(matchClauses);
    const payload = await fetchFeed({ match, page, limit, skip });
    return res.status(200).json(payload);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function listExploreFeed(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const currentUserId = toObjectId(req.userId);
    const followingIds = await getFollowingIds(req.userId);
    const excludedIds = [
      ...followingIds,
      ...(currentUserId ? [currentUserId] : []),
    ];

    const matchClauses = [
      { authorId: { $nin: excludedIds } },
    ];

    const match = buildFeedMatch(matchClauses);
    const payload = await fetchFeed({ match, page, limit, skip });
    return res.status(200).json(payload);
  } catch (err) {
    return handleError(err, res);
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
    return handleError(err, res);
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
    return handleError(err, res);
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
    return handleError(err, res);
  }
}
