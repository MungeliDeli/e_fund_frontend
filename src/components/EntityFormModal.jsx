import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import FormField from "./FormField";

function EntityFormModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Add",
  submitText = "Save",
  loading = false,
  fields = [], // [{ name, label, type, required }]
  initialValues = {},
  validate, // optional (form) => ({ field: error })
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const defaultValidate = () => {
    const err = {};
    for (const f of fields) {
      if (f.required && !String(form[f.name] ?? "").trim()) {
        err[f.name] = `${f.label} is required`;
      }
    }
    return err;
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
    const err = validate ? validate(form) : defaultValidate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      await onSubmit(form);
      setErrors((prev) => ({ ...prev, general: undefined }));
    } catch (error) {
      const msg = extractErrorMessage(error);
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

          {fields.map((f) => (
            <FormField
              key={f.name}
              label={f.label}
              name={f.name}
              type={f.type || "text"}
              value={form[f.name] ?? (f.type === "checkbox" ? false : "")}
              onChange={handleChange}
              required={f.required}
              error={errors[f.name]}
              placeholder={f.placeholder}
            />
          ))}

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

export default EntityFormModal;
