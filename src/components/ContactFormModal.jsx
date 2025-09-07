import React, { useState, useEffect } from "react";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import { FiX } from "react-icons/fi";
import FormField from "./FormField";

function ContactFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues = { name: "", email: "", description: "" },
  title = "Add Contact",
  submitText = "Save",
  loading = false,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues);
      setErrors({});
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email";
    if (form.description && form.description.length > 1000)
      err.description = "Description too long";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const extractErrorMessage = (err) => {
    return (
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save. Please try again."
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(form);
      // success path handled by parent (often closes and refreshes)
      setErrors((prev) => ({ ...prev, general: undefined }));
    } catch (err) {
      // do not clear inputs; show friendly error
      const msg = extractErrorMessage(err);
      setErrors((prev) => ({ ...prev, general: msg }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[color:var(--color-background)] rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-muted)]">
          <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
          >
            <FiX className="text-xl text-[color:var(--color-primary-text)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            error={errors.name}
          />
          <FormField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            error={errors.email}
          />
          <FormField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            type="text"
            placeholder="Description (optional)"
            error={errors.description}
          />
          <div className="flex justify-end gap-2 pt-2">
            <SecondaryButton onClick={onClose} type="button">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Saving..." : submitText}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactFormModal;
