import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { formatTimeAgo } from "../../../utils/timeUtils";
import MediaContainer from "../../../components/MediaContainer";
import ImageSlider from "../../../components/ImageSlider";
import FeedSidebar from "../../../components/FeedSidebar";
import { getPostById } from "../services/feedApi";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId);
        setPost(data);
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
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 pt-2 lg:px-6 xl:px-8 2xl:px-">
            {/* Main content area */}
            <div className="flex-1">
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

            {/* Sidebar */}
            <FeedSidebar />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <h2 className="text-lg font-medium text-red-800 mb-2">
                    Error Loading Post
                  </h2>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <FeedSidebar />
          </div>
        </div>
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

            {/* Sidebar */}
            <FeedSidebar />
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

                {/* Body - Full text with preserved formatting */}
                {post.body && (
                  <div className="text-[var(--color-text)] mb-6">
                    <div
                      className="formatted-text text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                  </div>
                )}

                {/* Media - Full size image slider */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-6">
                    {post.media.length === 1 ? (
                      <MediaContainer
                        media={post.media[0]}
                        size="large"
                        className="w-full"
                      />
                    ) : (
                      <ImageSlider
                        media={post.media}
                        size="large"
                        className="w-full"
                      />
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

          {/* Sidebar */}
          <FeedSidebar />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
