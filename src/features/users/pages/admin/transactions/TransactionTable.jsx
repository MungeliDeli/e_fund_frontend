import React, { useState, useMemo } from "react";
import Table from "../../../../../components/Table";

function TransactionTable({ data = [], onSort, sort }) {
  const columns = useMemo(
    () => [
      {
        key: "transactionTimestamp",
        label: "Time Created",
        sortable: true,
        render: (row) => (
          <span className="text-sm text-[color:var(--color-primary-text)]">
            {new Date(row.transactionTimestamp).toLocaleString()}
          </span>
        ),
      },
      {
        key: "userEmail",
        label: "User Email",
        sortable: true,
        render: (row) => (
          <span className="text-sm text-[color:var(--color-primary-text)]">
            {row.userEmail || "Anonymous"}
          </span>
        ),
      },
      {
        key: "campaignName",
        label: "Campaign",
        sortable: true,
        render: (row) => (
          <span className="text-sm text-[color:var(--color-primary-text)] font-medium">
            {row.campaignName || "Unknown Campaign"}
          </span>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        render: (row) => (
          <span className="text-sm font-semibold text-[color:var(--color-primary-text)]">
            {row.currency} {parseFloat(row.amount).toLocaleString()}
          </span>
        ),
      },
      {
        key: "gatewayUsed",
        label: "Gateway",
        sortable: true,
        render: (row) => (
          <span className="text-sm text-[color:var(--color-primary-text)]">
            {row.gatewayUsed}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (row) => {
          const statusColors = {
            succeeded: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
            pending: "bg-yellow-100 text-yellow-800",
            refunded: "bg-gray-100 text-gray-800",
          };

          return (
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                statusColors[row.status] || "bg-gray-100 text-gray-800"
              }`}
              style={{
                minWidth: 70,
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={data}
      onSort={onSort}
      sort={sort}
      scrollable={true}
    />
  );
}

export default TransactionTable;
