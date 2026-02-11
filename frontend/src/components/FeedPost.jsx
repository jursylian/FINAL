import timeAgo from "../lib/timeAgo.js";
import UserLink from "./UserLink.jsx";
import UserAvatar from "./UserAvatar.jsx";

export default function FeedPost({
  post,
  onToggleLike,
  likeLoading,
  onOpenComments,
  onOpenPost,
}) {
  const likeIcon = post.liked ? "/images/Like_active.svg" : "/images/Like.svg";
  const commentIcon = "/images/Comment.svg";
  const authorId = post.authorId?._id || post.authorId;

  return (
    <article className="w-full border-b border-[#EFEFEF] pb-10 lg:w-[360px] lg:max-w-[360px] xl:w-[380px] xl:max-w-[380px] min-[1440px]:w-[402.1011047363281px] min-[1440px]:max-w-[402.1011047363281px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserLink
            userId={authorId}
            ariaLabel="Open profile"
          >
            <UserAvatar user={post.authorId} size={32} />
          </UserLink>
          <div>
            <UserLink
              userId={authorId}
              className="text-[14px] font-semibold text-[#262626]"
              ariaLabel="Open profile"
            >
              {post.authorId?.username || "unknown"}
            </UserLink>
            <div className="text-[12px] text-[#8E8E8E]">
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenPost?.(post._id)}
        className="aspect-square w-full bg-[#F2F2F2] lg:aspect-auto lg:h-[450px] lg:w-[360px] xl:h-[475px] xl:w-[380px] min-[1440px]:h-[503.8710632324219px] min-[1440px]:w-[402.1011047363281px]"
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
