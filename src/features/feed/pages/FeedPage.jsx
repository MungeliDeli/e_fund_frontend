import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getPosts } from "../services/feedApi";
import PostCard from "../components/PostCard";
import FeedSidebar from "../../../components/FeedSidebar";

const FeedPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filterValue, setFilterValue] = useState("latest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const feedRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle scroll position restoration when returning from post detail
  useEffect(() => {
    if (location.state?.scrollPosition && feedRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.scrollTo(0, location.state.scrollPosition);
      }, 100);
    }
  }, [location.state?.scrollPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (filter) => {
    setFilterValue(filter);
    setIsDropdownOpen(false);
  };

  const filterOptions = [
    { value: "latest", label: "Latest" },
    { value: "popular", label: "Popular" },
    { value: "trending", label: "Trending" },
    { value: "recent", label: "Recent" },
  ];

  const selectedOption = filterOptions.find(
    (option) => option.value === filterValue
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 pt-6 lg:px-12 xl:px-20 2xl:px-32">
            {/* Main content area */}
            <div className="flex-1">
              <div className="animate-pulse space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[var(--color-surface)] rounded-lg p-6"
                  >
                    <div className="h-4 bg-[var(--color-muted)] rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-[var(--color-muted)] rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[var(--color-muted)] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sidebar skeleton */}
            <div className="hidden min-[900px]:block w-80">
              <div className="bg-[var(--color-surface)] rounded-lg p-6 h-96">
                <div className="animate-pulse">
                  <div className="h-4 bg-[var(--color-muted)] rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-[var(--color-muted)] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[var(--color-muted)] rounded w-1/2"></div>
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
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-medium text-red-800 mb-2">
                Error Loading Feed
              </h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 pt-2 pb-6 lg:px-6 xl:px-8 2xl:px-">
          {/* Main content area */}
          <div className="flex-1" ref={feedRef}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-8">
                  <button
                    onClick={() => handleTabChange("all")}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === "all"
                        ? "text-[var(--color-text)] font-semibold"
                        : "text-[var(--color-secondary-text)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={() => handleTabChange("campaigns")}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === "campaigns"
                        ? "text-[var(--color-text)] font-semibold"
                        : "text-[var(--color-secondary-text)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    Campaigns
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm text-[var(--color-text)] font-medium hover:text-[var(--color-primary)] transition-colors"
                    >
                      <span>{selectedOption?.label}</span>
                      <svg
                        className={`w-4 h-4 text-[var(--color-secondary-text)] transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-30 bg-[var(--color-surface)] border border-[var(--color-muted)] rounded-lg shadow-lg z-50">
                        {filterOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange(option.value)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              filterValue === option.value
                                ? "bg-[var(--color-surface)] "
                                : "text-[var(--color-text)] hover:bg-[var(--color-muted)]"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {user && user.role === "organizer" && (
                    <Link
                      to="/feed/create"
                      className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-accent)] transition-colors text-sm font-medium"
                    >
                      Create Post
                    </Link>
                  )}
                </div>
              </div>

              {/* Separator line */}
              <div className="border-b border-[var(--color-muted)]"></div>
            </div>

            {/* Posts section */}
            {posts.length === 0 ? (
              <div className="bg-[var(--color-surface)] rounded-lg p-8 text-center">
                <h2 className="text-xl font-medium text-[var(--color-text)] mb-2">
                  No posts yet
                </h2>
                <p className="text-[var(--color-secondary-text)]">
                  Be the first to share something with the community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.postId} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <FeedSidebar />
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
