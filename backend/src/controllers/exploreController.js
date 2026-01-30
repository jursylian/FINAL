import Post from "../models/Post.js";

export async function listExplorePosts(req, res) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30));

    const items = await Post.aggregate([{ $sample: { size: limit } }]);
    const populated = await Post.populate(items, {
      path: "authorId",
      select: "username avatar",
    });

    return res.status(200).json({ items: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
