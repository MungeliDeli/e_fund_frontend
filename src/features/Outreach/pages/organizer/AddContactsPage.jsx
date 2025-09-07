import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchableDropdown from "../../../../components/SearchableDropdown";
import { PrimaryButton, SecondaryButton } from "../../../../components/Buttons";
import Notification from "../../../../components/Notification";
import * as outreachApi from "../../services/outreachApi";

function AddContactsPage() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");

  const [rows, setRows] = useState([{ name: "", email: "", description: "" }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await outreachApi.getSegments();
      const list = res?.data?.data || res?.data || [];
      setSegments(list);
    } catch (err) {
      console.error("Failed to load segments:", err);
      setError("Failed to load segments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const segmentOptions = useMemo(
    () =>
      (segments || [])
        .map((s) => ({
          categoryId: s?.segmentId || s?.segment_id || "",
          name: String(s?.name || "Unnamed list"),
        }))
        .filter((opt) => opt.categoryId),
    [segments]
  );

  const handleChangeRow = (idx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const addRow = () =>
    setRows((prev) => [...prev, { name: "", email: "", description: "" }]);

  const removeRow = (idx) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) return [{ name: "", email: "", description: "" }];
      return next;
    });
  };

  const validate = () => {
    if (!selectedSegmentId) {
      setFormError("Please select a list");
      return false;
    }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.name.trim()) {
        setFormError(`Row ${i + 1}: Name is required`);
        return false;
      }
      if (!r.email.trim()) {
        setFormError(`Row ${i + 1}: Email is required`);
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
        setFormError(`Row ${i + 1}: Invalid email`);
        return false;
      }
      if (r.description && r.description.length > 1000) {
        setFormError(`Row ${i + 1}: Description too long`);
        return false;
      }
    }
    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      setNotification((n) => ({ ...n, isVisible: false }));
      await outreachApi.bulkCreateContacts(selectedSegmentId, rows);
      setNotification({
        isVisible: true,
        type: "success",
        message: "Contacts added successfully",
      });
      setTimeout(() => {
        navigate("/organizer/contacts", {
          state: { segmentId: selectedSegmentId },
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to add contacts:", err);
      setFormError(
        err?.response?.data?.message ||
          "Failed to add contacts. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification((n) => ({ ...n, isVisible: false }))}
        duration={1200}
      />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Add Contacts
        </h1>
        <SecondaryButton onClick={() => navigate(-1)}>Back</SecondaryButton>
      </div>

      <div className="bg-[color:var(--color-background)] p-4 rounded-lg border border-[color:var(--color-muted)] shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segment Selector */}
          <div>
            <label className="block mb-2 text-[color:var(--color-primary-text)] font-medium">
              Select List
            </label>
            <SearchableDropdown
              options={segmentOptions}
              value={selectedSegmentId}
              onChange={(val) => setSelectedSegmentId(val)}
              placeholder={loading ? "Loading lists..." : "Choose a list"}
            />
          </div>

          {/* Error */}
          {formError && <div className=" text-red-700 ">{formError}</div>}

          {/* Contact Rows */}
          <div className="space-y-4">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[color:var(--color-surface)] p-3 rounded border border-[color:var(--color-muted)]"
              >
                <div>
                  <label className="block text-sm mb-1 text-[color:var(--color-primary-text)]">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border border-[color:var(--color-muted)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
                    value={row.name}
                    onChange={(e) =>
                      handleChangeRow(idx, "name", e.target.value)
                    }
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[color:var(--color-primary-text)]">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded border border-[color:var(--color-muted)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
                    value={row.email}
                    onChange={(e) =>
                      handleChangeRow(idx, "email", e.target.value)
                    }
                    placeholder="example@mail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[color:var(--color-primary-text)]">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border border-[color:var(--color-muted)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
                    value={row.description}
                    onChange={(e) =>
                      handleChangeRow(idx, "description", e.target.value)
                    }
                    placeholder="Notes"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <SecondaryButton type="button" onClick={() => removeRow(idx)}>
                    Remove
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <div className="flex justify-between">
            <SecondaryButton type="button" onClick={addRow}>
              Add another contact
            </SecondaryButton>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <PrimaryButton type="submit" disabled={saving || loading}>
              {saving ? "Adding..." : "Add Contacts"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddContactsPage;
