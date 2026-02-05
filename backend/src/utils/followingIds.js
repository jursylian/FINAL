import Follow from "../models/Follow.js";

export async function getFollowingIds(userId) {
  if (!userId) {
    return [];
  }
  const follows = await Follow.find({ followerId: userId })
    .select("followingId")
    .lean();
  return follows.map((item) => item.followingId);
}
