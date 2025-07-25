import React, { useState } from 'react';
import Table from '../../../components/Table';
import { IconButton } from '../../../components/Buttons';
import { FiEye, FiImage } from 'react-icons/fi';

function getInitials(name) {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return words[0][0]?.toUpperCase() || '';
  return (words[0][0] + words[1][0]).toUpperCase();
}

const statusColors = {
  approved: 'bg-[color:var(--color-primary)] text-white',
  pending: 'bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]',
  draft: 'bg-blue-200 text-blue-800',
  active: 'bg-yellow-200 text-yellow-800',
  successful: 'bg-emerald-200 text-emerald-800',
  closed: 'bg-red-200 text-red-800',
  cancelled: 'bg-red-200 text-red-800',
};

const columns = [
  {
    key: 'logoImageUrl',
    label: 'Logo',
    render: (row) => {
      const [imgError, setImgError] = React.useState(false);
      return row.logoImageUrl && !imgError ? (
        <img
          src={row.logoImageUrl}
          alt={row.title + ' logo'}
          className="w-10 h-10 object-contain rounded bg-white border border-[color:var(--color-muted)]"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
          {row.title ? getInitials(row.title) : <FiImage />}
        </div>
      );
    },
    sortable: false,
  },
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-[color:var(--color-primary-text)] leading-tight">
        {row.title}
      </span>
    ),
  },
  {
    key: 'organizerName',
    label: 'Organizer',
    sortable: true,
  },
  {
    key: 'categoryName',
    label: 'Category',
    sortable: true,
  },
  {
    key: 'currentRaisedAmount',
    label: 'Raised',
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs">${row.currentRaisedAmount?.toLocaleString() || '0.00'}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (row) => {
      const status = (row.status || '').toLowerCase();
      const color = statusColors[status] || 'bg-gray-200 text-gray-800';
      // Map status for display
      const display = {
        approved: 'Approved',
        pending: 'Pending',
        draft: 'Draft',
        active: 'Active',
        successful: 'Successful',
        closed: 'Closed',
        cancelled: 'Cancelled',
      }[status] || status;
      return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${color}`} style={{ minWidth: 70, display: 'inline-block', textAlign: 'center' }}>
          {display.charAt(0).toUpperCase() + display.slice(1)}
        </span>
      );
    },
  },
];

function CampaignTable({ data = [], onView, filters = {} }) {
  const [sort, setSort] = useState({ key: '', direction: 'asc' });

  // Sort handler
  const handleSort = (key, direction) => setSort({ key, direction });

  // Normalize data (future: add more normalization if needed)
  const normalizedData = (data || []);

  // Apply sorting
  let processedData = normalizedData;
  if (sort.key) {
    processedData = [...processedData].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <Table
      columns={columns}
      data={processedData}
      onSort={handleSort}
      sort={sort}
      scrollable={true}
      rowAction={(row) => (
        <IconButton
          icon={FiEye}
          onClick={() => onView?.(row.campaignId)}
          className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white transition-colors"
        >
          View
        </IconButton>
      )}
    />
  );
}

export default CampaignTable; 