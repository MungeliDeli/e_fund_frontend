/**
 * PostsTab Component
 *
 * Displays all posts created by the organizer, including campaign posts.
 * Shows posts using the same PostCard component as the feed.
 *
 * Props:
 * @param {string} organizerId - The ID of the organizer
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizerPosts } from "../../../../feed/services/feedApi";
import PostCard from "../../../../feed/components/PostCard";

function PostsTab({ organizerId }) {
  const [posts, setPosts] = useState([]);

  const {
    data: organizerPosts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organizerPosts", organizerId],
    queryFn: async () => {
      if (!organizerId) return [];
      const data = await getOrganizerPosts(organizerId);
      return data;
    },
    enabled: !!organizerId,
  });

  useEffect(() => {
    if (organizerPosts) {
      setPosts(organizerPosts);
    }
  }, [organizerPosts]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-muted)]"
            >
              <div className="h-4 bg-[var(--color-muted)] rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-[var(--color-muted)] rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-[var(--color-muted)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">
            Failed to Load Posts
          </h3>
          <p className="text-[color:var(--color-secondary-text)] mb-6 max-w-md">
            {error?.message ||
              "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[color:var(--color-text)] mb-2">
            No Posts Yet
          </h3>
          <p className="text-[color:var(--color-secondary-text)] mb-6">
            This organizer hasn't created any posts yet.
          </p>
        </div>
      </div>
    );
  }

  // Show all posts
  return (
    <div className="w-full">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>
    </div>
  );
}

export default PostsTab;
