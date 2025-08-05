import React from "react";

/**
 * Generic Table component
 * @param {Array} columns - [{ key, label, sortable, render? }]
 * @param {Array} data - Array of row objects
 * @param {Function} onSort - (key, direction) => void
 * @param {Object} sort - { key, direction }
 * @param {Function} rowAction - (row) => ReactNode
 * @param {boolean} scrollable - Enable scrolling for table
 * @param {string} className - Additional CSS classes
 */
function Table({
  columns,
  data,
  onSort,
  sort,
  rowAction,
  scrollable = false,
  rowClassName,
  className = "",
}) {
  const handleSort = (key) => {
    if (!onSort) return;
    const direction =
      sort?.key === key && sort.direction === "asc" ? "desc" : "asc";
    onSort(key, direction);
  };

  return (
    <div
      className={`w-full ${
        scrollable ? "h-full overflow-y-auto hide-scrollbar" : "overflow-x-auto"
      } ${className}`}
    >
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-[color:var(--color-background)] sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-semibold text-[color:var(--color-primary-text)] whitespace-nowrap bg-[color:var(--color-background)] ${
                  col.sortable
                    ? "select-none cursor-pointer hover:bg-[color:var(--color-surface)] transition-colors"
                    : ""
                }`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span>{col.label}</span>
                {col.sortable && sort?.key === col.key && (
                  <span className="ml-1 align-middle">
                    {sort.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
            {rowAction && (
              <th className="px-4 py-3 bg-[color:var(--color-background)]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowAction ? 1 : 0)}
                className="text-center py-8 text-[color:var(--color-secondary-text)] bg-[color:var(--color-background)]"
              >
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`${
                  idx % 2 === 0
                    ? "bg-[color:var(--color-surface)]"
                    : "bg-[color:var(--color-background)]"
                } ${rowClassName || ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-[color:var(--color-primary-text)] whitespace-nowrap"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {rowAction && <td className="px-4 py-3">{rowAction(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
