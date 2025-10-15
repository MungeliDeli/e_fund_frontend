import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getPosts } from "../services/feedApi";
import PostCard from "../components/PostCard";
import ErrorState from "../../../components/ErrorState";

const FeedPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValue, setFilterValue] = useState("latest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const feedRef = useRef(null);
  const [retryKey, setRetryKey] = useState(0);

  // Get initial tab from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam === "campaigns" ? "campaigns" : "all"
  );

  // Sync activeTab with URL parameter changes
  useEffect(() => {
    const newTabParam = searchParams.get("tab");
    const newActiveTab = newTabParam === "campaigns" ? "campaigns" : "all";
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  }, [location.search, activeTab, searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Fetch all posts or campaign posts based on active tab
        const params = activeTab === "campaigns" ? { type: "campaign" } : {};
        params.sort = filterValue === "popular" ? "popular" : "latest";
        const data = await getPosts(params);
        setPosts(data);
        console.log(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, filterValue, retryKey]);

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
    // Update URL with tab parameter
    const newSearchParams = new URLSearchParams(location.search);
    if (tab === "campaigns") {
      newSearchParams.set("tab", "campaigns");
    } else {
      newSearchParams.delete("tab");
    }
    const newUrl = `${location.pathname}${
      newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""
    }`;
    navigate(newUrl, { replace: true });
  };

  const handleFilterChange = (filter) => {
    setFilterValue(filter);
    setIsDropdownOpen(false);
  };

  const filterOptions = [
    { value: "latest", label: "Latest" },
    { value: "popular", label: "Popular" },
  ];

  const selectedOption = filterOptions.find(
    (option) => option.value === filterValue
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 lg:px-12 xl:px-20 2xl:px-32">
            <div className="animate-pulse columns-1 sm:columns-2 lg:columns-3 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-surface)] rounded-lg p-6 break-inside-avoid mb-4"
                >
                  <div className="h-4 bg-[var(--color-muted)] rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-[var(--color-muted)] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[var(--color-muted)] rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn’t load your feed"
        description={
          typeof error === "string"
            ? error
            : "This might be a temporary issue. Check your connection and try again."
        }
        onRetry={() => setRetryKey((k) => k + 1)}
        secondaryAction={{ to: "/", label: "Go Home" }}
        className="py-12"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-2 pb-6 lg:px-6 xl:px-8 2xl:px-8" ref={feedRef}>
          <div className="flex items-center justify-between py-4 mb-6">
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

          <div className="border-b border-[var(--color-muted)] mb-6"></div>

          {posts.length === 0 ? (
            <div className="bg-[var(--color-surface)] rounded-lg p-8 text-center">
              <h2 className="text-xl font-medium text-[var(--color-text)] mb-2">
                {activeTab === "campaigns"
                  ? "No campaign posts yet"
                  : "No posts yet"}
              </h2>
              <p className="text-[var(--color-secondary-text)]">
                {activeTab === "campaigns"
                  ? "No campaign posts have been created yet. Check back later!"
                  : "Be the first to share something with the community!"}
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {posts.map((post) => (
                <div key={post.postId} className="break-inside-avoid mb-4">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
