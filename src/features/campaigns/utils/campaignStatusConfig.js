import {
  FiEdit2,
  FiClock,
  FiCheckCircle,
  FiPlayCircle,
  FiCheckSquare,
  FiStopCircle,
  FiXCircle,
} from "react-icons/fi";

// Shared campaign status configuration
export const campaignStatuses = [
  { key: "draft", label: "Draft", icon: FiEdit2, color: "#60a5fa" },
  {
    key: "pendingApproval",
    label: "Pending Approval",
    icon: FiClock,
    color: "#facc15",
  },
  {
    key: "pendingStart",
    label: "Pending Start",
    icon: FiClock,
    color: "#f59e0b",
  },
  { key: "active", label: "Active", icon: FiPlayCircle, color: "#3b82f6" },
  {
    key: "successful",
    label: "Successful",
    icon: FiCheckSquare,
    color: "#10b981",
  },
  { key: "closed", label: "Closed", icon: FiStopCircle, color: "#6b7280" },
  { key: "cancelled", label: "Cancelled", icon: FiXCircle, color: "#ef4444" },
  { key: "rejected", label: "Rejected", icon: FiXCircle, color: "#f87171" },
];

// Create a map for easy lookup
export const statusConfigMap = campaignStatuses.reduce((acc, status) => {
  acc[status.key] = status;
  return acc;
}, {});

// Get status color with opacity for badges
export const getStatusColor = (statusKey) => {
  const status = statusConfigMap[statusKey];
  return status ? status.color : "#6b7280"; // Default gray
};

// Get status display name
export const getStatusDisplay = (statusKey) => {
  const status = statusConfigMap[statusKey];
  return status ? status.label : statusKey;
};
