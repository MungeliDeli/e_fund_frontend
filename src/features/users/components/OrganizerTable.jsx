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

const columns = [
  {
    key: 'logoImageUrl',
    label: 'Logo',
    render: (row) => {
      const [imgError, setImgError] = React.useState(false);
      return row.logoImageUrl && !imgError ? (
        <img
          src={row.logoImageUrl}
          alt={row.organizationShortName + ' logo'}
          className="w-10 h-10 object-contain rounded bg-white border border-[color:var(--color-muted)]"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
          {row.organizationShortName ? getInitials(row.organizationShortName) : <FiImage />}
        </div>
      );
    },
    sortable: false,
  },
  {
    key: 'organizationName',
    label: 'Name',
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-[color:var(--color-primary-text)] leading-tight">
        {row.organizationName}
      </span>
    ),
  },
  {
    key: 'organizationShortName',
    label: 'Acronym',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Verified',
    sortable: true,
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          row.status === 'VERIFIED'
            ? 'bg-[color:var(--color-primary)] text-white'
            : 'bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]'
        }`}
        style={{ minWidth: 70, display: 'inline-block', textAlign: 'center' }}
      >
        {row.status === 'VERIFIED' ? 'Verified' : 'Pending'}
      </span>
    ),
  },
  {
    key: 'active',
    label: 'Active',
    sortable: true,
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          row.active
            ? 'bg-[color:var(--color-primary)] text-white'
            : 'bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]'
        }`}
        style={{ minWidth: 70, display: 'inline-block', textAlign: 'center' }}
      >
        {row.active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs">{row.email}</span>
    ),
  },
];

function OrganizerTable({ data = [], onView, filters = {} }) {
  // Sorting state
  const [sort, setSort] = useState({ key: '', direction: 'asc' });

  // Sort handler
  const handleSort = (key, direction) => setSort({ key, direction });

  // Normalize data for new states
  const normalizedData = (data || []).map(row => ({
    ...row,
    status: row.status === true || row.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
    active: !!row.active,
  }));

  // Apply filters
  let processedData = normalizedData;
  if (filters.verified !== undefined) {
    processedData = processedData.filter(row => row.status === (filters.verified ? 'VERIFIED' : 'PENDING'));
  }
  if (filters.active !== undefined) {
    processedData = processedData.filter(row => row.active === (filters.active === true || filters.active === 'true'));
  }

  // Apply sorting
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
          onClick={() => onView?.(row.userId)}
          className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white transition-colors"
        >
          View
        </IconButton>
      )}
    />
  );
}

export default OrganizerTable; 