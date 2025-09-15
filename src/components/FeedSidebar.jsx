import React from "react";

const FeedSidebar = () => {
  return (
    <div className="hidden min-[900px]:block w-80">
      <div className="sticky top-6">
        <div className="bg-[var(--color-surface)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Feed Sidebar
          </h3>
          <p className="text-[var(--color-secondary-text)] text-sm">
            This sidebar will contain interesting features and content in the
            future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedSidebar;
