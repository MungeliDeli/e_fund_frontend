import React, { useEffect, useMemo, useState } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "../../../../components/Buttons";
import SearchBar from "../../../../components/SearchBar/SearchBar";
import { TotalStatsCard } from "../../../../components/StatsCards";
import { FiPlus, FiUserPlus } from "react-icons/fi";
import Table from "../../../../components/Table";
import * as outreachApi from "../../services/outreachApi";
import EntityFormModal from "../../../../components/EntityFormModal";
import EntityViewModal from "../../../../components/EntityViewModal";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import Notification from "../../../../components/Notification";

function MyListsPage() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    type: "success",
    message: "",
    isVisible: false,
  });

  // View/Edit/Delete modals
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteBlockedOpen, setDeleteBlockedOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);

  const showToast = (type, message) =>
    setToast({ type, message, isVisible: true });
  const hideToast = () => setToast((t) => ({ ...t, isVisible: false }));

  useEffect(() => {
    fetchSegmentsWithMetrics();
  }, []);

  const fetchSegmentsWithMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const segRes = await outreachApi.getSegments();
      const baseSegments = segRes?.data?.data || segRes?.data || [];

      // Fetch contacts per segment to compute total emails opened
      const withMetrics = await Promise.all(
        baseSegments.map(async (s) => {
          const id = s.segmentId;
          try {
            const cRes = await outreachApi.getContactsBySegment(id);
            const contacts = cRes?.data?.data || cRes?.data || [];
            const totalOpens = contacts.reduce(
              (sum, c) => sum + (Number(c.emails_opened) || 0),
              0
            );
            return {
              ...s,
              segmentId: id,
              contactCount: s.contactCount || contacts.length,
              emailsOpenedTotal: totalOpens,
            };
          } catch (_) {
            return {
              ...s,
              segmentId: id,
              contactCount: s.contactCount || 0,
              emailsOpenedTotal: 0,
            };
          }
        })
      );

      setSegments(withMetrics);
    } catch (err) {
      console.error("Failed to fetch lists:", err);
      setError("Failed to load lists. Please try again.");
      setSegments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return segments.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(lower) ||
        (s.description || "").toLowerCase().includes(lower)
    );
  }, [segments, searchTerm]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "contactCount",
      label: "Contacts",
      render: (row) => <span>{row.contactCount || 0}</span>,
    },
    {
      key: "emailsOpenedTotal",
      label: "Emails Opened",
      render: (row) => <span>{row.emailsOpenedTotal || 0}</span>,
    },
  ];

  const handleOpenAdd = () => setIsAddModalOpen(true);
  const handleCloseAdd = () => setIsAddModalOpen(false);

  const handleAddSubmit = async (form) => {
    try {
      setSaving(true);
      await outreachApi.createSegment({
        name: form.name,
        description: form.description || "",
      });
      handleCloseAdd();
      await fetchSegmentsWithMetrics();
      showToast("success", "List created successfully");
    } catch (err) {
      // Bubble up to modal via throw for friendly display
      const message = err?.response?.data?.message || "Failed to create list.";
      showToast("error", message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleRowView = (segment) => {
    setActiveSegment(segment);
    setViewOpen(true);
  };

  const handleEditSubmit = async (form) => {
    if (!activeSegment) return;
    try {
      setSaving(true);
      const id = activeSegment.segmentId;
      await outreachApi.updateSegment(id, {
        name: form.name,
        description: form.description || "",
      });
      setEditOpen(false);
      await fetchSegmentsWithMetrics();
      showToast("success", "List updated successfully");
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update list.";
      showToast("error", message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const onDeleteRequest = () => {
    if (!activeSegment) return;
    const count = activeSegment.contactCount || 0;
    if (count > 0) {
      setDeleteBlockedOpen(true);
    } else {
      setDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeSegment) return;
    try {
      setSaving(true);
      const id = activeSegment.segmentId;
      await outreachApi.deleteSegment(id);
      setDeleteConfirmOpen(false);
      setViewOpen(false);
      await fetchSegmentsWithMetrics();
      showToast("success", "List deleted successfully");
    } catch (err) {
      // If backend blocks due to contacts, show blocked message instead
      const message = err?.response?.data?.message || "Failed to delete list.";
      if (message.toLowerCase().includes("contact")) {
        setDeleteConfirmOpen(false);
        setDeleteBlockedOpen(true);
        showToast("error", "Cannot delete list with contacts");
      } else {
        showToast("error", message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <Notification
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          My Lists
        </h1>
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search lists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <SecondaryButton
            icon={FiUserPlus}
            onClick={() => navigate("/organizer/add-contacts")}
            className="w-full sm:w-auto"
          >
            Add New Contact
          </SecondaryButton>
          <PrimaryButton icon={FiPlus} onClick={handleOpenAdd}>
            Add New List
          </PrimaryButton>
        </div>
      </div>

      {/* Stats with Toggle */}
      <div className="mb-6 w-full">
        <div className="flex justify-end mb-2 w-full">
          <button
            className="flex items-center gap-1 px-3 py-2 border border-[color:var(--color-muted)] rounded bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={() => setShowStats((prev) => !prev)}
            aria-label={showStats ? "Hide stats" : "Show stats"}
            type="button"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
        </div>
        {showStats && (
          <div className="flex flex-col sm:flex-row gap-6 w-full w-full">
            <TotalStatsCard
              title="Total Lists"
              value={segments.length}
              icon={FiPlus}
              iconColor="#43e97b"
              className="flex-1"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md flex-1 min-h-0"
        style={{
          height: showStats
            ? "calc(100vh - 400px - 2rem)"
            : "calc(100vh - 180px - 2rem)",
          maxHeight: showStats
            ? "calc(100vh - 400px - 2rem)"
            : "calc(100vh - 180px - 2rem)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-[color:var(--color-secondary-text)]">
              Loading lists...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-[color:var(--color-secondary-text)]">
              {segments.length === 0
                ? "No lists found."
                : "No lists match your search."}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <Table
              columns={columns}
              data={filtered}
              scrollable={true}
              rowAction={(segment) => (
                <SecondaryButton
                  onClick={() => handleRowView(segment)}
                  className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white transition-colors"
                  aria-label="View"
                >
                  View
                </SecondaryButton>
              )}
            />
          </div>
        )}
      </div>

      {/* Add List Modal */}
      <EntityFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAdd}
        onSubmit={handleAddSubmit}
        title="Add New List"
        submitText={saving ? "Saving..." : "Add"}
        loading={saving}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", required: false },
        ]}
        initialValues={{ name: "", description: "" }}
        validate={(form) => {
          const err = {};
          if (!form.name || !form.name.trim()) err.name = "Name is required";
          if (form.description && form.description.length > 1000)
            err.description = "Description too long";
          return err;
        }}
      />

      {/* View Modal */}
      <EntityViewModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title="List Details"
        footer={
          <>
            <SecondaryButton
              onClick={() => {
                setViewOpen(false);
                setEditOpen(true);
              }}
            >
              Edit
            </SecondaryButton>
            <PrimaryButton onClick={onDeleteRequest}>Delete</PrimaryButton>
          </>
        }
      >
        {activeSegment && (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name: </span>
              <span>{activeSegment.name}</span>
            </div>
            <div>
              <span className="font-medium">Description: </span>
              {activeSegment.description ? (
                <span>{activeSegment.description}</span>
              ) : (
                <span className="italic text-[color:var(--color-secondary-text)]">
                  No description
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Contacts: </span>
              <span>{activeSegment.contactCount || 0}</span>
            </div>
            <div>
              <span className="font-medium">Emails Opened: </span>
              <span>{activeSegment.emailsOpenedTotal || 0}</span>
            </div>
          </div>
        )}
      </EntityViewModal>

      {/* Edit Modal */}
      <EntityFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit List"
        submitText={saving ? "Updating..." : "Update"}
        loading={saving}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", required: false },
        ]}
        initialValues={{
          name: activeSegment?.name || "",
          description: activeSegment?.description || "",
        }}
        validate={(form) => {
          const err = {};
          if (!form.name || !form.name.trim()) err.name = "Name is required";
          if (form.description && form.description.length > 1000)
            err.description = "Description too long";
          return err;
        }}
      />

      {/* Delete Blocked Info */}
      <ConfirmationModal
        isOpen={deleteBlockedOpen}
        onClose={() => setDeleteBlockedOpen(false)}
        onConfirm={() => setDeleteBlockedOpen(false)}
        title="Cannot Delete List"
        message="This list has contacts. Please delete all contacts in the list before deleting the list."
        confirmText="Close"
        cancelText=""
      />

      {/* Delete Confirm */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete List"
        message="Are you sure you want to delete this list? This action cannot be undone."
        confirmText={saving ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </div>
  );
}

export default MyListsPage;
