import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import { createPost } from "../services/feedApi";
import PostForm from "../components/PostForm";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    if (!user || user.userType !== "organizationUser") {
      showError("Only organizers can create posts");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPost(formData);
      showSuccess(
        "Post created successfully! It will appear in the feed shortly."
      );
      navigate("/feed");
    } catch (error) {
      console.error("Post creation error:", error);
      showError(
        error.message ||
          "Failed to create post. Please check your input and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/feed");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Create New Post
          </h1>
          <p className="mt-2 text-[var(--color-secondary-text)]">
            Share updates, success stories, or thank you messages with your
            community
          </p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-muted)] p-6">
          <PostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
