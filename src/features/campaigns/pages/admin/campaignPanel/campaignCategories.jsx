import React, { useState, useEffect } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "../../../../../components/Buttons";
import Table from "../../../../../components/Table";
import {
  FiPlus,
  FiEye,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import FormField from "../../../../../components/FormField";
import { FiX } from "react-icons/fi";
import SearchBar from "../../../../../components/SearchBar/SearchBar";
import FilterModal from "../../../../../components/FilterModal";
import {
  TotalStatsCard,
  PieStatsCard,
} from "../../../../../components/StatsCards";
import * as categoriesApi from "../../../../../features/campaigns/services/categoriesApi";

function CampaignCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [addFormError, setAddFormError] = useState({});
  const [editFormError, setEditFormError] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [showStats, setShowStats] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesApi.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and search
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      !searchTerm ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filters.isActive === undefined || category.isActive === filters.isActive;

    return matchesSearch && matchesFilter;
  });

  const openAddModal = () => {
    setAddForm({ name: "", description: "", isActive: true });
    setAddFormError({});
    setIsAddModalOpen(true);
  };
  const closeAddModal = () => setIsAddModalOpen(false);

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedCategory(null);
    setIsViewModalOpen(false);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setEditFormError({});
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedCategory(null);
    setEditForm({ name: "", description: "", isActive: true });
    setIsEditModalOpen(false);
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!addForm.name.trim()) errors.name = "Name is required";
    if (Object.keys(errors).length) {
      setAddFormError(errors);
      return;
    }

    try {
      setLoading(true);
      await categoriesApi.createCategory(addForm);
      closeAddModal();
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error("Failed to create category:", err);
      if (err.response?.data?.message) {
        setAddFormError({ general: err.response.data.message });
      } else {
        setAddFormError({
          general: "Failed to create category. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    if (Object.keys(errors).length) {
      setEditFormError(errors);
      return;
    }

    try {
      setLoading(true);
      await categoriesApi.updateCategory(selectedCategory.categoryId, editForm);
      closeEditModal();
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error("Failed to update category:", err);
      if (err.response?.data?.message) {
        setEditFormError({ general: err.response.data.message });
      } else {
        setEditFormError({
          general: "Failed to update category. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? "bg-[color:var(--color-primary)] text-white"
              : "bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)]"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Filter options for FilterModal
  const filterOptions = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Categories
        </h1>
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <SecondaryButton
            icon={FiFilter}
            onClick={handleFilter}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
          <PrimaryButton icon={FiPlus} onClick={openAddModal}>
            Add Category
          </PrimaryButton>
        </div>
      </div>

      {/* Stats Cards Section with Toggle Button on Top */}
      <div className="mb-6 w-full">
        {/* Top Row: Toggle Button aligned right */}
        <div className="flex justify-end mb-2 w-full">
          <button
            className="flex items-center gap-1 px-3 py-2 border border-[color:var(--color-muted)] rounded bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={() => setShowStats((prev) => !prev)}
            aria-label={showStats ? "Hide stats" : "Show stats"}
            type="button"
          >
            {showStats ? <FiChevronUp /> : <FiChevronDown />}
            <span className=" text-xs font-medium">
              {showStats ? "Hide Stats" : "Show Stats"}
            </span>
          </button>
        </div>
        {/* Bottom Row: Stats Cards (responsive) */}
        {showStats && (
          <div className="flex flex-col sm:flex-row gap-6 w-full w-full">
            <TotalStatsCard
              title="Total Categories"
              value={categories.length}
              icon={FiPlus}
              iconColor="#43e97b"
              className="flex-1"
            />
            <PieStatsCard
              title1="Active"
              value1={categories.filter((cat) => cat.isActive).length}
              icon1={FiCheckCircle}
              color1="#43e97b"
              label1="Active"
              title2="Inactive"
              value2={categories.filter((cat) => !cat.isActive).length}
              icon2={FiXCircle}
              color2="#f87171"
              label2="Inactive"
              className="flex-1"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md min-h-[120px]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-[color:var(--color-secondary-text)]">
              Loading categories...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-[color:var(--color-secondary-text)]">
              {categories.length === 0
                ? "No categories found."
                : "No categories match your search/filter."}
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredCategories}
            scrollable={true}
            rowAction={(category) => (
              <IconButton
                onClick={() => openViewModal(category)}
                className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white transition-colors"
                aria-label="View"
              >
                View
              </IconButton>
            )}
          />
        )}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-muted)]">
              <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                Add Category
              </h2>
              <button
                onClick={closeAddModal}
                className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
              >
                <FiX className="text-xl text-[color:var(--color-primary-text)]" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-4 space-y-4">
              {addFormError.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {addFormError.general}
                </div>
              )}
              <FormField
                label="Name"
                name="name"
                value={addForm.name}
                onChange={handleAddFormChange}
                required
                error={addFormError.name}
              />
              <FormField
                label="Description"
                name="description"
                value={addForm.description}
                onChange={handleAddFormChange}
                type="text"
                placeholder="Description (optional)"
              />
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={addForm.isActive}
                  onChange={handleAddFormChange}
                  className="accent-[color:var(--color-primary)]"
                />
                <label
                  htmlFor="isActive"
                  className="text-[color:var(--color-primary-text)] text-sm"
                >
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton onClick={closeAddModal} type="button">
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] p-4 rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-muted)]">
              <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                Category Details
              </h2>
              <button
                onClick={closeViewModal}
                className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
              >
                <FiX className="text-xl text-[color:var(--color-primary-text)]" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <span className="font-medium">Name: </span>
                {selectedCategory.name}
              </div>
              <div>
                <span className="font-medium">Description: </span>
                {selectedCategory.description || (
                  <span className="italic text-[color:var(--color-secondary-text)]">
                    No description
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium">Status: </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCategory.isActive
                      ? "bg-[color:var(--color-primary)] text-white"
                      : "bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)]"
                  }`}
                >
                  {selectedCategory.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="flex justify-end items-center gap-2 p-4">
              <SecondaryButton
                onClick={() => openEditModal(selectedCategory)}
                type="button"
                disabled={loading}
              >
                Edit
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] p-4 rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-muted)]">
              <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                Edit Category
              </h2>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
              >
                <FiX className="text-xl text-[color:var(--color-primary-text)]" />
              </button>
            </div>
            <form onSubmit={handleEditCategory} className="p-4 space-y-4">
              {editFormError.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {editFormError.general}
                </div>
              )}
              <FormField
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
                required
                error={editFormError.name}
              />
              <FormField
                label="Description"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                type="text"
                placeholder="Description (optional)"
              />
              <div className="flex items-center gap-2">
                <input
                  id="editIsActive"
                  name="isActive"
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={handleEditFormChange}
                  className="accent-[color:var(--color-primary)]"
                />
                <label
                  htmlFor="editIsActive"
                  className="text-[color:var(--color-primary-text)] text-sm"
                >
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton onClick={closeEditModal} type="button">
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
      />
    </div>
  );
}

export default CampaignCategories;
