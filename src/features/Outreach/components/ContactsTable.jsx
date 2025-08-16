import React, { useState, useEffect, useMemo } from "react";
import { FiEye } from "react-icons/fi";
import Table from "../../../components/Table";
import SearchBar from "../../../components/SearchBar/SearchBar";

function ContactsTable({ contacts, onViewContact, loading, error }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          (contact.name || "").toLowerCase().includes(lower) ||
          (contact.email || "").toLowerCase().includes(lower) ||
          (contact.description &&
            contact.description.toLowerCase().includes(lower))
      );
      setFilteredContacts(filtered);
    }
  }, [contacts, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key, direction) => setSort({ key, direction });

  // Apply sorting to filtered contacts
  const processedData = useMemo(() => {
    if (!sort.key) return filteredContacts;
    const list = [...filteredContacts];

    return list.sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];

      // Numeric compare if both are numbers (or numeric strings)
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      const bothNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);

      if (bothNumeric) {
        if (aNum < bNum) return sort.direction === "asc" ? -1 : 1;
        if (aNum > bNum) return sort.direction === "asc" ? 1 : -1;
        return 0;
      }

      // Fallback to string compare
      aVal = (aVal ?? "").toString().toLowerCase();
      bVal = (bVal ?? "").toString().toLowerCase();
      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredContacts, sort]);

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "description", label: "Description" },
    { key: "emailsOpened", label: "Emails Open", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => onViewContact(row)}
          className="px-3 py-1 text-sm bg-[color:var(--color-primary)] text-white rounded hover:bg-[color:var(--color-accent)] transition-colors flex items-center gap-1"
        >
          <FiEye className="text-xs" />
          View
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-[color:var(--color-primary-text)]">
          Loading contacts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 text-center">
          <div className="mb-2">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-w-[600px]">
      {/* Search Bar */}
      <div className="mb-3 sm:mb-4">
        <SearchBar
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        {processedData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[color:var(--color-primary-text)] text-center">
              <div className="mb-2">
                {searchTerm
                  ? "No contacts match your search"
                  : "No contacts found"}
              </div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Add contacts to get started"}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <Table
              columns={columns}
              data={processedData}
              scrollable={true}
              onSort={handleSort}
              sort={sort}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactsTable;
