import React, { useState } from "react";

function WordsOfSupport({ themeColor }) {
  const [showCount, setShowCount] = useState(3);

  // Mock data - replace with actual API call
  const mockSupports = [
    {
      id: 1,
      message: "Education changed my life, and I want to ensure others have the same opportunity. Keep up the amazing work!",
      author: "Kevin Hansen",
      amount: 1000
    },
    {
      id: 2,
      message: "Proud to support the next generation of leaders. Every student deserves a chance to succeed.",
      author: "Anonymous Donor",
      amount: 1000
    },
    {
      id: 3,
      message: "My dad's Myth collection introduced me to you, and got me through high school. Then I found Buck Godot (a little late, I know), which got me through college, as well as Magic the Gathering. I found you in Ireland at a convention, and I've been a fan ever since. I've gotten from Girl Genius. (I really do mean to buy all the print comics someday, not just the 2 I could afford at the time.) I feel that I ought to give what I can when everyone's budget is tight, and I at least get paid by the hour.",
      author: "Daniel Bair",
      amount: 1000
    },
    {
      id: 4,
      message: "This campaign is making a real difference in our community. Thank you for your dedication!",
      author: "Sarah Mitchell",
      amount: 500
    },
    {
      id: 5,
      message: "Supporting this cause because I believe in the mission and the positive impact it creates.",
      author: "Michael Rodriguez",
      amount: 750
    },
    {
      id: 6,
      message: "Every contribution counts towards building a better future. Happy to be part of this journey.",
      author: "Emily Chen",
      amount: 300
    }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayedSupports = mockSupports.slice(0, showCount);

  const handleSeeMore = () => {
    setShowCount(prev => Math.min(prev + 5, mockSupports.length));
  };

  return (
    <div className="bg-[color:var(--color-surface)] rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 
          className="text-lg font-semibold border-b-2 pb-1"
          style={{ 
            color: themeColor,
            borderBottomColor: themeColor
          }}
        >
          Words of Support
        </h3>
      </div>

      {/* Support Messages */}
      <div className="space-y-6">
        {displayedSupports.map((support) => (
          <div key={support.id} className="space-y-3">
            {/* Message */}
            <div className="bg-[color:var(--color-background)] p-4 rounded-lg">
              <p className="text-[color:var(--color-primary-text)] leading-relaxed">
                "{support.message}"
              </p>
            </div>

            {/* Author and Amount */}
            <div className="flex items-center justify-between">
              <span 
                className="font-medium px-3 py-1 rounded"
                style={{
                  backgroundColor: `${themeColor}15`,
                  color: themeColor
                }}
              >
                - {support.author}
              </span>
              <span 
                className="text-sm font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: `${themeColor}15`,
                  color: themeColor
                }}
              >
                {formatAmount(support.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      {showCount < mockSupports.length && (
        <div className="mt-6 text-center">
          <button
            onClick={handleSeeMore}
            className="px-6 py-2 rounded-lg border-2 font-medium transition-colors"
            style={{
              borderColor: themeColor,
              color: themeColor,
              backgroundColor: 'transparent'
            }}
          >
            See More
          </button>
        </div>
      )}

      {/* Show count indicator */}
      {mockSupports.length > 3 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-[color:var(--color-secondary-text)]">
            Showing {showCount} of {mockSupports.length} messages
          </span>
        </div>
      )}
    </div>
  );
}

export default WordsOfSupport;