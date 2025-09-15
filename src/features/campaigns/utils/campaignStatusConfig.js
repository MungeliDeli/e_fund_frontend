import {
  FiEdit2,
  FiClock,
  FiCheckCircle,
  FiPlayCircle,
  FiCheckSquare,
  FiStopCircle,
  FiXCircle,
} from "react-icons/fi";
import { STATUS_COLORS } from "../../../components/StatusBadge";

// Shared campaign status configuration
export const campaignStatuses = [
 
  {
    key: "pendingApproval",
    label: "Pending Approval",
    icon: FiClock,
    color: STATUS_COLORS.pendingApproval,
  },
  {
    key: "pendingStart",
    label: "Pending Start",
    icon: FiClock,
    color: STATUS_COLORS.pendingStart,
  },
  {
    key: "active",
    label: "Active",
    icon: FiPlayCircle,
    color: STATUS_COLORS.active,
  },
  {
    key: "successful",
    label: "Successful",
    icon: FiCheckSquare,
    color: STATUS_COLORS.successful,
  },
  {
    key: "closed",
    label: "Closed",
    icon: FiStopCircle,
    color: STATUS_COLORS.closed,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: FiXCircle,
    color: STATUS_COLORS.cancelled,
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: FiXCircle,
    color: STATUS_COLORS.rejected,
  },
];

// Create a map for easy lookup
export const statusConfigMap = campaignStatuses.reduce((acc, status) => {
  acc[status.key] = status;
  return acc;
}, {});

// Get status color with opacity for badges
export const getStatusColor = (statusKey) => {
  const status = statusConfigMap[statusKey];
  if (status && status.color) return status.color;
  // Fall back to StatusBadge colors to keep consistency
  return STATUS_COLORS[statusKey] || "#6b7280";
};

// Get status display name
export const getStatusDisplay = (statusKey) => {
  const status = statusConfigMap[statusKey];
  return status ? status.label : statusKey;
};
