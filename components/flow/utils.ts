import type { Node, Edge } from "@xyflow/react"
import type { DiagramNodeType } from "./node-types"
import { NODE_TYPE_CONFIGS } from "./node-types"

export interface DiagramNodeData {
  id: string
  type: DiagramNodeType
  label: string
  description?: string
  icon?: string
  image?: string
  cluster?: string
  tags?: string[]
  // Visual overrides (set via click-to-edit, not JSON)
  borderColor?: string
  bgColor?: string
  dashedBorder?: boolean
}

export interface DiagramConnection {
  from: string
  to: string
  label?: string
  animated?: boolean
  dashed?: boolean
}

export interface DiagramCluster {
  id: string
  name: string
  color?: string
  dashedBorder?: boolean
}

export interface DiagramData {
  nodes: DiagramNodeData[]
  connections: DiagramConnection[]
  clusters?: DiagramCluster[]
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 80
const DECISION_SIZE = 120
const CIRCLE_SIZE = 90
const H_SPACING = 280
const V_SPACING = 140
const CLUSTER_PADDING = 60

export function convertToFlowElements(data: DiagramData): {
  nodes: Node[]
  edges: Edge[]
} {
  const { nodes: diagramNodes, connections, clusters = [] } = data

  // Group nodes by cluster
  const clusterGroups: Record<string, DiagramNodeData[]> = {}
  const unclusteredNodes: DiagramNodeData[] = []

  diagramNodes.forEach((node) => {
    if (node.cluster) {
      if (!clusterGroups[node.cluster]) clusterGroups[node.cluster] = []
      clusterGroups[node.cluster].push(node)
    } else {
      unclusteredNodes.push(node)
    }
  })

  const flowNodes: Node[] = []
  let currentX = 80
  let currentY = 80

  // Place cluster group nodes
  const clusterEntries = Object.entries(clusterGroups)
  clusterEntries.forEach(([clusterId, clusterNodes]) => {
    const cluster = clusters.find((c) => c.id === clusterId)
    const cols = Math.min(clusterNodes.length, Math.ceil(Math.sqrt(clusterNodes.length)))

    // Calculate cluster bounds
    const rows = Math.ceil(clusterNodes.length / cols)
    const clusterWidth = cols * H_SPACING + CLUSTER_PADDING * 2
    const clusterHeight = rows * V_SPACING + CLUSTER_PADDING * 2 + 30 // +30 for cluster label

    // Add cluster group node
    flowNodes.push({
      id: `cluster-${clusterId}`,
      type: "group",
      position: { x: currentX, y: currentY },
      style: {
        width: clusterWidth,
        height: clusterHeight,
        backgroundColor: cluster?.color || "#f1f5f9",
        borderRadius: "12px",
        border: `2px ${cluster?.dashedBorder ? "dashed" : "solid"} ${darkenColor(cluster?.color || "#f1f5f9", 0.15)}`,
        padding: "0",
      },
      data: {
        label: cluster?.name || clusterId,
        clusterData: cluster,
      },
    })

    // Add child nodes relative to parent
    clusterNodes.forEach((node, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const nodeType = node.type || "process"
      const isDecision = nodeType === "decision"
      const isCircle = nodeType === "circle"

      const w = isCircle ? CIRCLE_SIZE : isDecision ? DECISION_SIZE : NODE_WIDTH
      const h = isCircle ? CIRCLE_SIZE : isDecision ? DECISION_SIZE : NODE_HEIGHT

      const x = CLUSTER_PADDING + col * H_SPACING + (H_SPACING - w) / 2
      const y = CLUSTER_PADDING + 30 + row * V_SPACING + (V_SPACING - h) / 2

      flowNodes.push({
        id: node.id,
        type: nodeType,
        position: { x, y },
        parentId: `cluster-${clusterId}`,
        extent: "parent" as const,
        data: {
          ...node,
          borderColor: node.borderColor || NODE_TYPE_CONFIGS[nodeType]?.borderColor,
          bgColor: node.bgColor || NODE_TYPE_CONFIGS[nodeType]?.bgColor,
        },
        style: { width: w, height: h },
      })
    })

    currentX += clusterWidth + 60
    if (currentX > 1400) {
      currentX = 80
      currentY += rows * V_SPACING + CLUSTER_PADDING * 2 + 80
    }
  })

  // Place unclustered nodes
  if (unclusteredNodes.length > 0) {
    const startY = clusterEntries.length > 0 ? currentY + 60 : currentY
    let ux = 80

    unclusteredNodes.forEach((node, index) => {
      const nodeType = node.type || "process"
      const isDecision = nodeType === "decision"
      const isCircle = nodeType === "circle"

      const w = isCircle ? CIRCLE_SIZE : isDecision ? DECISION_SIZE : NODE_WIDTH
      const h = isCircle ? CIRCLE_SIZE : isDecision ? DECISION_SIZE : NODE_HEIGHT

      flowNodes.push({
        id: node.id,
        type: nodeType,
        position: {
          x: ux + (index % 4) * H_SPACING,
          y: startY + Math.floor(index / 4) * V_SPACING,
        },
        data: {
          ...node,
          borderColor: node.borderColor || NODE_TYPE_CONFIGS[nodeType]?.borderColor,
          bgColor: node.bgColor || NODE_TYPE_CONFIGS[nodeType]?.bgColor,
        },
        style: { width: w, height: h },
      })
    })
  }

  // Convert connections to edges
  const edges: Edge[] = connections.map((conn, i) => ({
    id: `e-${conn.from}-${conn.to}-${i}`,
    source: conn.from,
    target: conn.to,
    type: "smoothstep",
    animated: conn.animated || false,
    label: conn.label || undefined,
    style: {
      stroke: "#94a3b8",
      strokeWidth: 2,
      strokeDasharray: conn.dashed ? "6 3" : undefined,
    },
    markerEnd: {
      type: "arrowclosed" as const,
      color: "#94a3b8",
      width: 20,
      height: 20,
    },
    labelStyle: {
      fontSize: 12,
      fontWeight: 500,
      fill: "#64748b",
    },
    labelBgStyle: {
      fill: "#ffffff",
      fillOpacity: 0.9,
    },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 4,
  }))

  return { nodes: flowNodes, edges }
}

export function darkenColor(color: string, amount = 0.15): string {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const dr = Math.max(0, Math.floor(r * (1 - amount)))
  const dg = Math.max(0, Math.floor(g * (1 - amount)))
  const db = Math.max(0, Math.floor(b * (1 - amount)))

  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`
}

export const DEFAULT_EXAMPLE: DiagramData = {
  nodes: [
    {
      id: "client",
      type: "input",
      label: "Client App",
      icon: "Monitor",
      cluster: "frontend",
      tags: ["React", "SPA"],
    },
    {
      id: "auth-server",
      type: "service",
      label: "Auth Server",
      icon: "Shield",
      cluster: "auth",
      tags: ["OAuth"],
    },
    {
      id: "jwt-service",
      type: "process",
      label: "JWT Service",
      icon: "Key",
      cluster: "auth",
      tags: ["Token"],
    },
    {
      id: "api-gateway",
      type: "service",
      label: "API Gateway",
      icon: "Network",
      cluster: "backend",
      tags: ["REST"],
    },
    {
      id: "user-service",
      type: "process",
      label: "User Service",
      icon: "Users",
      cluster: "backend",
      tags: ["CRUD"],
    },
    {
      id: "is-authorized",
      type: "decision",
      label: "Authorized?",
      icon: "HelpCircle",
      cluster: "backend",
    },
    {
      id: "database",
      type: "database",
      label: "PostgreSQL",
      icon: "Database",
      cluster: "storage",
      tags: ["Primary"],
    },
    {
      id: "redis",
      type: "database",
      label: "Redis Cache",
      icon: "Zap",
      cluster: "storage",
      tags: ["Cache"],
    },
  ],
  connections: [
    { from: "client", to: "auth-server", label: "Login", dashed: true },
    { from: "auth-server", to: "jwt-service" },
    { from: "client", to: "api-gateway", label: "API Calls" },
    { from: "api-gateway", to: "is-authorized" },
    { from: "is-authorized", to: "user-service", label: "Yes" },
    { from: "user-service", to: "database" },
    { from: "user-service", to: "redis" },
    { from: "auth-server", to: "database", dashed: true },
  ],
  clusters: [
    { id: "frontend", name: "Frontend Layer", color: "#dbeafe" },
    { id: "auth", name: "Authentication", color: "#fef3c7", dashedBorder: true },
    { id: "backend", name: "Backend Services", color: "#dcfce7" },
    { id: "storage", name: "Data Layer", color: "#fce7f3" },
  ],
}
