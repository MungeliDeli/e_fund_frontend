import React from "react";
import { FiList, FiPlus } from "react-icons/fi";

function SegmentsSidebar({
  segments,
  selectedSegmentId,
  onSegmentSelect,
  onAddSegment,
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[color:var(--color-muted)]">
        <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] pl-1 flex items-center gap-2">
          Contact Lists
        </h3>
      </div>

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[color:var(--color-secondary-text)] text-sm">
              No lists found
            </p>
            <p className="text-[color:var(--color-secondary-text)] text-xs mt-1">
              Create your first list to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {segments.map((segment) => {
              const id = segment.segmentId || segment.segment_id;
              const count = segment.contactCount || segment.contact_count || 0;
              const isSelected = selectedSegmentId === id;
              return (
                <button
                  key={id}
                  onClick={() => onSegmentSelect(id)}
                  className={`w-full text-left p-1 pl-2 rounded-lg transition-colors ${
                    isSelected
                      ? "border border-[color:var(--color-primary)] text-white"
                      : "hover:bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{segment.name}</p>
                      <p className="text-xs opacity-75 truncate">
                        {count} contacts
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SegmentsSidebar;
