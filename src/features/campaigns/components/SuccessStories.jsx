import React, { useState } from "react";

function SuccessStories({ themeColor }) {
  const [showAll, setShowAll] = useState(false);

  // Mock data - replace with actual API call
  const mockStories = [
    {
      id: 1,
      image: "/api/placeholder/60/60",
      text: "I've been enjoying Girl Genius online for years. I guess it's about time I pay up!",
      author: "Story Contributor"
    },
    {
      id: 2,
      image: "/api/placeholder/60/60",
      text: "I've been enjoying Girl Genius online for years. I guess it's about time I pay up!",
      author: "Story Contributor"
    },
    {
      id: 3,
      image: "/api/placeholder/60/60",
      text: "I've been enjoying Girl Genius online for years. I guess it's about time I pay up!",
      author: "Story Contributor"
    },
    {
      id: 4,
      image: "/api/placeholder/60/60",
      text: "I've been enjoying Girl Genius online for years. I guess it's about time I pay up!",
      author: "Story Contributor"
    },
    {
      id: 5,
      image: "/api/placeholder/60/60",
      text: "Another success story about how this campaign made a difference in someone's life.",
      author: "Another Contributor"
    },
    {
      id: 6,
      image: "/api/placeholder/60/60",
      text: "This campaign has been incredibly helpful and I'm grateful for the support provided.",
      author: "Grateful Beneficiary"
    }
  ];

  const displayedStories = showAll ? mockStories : mockStories.slice(0, 4);

  return (
    <div className="bg-[color:var(--color-surface)] rounded-lg p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 
          className="text-lg font-semibold border-b-2 pb-1"
          style={{ 
            color: themeColor,
            borderBottomColor: themeColor
          }}
        >
          Success Stories
        </h3>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {displayedStories.map((story) => (
          <div key={story.id} className="flex gap-3">
            {/* Story Image */}
            <div className="w-12 h-12 bg-[color:var(--color-muted)] rounded-lg flex-shrink-0 overflow-hidden">
              <img
                src={story.image}
                alt={`Story by ${story.author}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-full h-full bg-[color:var(--color-muted)] items-center justify-center text-xs text-[color:var(--color-secondary-text)] hidden"
              >
                {story.author[0]?.toUpperCase()}
              </div>
            </div>

            {/* Story Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[color:var(--color-primary-text)] leading-relaxed mb-2">
                "{story.text}"
              </p>
              <p className="text-xs text-[color:var(--color-secondary-text)]">
                - {story.author}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      {mockStories.length > 4 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-lg border-2 font-medium transition-colors"
            style={{
              borderColor: themeColor,
              color: themeColor,
              backgroundColor: 'transparent'
            }}
          >
            {showAll ? 'Show Less' : 'See More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default SuccessStories;