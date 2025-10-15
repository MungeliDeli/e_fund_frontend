import React, { useState, useMemo } from "react";
import Table from "../../../../../components/Table";

function AuditLogsTable({ data = [], onViewDetails }) {
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  const handleSort = (key, direction) => setSort({ key, direction });

  const columns = useMemo(
    () => [
      { key: "timestamp", label: "Timestamp", sortable: true },
      {
        key: "userDisplayName",
        label: "User",
        sortable: true,
        render: (row) => (
          <span className="text-sm text-[color:var(--color-primary-text)]">
            {row.userDisplayName || row.userId || "System"}
          </span>
        ),
      },
      { key: "actionType", label: "Action Type", sortable: true },
      { key: "entityType", label: "Entity Type", sortable: true },
      { key: "entityId", label: "Entity ID", sortable: true },
      {
        key: "details",
        label: "Details",
        sortable: false,
        render: (row) => (
          <button
            onClick={() => onViewDetails?.(row)}
            className="px-3 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:bg-[color:var(--color-muted)] transition-colors"
          >
            View
          </button>
        ),
      },
    ],
    [onViewDetails]
  );

  // Client-side sort is only visual; real sorting is server-side via props.
  // We still feed sort into Table for UI arrows and to notify parent when used there if needed.

  return (
    <Table
      columns={columns}
      data={data}
      onSort={handleSort}
      sort={sort}
      scrollable={true}
    />
  );
}

export default AuditLogsTable;
