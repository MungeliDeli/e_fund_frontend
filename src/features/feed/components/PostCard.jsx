import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../../../utils/timeUtils";
import MediaContainer from "../../../components/MediaContainer";
import ImageSlider from "../../../components/ImageSlider";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  console.log(post);

  const handlePostClick = () => {
    navigate(`/post/${post.postId}`, {
      state: {
        from: "feed",
        scrollPosition: window.scrollY,
        postId: post.postId,
      },
    });
  };
  const getTypeLabel = (type) => {
    switch (type) {
      case "update":
        return "Update";
      case "success_story":
        return "Success Story";
      case "thank_you":
        return "Thank You";
      case "campaign":
        return "Campaign";
      default:
        return null;
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getBodyMaxLength = () => {
    // Shorter for posts with images, longer for text-only posts
    const hasMedia = post.media && post.media.length > 0;
    return hasMedia ? 150 : 300;
  };

  const typeLabel = getTypeLabel(post.type);

  return (
    <div className="bg-[var(--color-background)] rounded-lg  border border-[var(--color-muted)] p-6  hover:bg-[var(--color-surface)] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Profile Picture */}
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium text-sm">
            {post.organizationName?.slice(0, 1)}
          </div>

          {/* Name and Time */}
          <div>
            <h3 className="font-medium text-[var(--color-text)] text-sm">
              {post.organizationName}
            </h3>
            <p className="text-xs text-[var(--color-secondary-text)] opacity-70">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Type Badge */}
        {typeLabel && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-muted)] text-[var(--color-text)] opacity-80">
            {typeLabel}
          </span>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h2
          className="text-lg font-semibold text-[var(--color-text)] mb-3 leading-tight cursor-pointer  transition-colors"
          onClick={handlePostClick}
        >
          {post.title}
        </h2>
      )}

      {/* Body */}
      {post.body && (
        <div
          className="text-[var(--color-text)] mb-4 cursor-pointer  transition-colors"
          onClick={handlePostClick}
        >
          <p className="text-sm opacity-98 leading-relaxed whitespace-pre-wrap">
            {truncateText(post.body, getBodyMaxLength())}
          </p>
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          {post.media.length === 1 ? (
            <MediaContainer
              media={post.media[0]}
              size="large"
              className="w-full"
            />
          ) : (
            <ImageSlider media={post.media} size="large" className="w-full" />
          )}
        </div>
      )}

      {/* Campaign Link - For pinned posts or campaign posts */}
      {((post.isPinnedToCampaign && post.campaignTitle) ||
        (post.type === "campaign" && post.campaignTitle)) && (
        <div className="mt-4 pt-4 border-t border-[var(--color-muted)]">
          <div
            className="flex items-center justify-between bg-[var(--color-background)] rounded-lg p-3 hover:bg-[var(--color-surface)] transition-colors border border-[var(--color-muted)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1">
              <h4 className="text-sm font-medium text-[var(--color-text)] mb-1">
                {post.campaignTitle}
              </h4>
              <p className="text-xs text-[var(--color-secondary-text)]">
                {post.type === "campaign" ? "New Campaign" : "Campaign Update"}
              </p>
            </div>
            <Link
              to={`/campaign/${post.campaignShareLink}-${(
                post.campaignTitle || ""
              )
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 80)}`}
              className="ml-3 px-4 py-2 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md hover:bg-[var(--color-surface)]  transition-colors"
            >
              {post.type === "campaign" ? "Support" : "Visit"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
