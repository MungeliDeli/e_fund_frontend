import React, { useState } from "react";
import { FiChevronUp, FiChevronDown, FiMoreHorizontal } from "react-icons/fi";
import { SecondaryButton } from "../../../components/Buttons";

const WithdrawalTable = ({
  data = [],
  onAction,
  onSort,
  sortField,
  sortDirection,
  loading = false,
  isAdmin = false,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "ZMW",
      }).format(amount);
    } catch {
      return `K${Number(amount).toFixed(2)}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-blue-600 bg-blue-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "processing":
        return "text-purple-600 bg-purple-100";
      case "paid":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const SortButton = ({ field, children }) => {
    const isActive = sortField === field;
    const direction = isActive ? sortDirection : null;

    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-left font-medium text-[color:var(--color-primary-text)] hover:text-[color:var(--color-primary)] transition-colors"
      >
        {children}
        {isActive &&
          (direction === "asc" ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          ))}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-[color:var(--color-primary-text)]">
          Loading withdrawals...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-[color:var(--color-primary-text)] text-center">
          <div className="mb-2">No withdrawal requests found</div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">
            No withdrawal requests match your current filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[color:var(--color-muted)]">
            <th className="text-left py-3 px-4">
              <SortButton field="campaignName">Campaign</SortButton>
            </th>
            {isAdmin && (
              <th className="text-left py-3 px-4">
                <SortButton field="organizerName">Organizer</SortButton>
              </th>
            )}
            <th className="text-left py-3 px-4">
              <SortButton field="amount">Amount</SortButton>
            </th>
            <th className="text-left py-3 px-4">
              <SortButton field="status">Status</SortButton>
            </th>
            <th className="text-left py-3 px-4">Destination</th>
            <th className="text-left py-3 px-4">
              <SortButton field="createdAt">Request Date</SortButton>
            </th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((withdrawal) => (
            <tr
              key={withdrawal.withdrawalRequestId}
              className={`border-b border-[color:var(--color-muted)] hover:bg-[color:var(--color-surface)] transition-colors ${
                hoveredRow === withdrawal.withdrawalRequestId
                  ? "bg-[color:var(--color-surface)]"
                  : ""
              }`}
              onMouseEnter={() => setHoveredRow(withdrawal.withdrawalRequestId)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="py-3 px-4">
                <div className="text-[color:var(--color-primary-text)] font-medium">
                  {withdrawal.campaignName || "N/A"}
                </div>
              </td>
              {isAdmin && (
                <td className="py-3 px-4">
                  <div className="text-[color:var(--color-primary-text)]">
                    {withdrawal.organizerName || "N/A"}
                  </div>
                </td>
              )}
              <td className="py-3 px-4">
                <div className="text-[color:var(--color-primary-text)] font-semibold">
                  {formatCurrency(withdrawal.amount)}
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    withdrawal.status
                  )}`}
                >
                  {withdrawal.status?.toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="text-[color:var(--color-primary-text)]">
                  {withdrawal.destination?.phoneNumber || "N/A"}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-[color:var(--color-primary-text)]">
                  {formatDate(withdrawal.createdAt)}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <SecondaryButton
                  icon={FiMoreHorizontal}
                  onClick={() => onAction(withdrawal)}
                  className="px-3 py-1 text-sm"
                >
                  Actions
                </SecondaryButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalTable;
