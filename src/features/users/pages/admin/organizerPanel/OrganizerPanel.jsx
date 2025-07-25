import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import SearchBar from '../../../../../components/SearchBar/SearchBar';
import { useNavigate } from 'react-router-dom';
import OrganizerTable from '../../../components/OrganizerTable';
import FilterModal from '../../../../../components/FilterModal';
import { fetchOrganizers } from '../../../services/usersApi';

function OrganizerPanel() {
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleSearch = () => {};

  const handleView = (organizerId) => {
    navigate(`/admin/organizers/${organizerId}`);
  };

  const filterOptions = [
    {
      key: 'verified',
      label: 'Verified Status',
      options: [
        { value: 'true', label: 'Verified' },
        { value: 'false', label: 'Not Verified' }
      ]
    },
    {
      key: 'active',
      label: 'Active Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrganizers(filters)
      .then(setOrganizers)
      .catch((err) => setError(err.message || 'Failed to fetch organizers'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)]">Organizers</h1>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
            <SearchBar placeholder="Search..." value={""} onChange={handleSearch} />
        </div>
        {/* Controls:  Filter, Add */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Filter Button */}
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={handleFilter}
            type="button"
          >
            <FiFilter className="text-lg" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {/* Add Organizer Button */}
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium hover:bg-green-700 transition-colors"
            onClick={() => navigate('/admin/organizers/add')}
            type="button"
          >
            <FiPlus className="text-lg" />
            <span className="hidden sm:inline">Add Organizer</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md min-h-[120px]">
        {loading ? (
          <div className="text-center text-[color:var(--color-secondary-text)] py-8">Loading organizers...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <OrganizerTable 
            data={organizers}
            onView={handleView}
            filters={filters}
          />
        )}
      </div>
      
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

export default OrganizerPanel;
