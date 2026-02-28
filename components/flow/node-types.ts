export type DiagramNodeType =
  | "process"
  | "decision"
  | "database"
  | "service"
  | "pipeline"
  | "input"
  | "output"
  | "circle"

export interface NodeTypeConfig {
  label: string
  borderColor: string
  bgColor: string
  iconBg: string
  defaultIcon: string
}

export const NODE_TYPE_CONFIGS: Record<DiagramNodeType, NodeTypeConfig> = {
  process: {
    label: "Process",
    borderColor: "#22d3ee",
    bgColor: "#ecfeff",
    iconBg: "#cffafe",
    defaultIcon: "Workflow",
  },
  decision: {
    label: "Decision",
    borderColor: "#fbbf24",
    bgColor: "#fffbeb",
    iconBg: "#fef3c7",
    defaultIcon: "HelpCircle",
  },
  database: {
    label: "Database",
    borderColor: "#3b82f6",
    bgColor: "#eff6ff",
    iconBg: "#dbeafe",
    defaultIcon: "Database",
  },
  service: {
    label: "Service",
    borderColor: "#22c55e",
    bgColor: "#f0fdf4",
    iconBg: "#dcfce7",
    defaultIcon: "Server",
  },
  pipeline: {
    label: "Pipeline",
    borderColor: "#f97316",
    bgColor: "#fff7ed",
    iconBg: "#ffedd5",
    defaultIcon: "GitBranch",
  },
  input: {
    label: "Input",
    borderColor: "#a855f7",
    bgColor: "#faf5ff",
    iconBg: "#f3e8ff",
    defaultIcon: "LogIn",
  },
  output: {
    label: "Output",
    borderColor: "#14b8a6",
    bgColor: "#f0fdfa",
    iconBg: "#ccfbf1",
    defaultIcon: "LogOut",
  },
  circle: {
    label: "Circle",
    borderColor: "#9ca3af",
    bgColor: "#f9fafb",
    iconBg: "#f3f4f6",
    defaultIcon: "Circle",
  },
}

export const AVAILABLE_ICONS = [
  "User",
  "Users",
  "Database",
  "Server",
  "Settings",
  "Cog",
  "FileText",
  "Folder",
  "Mail",
  "Phone",
  "Calendar",
  "Clock",
  "Home",
  "Building",
  "ShoppingCart",
  "CreditCard",
  "Truck",
  "Package",
  "BarChart",
  "PieChart",
  "TrendingUp",
  "Target",
  "Search",
  "Filter",
  "Code",
  "Monitor",
  "Smartphone",
  "Wifi",
  "Cloud",
  "Shield",
  "Heart",
  "Star",
  "Flag",
  "Bell",
  "MessageCircle",
  "Camera",
  "Workflow",
  "HelpCircle",
  "GitBranch",
  "LogIn",
  "LogOut",
  "Circle",
  "Network",
  "Layers",
  "Zap",
  "Globe",
  "Lock",
  "Key",
  "Activity",
  "Cpu",
  "HardDrive",
  "Terminal",
  "FileCode",
  "GitCommit",
  "Boxes",
  "Container",
] as const

export type AvailableIcon = (typeof AVAILABLE_ICONS)[number]
