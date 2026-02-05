export default function FeedPost({
  post,
  onToggleLike,
  likeLoading,
  onOpenComments,
}) {
  const likeIcon = post.liked ? "/images/Like_active.svg" : "/images/Like.svg";
  const commentIcon = "/images/Comment.svg";

  return (
    <article className="w-full md:w-[402px] md:max-w-[402px] border-b border-[#EFEFEF] pb-10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-[#DBDBDB]">
            {post.authorId?.avatar ? (
              <img
                src={post.authorId.avatar}
                alt={post.authorId.username || "author"}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#262626]">
              {post.authorId?.username || "unknown"}
            </div>
            <div className="text-[12px] text-[#8E8E8E]">2 weeks ago</div>
          </div>
        </div>
      </div>

      <div className="aspect-square md:aspect-auto w-full bg-[#F2F2F2] md:h-[504px]">
        {post.image && (
          <img src={post.image} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onToggleLike?.(post._id)}
          disabled={likeLoading}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src={likeIcon} alt="Like" className="h-6 w-6 cursor-pointer" />
        </button>
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

      <div className="mt-2 text-[14px] font-semibold text-[#262626]">
        {(post.likesCount ?? 0).toString()} likes
      </div>

      <div className="mt-1 text-[14px] text-[#262626]">
        <span className="font-semibold">
          {post.authorId?.username || "unknown"}
        </span>{" "}
        {post.caption || ""}
      </div>

      <button
        type="button"
        onClick={() => onOpenComments?.(post._id)}
        className="mt-1 inline-block text-[14px] text-[#8E8E8E]"
      >
        View all comments ({post.commentsCount ?? 0})
      </button>

    </article>
  );
}
