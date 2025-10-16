import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { formatTimeAgo } from "../../../utils/timeUtils";
import MediaContainer from "../../../components/MediaContainer";
import MediaGallery from "../../campaigns/components/MediaGallery";
import { toggleLikePost } from "../services/feedApi";

import { getPostById } from "../services/feedApi";
import ErrorState from "../../../components/ErrorState";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId);
        setPost(data);
        setLikesCount(data.likesCount || 0);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleBackClick = () => {
    // If we came from the feed, go back to it
    if (location.state?.from === "feed") {
      navigate("/feed", {
        state: {
          scrollPosition: location.state?.scrollPosition,
          postId: postId,
        },
      });
    } else {
      // Default fallback to feed
      navigate("/feed");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-2 lg:px-6 xl:px-8 2xl:px-">
            {/* Main content area */}
            <div>
              <div className="pt-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-[var(--color-muted)] rounded w-16 mb-6"></div>
                  <div className="bg-[var(--color-surface)] rounded-lg p-6">
                    <div className="h-6 bg-[var(--color-muted)] rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-[var(--color-muted)] rounded w-1/2 mb-6"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-[var(--color-muted)] rounded"></div>
                      <div className="h-4 bg-[var(--color-muted)] rounded w-5/6"></div>
                      <div className="h-4 bg-[var(--color-muted)] rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <ErrorState
          title="Error Loading Post"
          description={error}
          onRetry={() => window.location.reload()}
          secondaryAction={{ to: "/feed", label: "Back to Feed" }}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 pt-2 lg:px-6 xl:px-8 2xl:px-">
            {/* Main content area */}
            <div className="flex-1">
              <div className="pt-6">
                <button
                  onClick={handleBackClick}
                  className="flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mb-6 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Feed
                </button>
                <div className="bg-[var(--color-surface)] rounded-lg p-8 text-center">
                  <h2 className="text-xl font-medium text-[var(--color-text)] mb-2">
                    Post Not Found
                  </h2>
                  <p className="text-[var(--color-secondary-text)]">
                    The post you're looking for doesn't exist or has been
                    removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeLabel = getTypeLabel(post.type);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 pt-2 lg:px-6 xl:px-8 2xl:px-">
          {/* Main content area */}
          <div className="flex-1">
            <div className="pt-6">
              {/* Back Button */}
              <button
                onClick={handleBackClick}
                className="flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mb-6 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Feed
              </button>

              {/* Post Content */}
              <div className="bg-[var(--color-background)] rounded-lg border border-[var(--color-muted)] p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {/* Profile Picture + Name as link to organizer profile */}
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
                        <h3 className="font-medium text-[var(--color-text)] text-base ">
                          {post.organizationName}
                        </h3>
                        <p className="text-sm text-[var(--color-secondary-text)] opacity-70">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Type Badge */}
                  {typeLabel && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-muted)] text-[var(--color-text)] opacity-80">
                      {typeLabel}
                    </span>
                  )}
                </div>

                {/* Title */}
                {post.title && (
                  <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4 leading-tight">
                    {post.title}
                  </h1>
                )}

                {/* Like */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    aria-label={liked ? "Unlike" : "Like"}
                    onClick={async () => {
                      try {
                        setLiked((v) => !v);
                        setLikesCount((c) =>
                          liked ? Math.max(0, c - 1) : c + 1
                        );
                        const result = await toggleLikePost(post.postId);
                        if (result && typeof result.likesCount === "number") {
                          setLikesCount(result.likesCount);
                          setLiked(!!result.liked);
                        }
                      } catch (e) {
                        setLiked((v) => !v);
                        setLikesCount((c) =>
                          liked ? c + 1 : Math.max(0, c - 1)
                        );
                      }
                    }}
                    className={`transition-colors`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={`${
                        liked
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-secondary-text)]"
                      } w-6 h-6`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </button>
                  <span className="text-sm text-[var(--color-secondary-text)]">
                    {likesCount}
                  </span>
                </div>

                {/* Body - Full text with preserved formatting */}
                {post.body && (
                  <div className="text-[var(--color-text)] mb-6">
                    <div
                      className="formatted-text text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                  </div>
                )}

                {/* Media - Basic display */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-6">
                    {post.media.length === 1 ? (
                      <MediaContainer
                        media={post.media[0]}
                        size="large"
                        className="w-full"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {post.media.map((media, index) => (
                          <MediaContainer
                            key={index}
                            media={media}
                            size="medium"
                            className="w-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Campaign Link - Only for pinned posts */}
                {post.isPinnedToCampaign && post.campaignTitle && (
                  <div className="mt-6 pt-6 border-t border-[var(--color-muted)]">
                    <div className="flex items-center justify-between bg-[var(--color-background)] rounded-lg p-4 hover:bg-[var(--color-surface)] transition-colors border border-[var(--color-muted)]">
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-[var(--color-text)] mb-1">
                          {post.campaignTitle}
                        </h4>
                        <p className="text-sm text-[var(--color-secondary-text)]">
                          Campaign Update
                        </p>
                      </div>
                      <a
                        href={`/campaign/${post.campaignShareLink}-${(
                          post.campaignTitle || ""
                        )
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 80)}`}
                        className="ml-3 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                      >
                        Visit Campaign
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
