import React, { useState, useEffect } from "react";
import { FiPlus, FiUsers, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SearchBar from "../../../../components/SearchBar/SearchBar";
import { PrimaryButton, SecondaryButton } from "../../../../components/Buttons";
import SegmentsSidebar from "../../components/SegmentsSidebar";
import ContactsTable from "../../components/ContactsTable";
import * as outreachApi from "../../services/outreachApi";
import ContactViewModal from "../../../../components/ContactViewModal";
import ContactFormModal from "../../../../components/ContactFormModal";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";

function ContactsPage() {
  const navigate = useNavigate();
  // Sidebar: collapsed by default on mobile, open on large screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    try {
      const openOnDesktop =
        typeof window !== "undefined" && window.innerWidth >= 1024; // lg breakpoint
      setIsSidebarOpen(openOnDesktop);
    } catch (_) {}
  }, []);

  const [segments, setSegments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactsError, setContactsError] = useState(null);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch segments on component mount
  useEffect(() => {
    fetchSegments();
  }, []);

  // Fetch contacts when segment is selected
  useEffect(() => {
    if (selectedSegmentId) {
      fetchContacts(selectedSegmentId);
    } else {
      setContacts([]);
    }
  }, [selectedSegmentId]);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await outreachApi.getSegments();
      console.log("response", response.data);
      const list = response?.data?.data || response?.data || [];
      setSegments(list);

      // Auto-select first segment if available
      if (list.length > 0 && !selectedSegmentId) {
        const first = list[0];
        const id = first.segmentId || first.segment_id;
        setSelectedSegmentId(id);
      }
    } catch (err) {
      console.error("Failed to fetch segments:", err);
      setError("Failed to load segments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (segmentId) => {
    try {
      setContactsLoading(true);
      setContactsError(null);
      const response = await outreachApi.getContactsBySegment(segmentId);
      const list = response?.data?.data || response?.data || [];
      setContacts(list);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setContactsError("Failed to load contacts. Please try again.");
    } finally {
      setContactsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSegmentSelect = (segmentId) => {
    setSelectedSegmentId(segmentId);
  };

  const handleViewContact = (contact) => {
    setActiveContact(contact);
    setViewModalOpen(true);
  };

  const handleEditFromView = () => {
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleDeleteFromView = () => {
    setViewModalOpen(false);
    setDeleteModalOpen(true);
  };

  const handleSubmitEdit = async (form) => {
    if (!activeContact) return;
    try {
      setSaving(true);
      await outreachApi.updateContact(
        activeContact.contact_id || activeContact.contactId,
        {
          name: form.name,
          email: form.email,
          description: form.description,
        }
      );
      setEditModalOpen(false);
      await fetchContacts(selectedSegmentId);
    } catch (err) {
      console.error("Failed to update contact:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeContact) return;
    try {
      setSaving(true);
      await outreachApi.deleteContact(
        activeContact.contact_id || activeContact.contactId
      );
      setDeleteModalOpen(false);
      await fetchContacts(selectedSegmentId);
    } catch (err) {
      console.error("Failed to delete contact:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSegment = () => {
    // TODO: Implement add segment modal
    console.log("Add new segment");
  };

  const handleReachOut = () => {
    // TODO: Implement reach out functionality
    console.log("Reach out");
  };

  const handleMyLists = () => {
    navigate("/organizer/my-lists");
  };

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          My Contacts
        </h1>
        <div className="flex-1 min-w-[180px]">
          <SearchBar placeholder="Search..." />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <PrimaryButton
            icon={FiPlus}
            className="w-full sm:w-auto"
            onClick={handleReachOut}
          >
            Reach out
          </PrimaryButton>
          <SecondaryButton
            icon={FiUsers}
            className="w-full sm:w-auto"
            onClick={handleMyLists}
          >
            My Lists
          </SecondaryButton>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-row w-full min-h-[400px]">
        {/* Left: Contacts Table */}
        <div className="flex-1 bg-[color:var(--color-background)] rounded-l-lg border border-[color:var(--color-muted)] shadow-md p-2 sm:p-4 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[color:var(--color-primary-text)]">
                Loading segments...
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500 text-center">
                <div className="mb-2">{error}</div>
                <button
                  onClick={fetchSegments}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : segments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[color:var(--color-primary-text)] text-center">
                <div className="mb-2">No segments found</div>
                <div className="text-sm text-[color:var(--color-secondary-text)]">
                  Create your first segment to get started
                </div>
              </div>
            </div>
          ) : !selectedSegmentId ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[color:var(--color-primary-text)] text-center">
                <div className="mb-2">Select a list to view contacts</div>
                <div className="text-sm text-[color:var(--color-secondary-text)]">
                  Choose a list from the sidebar to see its contacts
                </div>
              </div>
            </div>
          ) : (
            <div className="min-w-[640px]">
              <ContactsTable
                contacts={contacts}
                onViewContact={handleViewContact}
                loading={contactsLoading}
                error={contactsError}
              />
            </div>
          )}
        </div>
        {/* Right: Lists Sidebar */}
        <div
          className={`relative ${
            isSidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 ease-in-out`}
        >
          <div
            className={`bg-[color:var(--color-background)] rounded-r-lg border-l border-[color:var(--color-muted)] shadow-md p-4 h-full ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >
            <SegmentsSidebar
              segments={segments}
              selectedSegmentId={selectedSegmentId}
              onSegmentSelect={handleSegmentSelect}
              onAddSegment={handleAddSegment}
            />
          </div>
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -left-4 top-4 bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-full p-2 shadow-md hover:bg-[color:var(--color-muted)] transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </div>

      {/* View Modal */}
      <ContactViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        contact={activeContact}
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />

      {/* Edit Modal */}
      <ContactFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        initialValues={{
          name: activeContact?.name || "",
          email: activeContact?.email || "",
          description: activeContact?.description || "",
        }}
        title="Edit Contact"
        submitText="Update"
        loading={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText={saving ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </div>
  );
}

export default ContactsPage;
