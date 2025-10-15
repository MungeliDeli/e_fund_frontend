import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../../../utils/timeUtils";
import MediaContainer from "../../../components/MediaContainer";
import MediaGallery from "../../campaigns/components/MediaGallery";

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

  const getTruncatedHtml = (html, maxLength) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    if (text.length <= maxLength) return html;
    const truncatedText = text.substring(0, maxLength).trim() + "...";
    return `<p>${truncatedText}</p>`;
  };

  const getBodyMaxLength = () => {
    // Shorter for posts with images, longer for text-only posts
    const hasMedia = post.media && post.media.length > 0;
    return hasMedia ? 150 : 300;
  };

  const typeLabel = getTypeLabel(post.type);

  return (
    <>
      <div className="bg-[var(--color-background)] rounded-lg  border border-[var(--color-muted)] p-2   transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                if (post.organizerId)
                  navigate(`/organizers/${post.organizerId}`);
              }}
              role="button"
              aria-label="View organizer profile"
            >
              {post.profilePictureUrl ? (
                <img
                  src={post.profilePictureUrl}
                  alt={`${post.organizationName} profile`}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium text-sm ${
                  post.profilePictureUrl ? "hidden" : "flex"
                }`}
              >
                {post.organizationName?.slice(0, 1)}
              </div>

              {/* Name and Time */}
              <div>
                <h3 className="font-medium text-[var(--color-text)] text-sm ">
                  {post.organizationName}
                </h3>
                <p className="text-xs text-[var(--color-secondary-text)] opacity-70">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
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
            <div
              className="formatted-text line-clamp"
              dangerouslySetInnerHTML={{
                __html: getTruncatedHtml(post.body, getBodyMaxLength()),
              }}
            />
          </div>
        )}

        {/* Media and Campaign Link Combined */}
        {((post.media && post.media.length > 0) ||
          (post.isPinnedToCampaign && post.campaignTitle) ||
          (post.type === "campaign" && post.campaignTitle)) && (
          <div className="border border-[var(--color-muted)] rounded-lg overflow-hidden">
            {/* Media Section */}
            {post.media && post.media.length > 0 && (
              <div className="p-3">
                {post.media.length === 1 ? (
                  <MediaContainer
                    media={post.media[0]}
                    size="large"
                    className="w-full"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {post.media.slice(0, 4).map((media, index) => (
                      <MediaContainer
                        key={index}
                        media={media}
                        size="medium"
                        className="w-full"
                      />
                    ))}
                    {post.media.length > 4 && (
                      <div className="aspect-[3/2] bg-[var(--color-muted)] rounded-lg flex items-center justify-center">
                        <span className="text-[var(--color-secondary-text)] text-sm">
                          +{post.media.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Campaign Link Section */}
            {((post.isPinnedToCampaign && post.campaignTitle) ||
              (post.type === "campaign" && post.campaignTitle)) && (
              <div
                className="flex items-center justify-between bg-[var(--color-background)] p-3 hover:bg-[var(--color-surface)] transition-colors border-t border-[var(--color-muted)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-[var(--color-text)] mb-1">
                    {post.campaignTitle}
                  </h4>
                  <p className="text-xs text-[var(--color-secondary-text)]">
                    {post.type === "campaign"
                      ? "New Campaign"
                      : "Campaign Update"}
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
                  className="ml-3 px-4 py-2 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  {post.type === "campaign" ? "Support" : "Visit"}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
      .formatted-text p { margin: 0.5rem 0; line-height: 1.5; }
      .formatted-text p:first-child { margin-top: 0; }
      .formatted-text p:last-child { margin-bottom: 0; }
      .formatted-text strong { font-weight: 600; }
      .formatted-text em { font-style: italic; }
      .formatted-text ul { margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: disc; }
      .formatted-text li { margin: 0.25rem 0; line-height: 1.5; }
      .line-clamp { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
    `}</style>
    </>
  );
};

export default PostCard;
