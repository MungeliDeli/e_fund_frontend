import React, { useState, useEffect } from "react";
import { getCampaignPosts } from "../../feed/services/feedApi";
import { Link } from "react-router-dom";

function SuccessStories({ themeColor, campaignId }) {
  const [showAll, setShowAll] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const posts = await getCampaignPosts(campaignId, {
          type: "success_story",
          status: "published",
          limit: 50,
        });
        const pinned = (posts || []).filter((p) => p.isPinnedToCampaign);
        setStories(pinned);
      } catch (_) {
        setStories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [campaignId]);

  if (loading) return null;
  if (!stories || stories.length === 0) return null;

  const displayedStories = showAll ? stories : stories.slice(0, 4);

  const getPostImageUrl = (post) => {
    const mediaArray = Array.isArray(post.media) ? post.media : [];
    const firstImage = mediaArray.find((m) => m?.type === "image" && m?.url);
    return firstImage?.url || null;
  };

  const getAuthorLabel = (post) => {
    const fullName = [post.firstName, post.lastName].filter(Boolean).join(" ");
    return post.organizationName || fullName || "Story Contributor";
  };

  const getText = (post) => {
    return post.title || post.body || "";
  };

  return (
    <div className="bg-[color:var(--color-background)] rounded-lg p-6 shadow-[0_2px_16px_0_var(--color-shadow)]">
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: themeColor }}
        >
          Success Stories
        </h3>
        <div
          className="w-full h-px"
          style={{ backgroundColor: `${themeColor}40` }}
        ></div>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {displayedStories.map((post) => {
          const imageUrl = getPostImageUrl(post);
          const author = getAuthorLabel(post);
          const text = getText(post);
          return (
            <Link
              to={`/post/${post.postId}`}
              key={post.postId}
              className="flex gap-3 group"
            >
              {/* Story Image */}
              <div className="w-16 h-16 bg-[color:var(--color-surface)] rounded-lg flex-shrink-0 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Story image`}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-[color:var(--color-surface)] items-center justify-center text-lg text-[color:var(--color-text)] hidden">
                  SS
                </div>
                {!imageUrl ? (
                  <div className="w-full h-full bg-[color:var(--color-surface)] items-center justify-center text-lg text-[color:var(--color-text)] flex">
                    SS
                  </div>
                ) : null}
              </div>

              {/* Story Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm text-[color:var(--color-text)] leading-relaxed mb-1 group-hover:underline"
                  style={{ textDecorationColor: themeColor }}
                >
                  {text}
                </p>
                <span className="block text-xs text-[color:var(--color-secondary-text)] mb-1">
                  {author}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* See More Button */}
      {stories.length > 4 ? (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 px-4 rounded-lg border-2 font-medium transition-colors"
            style={{
              borderColor: `${themeColor}40`,
              color: themeColor,
              backgroundColor: "bg-[color:var(--color-background)]",
            }}
          >
            {showAll ? "See Less" : "See More"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default SuccessStories;
