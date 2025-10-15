import React, { useEffect, useState } from "react";
import { PrimaryButton } from "../../../../../components/Buttons";
import {
  fetchPrivateOrganizationProfile,
  updatePayoutSettings,
} from "../../../services/usersApi";

export default function OrganizerPayoutSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    payoutDisplayName: "",
    payoutPhoneNumber: "",
    payoutNetwork: "mtn",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchPrivateOrganizationProfile();
        const profile = res?.data;
        console.log("Profile:", profile);
       
        if (mounted && profile) {
          setForm({
            payoutDisplayName: profile.payoutDisplayName || "",
            payoutPhoneNumber: profile.payoutPhoneNumber || "",
            payoutNetwork: profile.payoutNetwork || "mtn",
          });
        }
      } catch (e) {
        setError(e?.message || "Failed to load payout settings");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updatePayoutSettings({
        payoutDisplayName: form.payoutDisplayName,
        payoutPhoneNumber: form.payoutPhoneNumber,
        payoutNetwork: form.payoutNetwork,
      });
      setMessage("Payout settings saved");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Payout Information</h2>
      {/* Read-only summary */}
      <div className="mb-4 border rounded-lg p-3 bg-[color:var(--color-surface,#f9fafb)]">
        <div className="text-sm text-[color:var(--color-secondary-text,#6b7280)] mb-1">
          Current destination
        </div>
        <div className="text-sm">
          <span className="font-medium">
            {form.payoutDisplayName || "Not set"}
          </span>
        </div>
        <div className="text-sm">
          {(form.payoutNetwork ? form.payoutNetwork.toUpperCase() : "-") +
            " " +
            (form.payoutPhoneNumber || "-")}
        </div>
      </div>
      {message && (
        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Account Name (Label)</label>
          <input
            type="text"
            name="payoutDisplayName"
            value={form.payoutDisplayName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Church Mobile Money"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            type="tel"
            name="payoutPhoneNumber"
            value={form.payoutPhoneNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 26097xxxxxxx"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Network</label>
          <select
            name="payoutNetwork"
            value={form.payoutNetwork}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="mtn">MTN</option>
            <option value="airtel">Airtel</option>
          </select>
        </div>
        <div className="flex justify-end">
          <PrimaryButton type="submit" loading={saving} disabled={saving}>
            Save
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
