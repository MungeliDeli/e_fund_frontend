import React, { useState } from "react";

function WordsOfSupport({ themeColor }) {
  const [showCount, setShowCount] = useState(3);

  // Mock data - replace with actual API call
  const mockSupports = [
    {
      id: 1,
      message:
        "Education changed my life, and I want to ensure others have the same opportunity. Keep up the amazing work!",
      author: "Kevin Hansen",
      amount: 1000,
    },
    {
      id: 2,
      message:
        "Proud to support the next generation of leaders. Every student deserves a chance to succeed.",
      author: "Anonymous Donor",
      amount: 1000,
    },
    {
      id: 3,
      message:
        "My dad's Myth collection introduced me to you, and got me through high school. Then I found Buck Godot (a little late, I know), which got me through college, as well as Magic the Gathering. I found you in Ireland at a convention, and I've been a fan ever since. I've gotten from Girl Genius. (I really do mean to buy all the print comics someday, not just the 2 I could afford at the time.) I feel that I ought to give what I can when everyone's budget is tight, and I at least get paid by the hour.",
      author: "Daniel Bair",
      amount: 1000,
    },
    {
      id: 4,
      message:
        "This campaign is making a real difference in our community. Thank you for your dedication!",
      author: "Sarah Mitchell",
      amount: 500,
    },
    {
      id: 5,
      message:
        "Supporting this cause because I believe in the mission and the positive impact it creates.",
      author: "Michael Rodriguez",
      amount: 750,
    },
    {
      id: 6,
      message:
        "Every contribution counts towards building a better future. Happy to be part of this journey.",
      author: "Emily Chen",
      amount: 300,
    },
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const displayedSupports = mockSupports.slice(0, showCount);

  const handleSeeMore = () => {
    setShowCount((prev) => Math.min(prev + 5, mockSupports.length));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: themeColor }}
        >
          Words of Support
        </h3>
        <div
          className="w-full h-px"
          style={{ backgroundColor: `${themeColor}40` }}
        ></div>
      </div>

      {/* Support Messages */}
      <div className="space-y-4">
        {displayedSupports.map((support) => (
          <div
            key={support.id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Message and Author */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  "{support.message}"
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: themeColor }}
                >
                  - {support.author}
                </p>
              </div>

              {/* Amount Badge */}
              <div
                className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${themeColor}20`,
                  color: themeColor,
                }}
              >
                {formatAmount(support.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      <div className="mt-4 text-center">
        <button
          onClick={handleSeeMore}
          className="w-full py-2 px-4 rounded-lg border-2 font-medium transition-colors"
          style={{
            borderColor: `${themeColor}40`,
            color: themeColor,
            backgroundColor: "white",
          }}
        >
          See More
        </button>
      </div>
    </div>
  );
}

export default WordsOfSupport;
