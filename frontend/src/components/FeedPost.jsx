import timeAgo from "../lib/timeAgo.js";

export default function FeedPost({
  post,
  onToggleLike,
  likeLoading,
  onOpenComments,
  onOpenPost,
}) {
  const likeIcon = post.liked ? "/images/Like_active.svg" : "/images/Like.svg";
  const commentIcon = "/images/Comment.svg";

  return (
    <article className="w-full md:w-[402px] md:max-w-[402px] border-b border-[#EFEFEF] pb-10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-[#DBDBDB]">
            <img
              src={post.authorId?.avatar || "/images/ICH.svg"}
              alt={post.authorId?.username || "author"}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#262626]">
              {post.authorId?.username || "unknown"}
            </div>
            <div className="text-[12px] text-[#8E8E8E]">
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenPost?.(post._id)}
        className="aspect-square md:aspect-auto w-full bg-[#F2F2F2] md:h-[504px]"
      >
        {post.image && (
          <img
            src={post.image}
            alt="Post"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </button>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleLike?.(post._id)}
          disabled={likeLoading}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src={likeIcon} alt="Like" className="h-6 w-6 cursor-pointer" />
        </button>
        {(post.likesCount ?? 0) > 0 ? (
          <span className="text-[14px] text-[#262626]">
            {(post.likesCount ?? 0).toString()}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onOpenComments?.(post._id)}
          className="inline-flex"
        >
          <img
            src={commentIcon}
            alt="Comment"
            className="h-6 w-6 cursor-pointer"
          />
        </button>
      </div>

      {post.caption ? (
        <div className="mt-1 text-[14px] text-[#262626]">{post.caption}</div>
      ) : null}
    </article>
  );
}
