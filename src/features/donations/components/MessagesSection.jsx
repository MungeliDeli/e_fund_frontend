import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "../../../components/Buttons";
import { FaComments, FaEye, FaStar, FaClock, FaSyncAlt } from "react-icons/fa";
import ColoredIcon from "../../../components/ColoredIcon";
import StatusBadge from "../../../components/StatusBadge";
import { FiMessageSquare } from "react-icons/fi";
import {
  getFeaturedMessages,
  getPendingMessagesCount,
} from "../services/messagesApi";

const MessagesSection = ({
  campaignId,
  className = "",
  isOrganizer = false,
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllMessages, setShowAllMessages] = useState(false);

  useEffect(() => {
    // Only fetch data if this is an organizer and we have a campaign ID
    if (isOrganizer && campaignId) {
      fetchMessagesData();
    } else {
      setLoading(false);
    }
  }, [campaignId, isOrganizer]);

  const fetchMessagesData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
      
        setLoading(true);
      }

      // Fetch featured messages and pending count using service
      const [featuredData, pendingData] = await Promise.all([
        getFeaturedMessages(campaignId, 3),
        getPendingMessagesCount(campaignId),
      ]);

      setMessages(featuredData.data || []);
      setPendingCount(pendingData.data?.pendingCount || 0);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        setError(
          `Failed to load messages: ${err.response.status} - ${
            err.response.data?.message || "Unknown error"
          }`
        );
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Request error:", err.request);
        setError("Failed to load messages: No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", err.message);
        setError(`Failed to load messages: ${err.message}`);
      }
    } finally {
      setLoading(false);
      
    }
  };

  const handleViewAllMessages = () => {
    navigate(`/organizer/campaigns/${campaignId}/messages`);
  };

  const handleManageMessages = () => {
    navigate(`/organizer/campaigns/${campaignId}/messages`);
  };

  // Don't render if not an organizer
  if (!isOrganizer) {
    return null;
  }

  if (loading) {
    return (
      <div
        className={`bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-muted)] p-6 ${className}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-[color:var(--color-muted)] rounded animate-pulse" />
          <div className="w-32 h-6 bg-[color:var(--color-muted)] rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="w-full h-4 bg-[color:var(--color-muted)] rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-[color:var(--color-muted)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-muted)] p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ColoredIcon
            Icon={FaComments}
            color="var(--color-primary)"
            className="w-8 h-8"
          />
          <div>
            <h3 className="text-xl font-bold text-[color:var(--color-primary-text)]">
              Campaign Messages
            </h3>
            <p className="text-sm text-[color:var(--color-secondary-text)]">
              Donor messages and feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Messages Count */}
          <div className="text-xs text-[color:var(--color-secondary-text)] bg-[color:var(--color-background)] px-2 py-1 rounded">
            {messages.length} featured message{messages.length !== 1 ? "s" : ""}
          </div>

          {/* Pending Messages Badge */}
          {pendingCount > 0 && (
            <StatusBadge
              status="pending approval"
              label={`${pendingCount} pending`}
            />
          )}

         
        </div>
      </div>

      {/* Messages Content */}
      {error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <FiMessageSquare className="text-3xl mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
          <SecondaryButton
            onClick={() => fetchMessagesData(true)}
            className="mt-3"
          >
            Try Again
          </SecondaryButton>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[color:var(--color-secondary-text)] mb-4">
            <FiMessageSquare className="text-4xl mx-auto mb-3 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">
              Donors will leave messages here when they donate
            </p>
          </div>
          <div className="text-xs text-[color:var(--color-secondary-text)] bg-[color:var(--color-background)] rounded-lg p-3 border border-[color:var(--color-muted)]">
            <p>
              💡 <strong>Tip:</strong> Messages appear here after donors leave
              comments during donations
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Featured Messages */}
          <div className="space-y-3">
            {messages
              .slice(0, showAllMessages ? messages.length : 1)
              .map((message, index) => (
                <div
                  key={message.messageId}
                  className="bg-[color:var(--color-background)] rounded-lg border border-[color:var(--color-muted)] p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <StatusBadge status="successful" label="Featured" />
                    <span className="text-xs text-[color:var(--color-secondary-text)]">
                      {new Date(message.postedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[color:var(--color-primary-text)] text-sm leading-relaxed">
                    {message.messageText}
                  </p>

                  <div className="mt-2 text-xs text-[color:var(--color-secondary-text)]">
                    {message.donorEmail ? (
                      <>From: {message.donorEmail}</>
                    ) : (
                      <span className="italic">Anonymous donor</span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Show More/Less Toggle */}
          {messages.length > 1 && (
            <div className="text-center">
              <SecondaryButton
                onClick={() => setShowAllMessages(!showAllMessages)}
                className="text-sm"
              >
                {showAllMessages
                  ? "Show Less"
                  : `Show ${messages.length - 1} More`}
              </SecondaryButton>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-[color:var(--color-muted)]">
        <PrimaryButton
          onClick={handleViewAllMessages}
          icon={FaEye}
          className="flex-1"
        >
          View All Messages
        </PrimaryButton>

        {pendingCount > 0 && (
          <SecondaryButton
            onClick={handleManageMessages}
            icon={FaComments}
            className="flex-1"
          >
            Manage Messages ({pendingCount})
          </SecondaryButton>
        )}
      </div>
    </div>
  );
};

export default MessagesSection;
