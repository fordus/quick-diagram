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

// ---- Topological layered layout ----

interface AdjList {
  children: Set<string>
  parents: Set<string>
}

function buildGraph(nodes: DiagramNodeData[], connections: DiagramConnection[]) {
  const adj: Record<string, AdjList> = {}
  const nodeIds = new Set(nodes.map((n) => n.id))
  nodes.forEach((n) => {
    adj[n.id] = { children: new Set(), parents: new Set() }
  })
  connections.forEach((c) => {
    if (nodeIds.has(c.from) && nodeIds.has(c.to)) {
      adj[c.from]?.children.add(c.to)
      adj[c.to]?.parents.add(c.from)
    }
  })
  return adj
}

function assignLayers(nodes: DiagramNodeData[], adj: Record<string, AdjList>): Record<string, number> {
  const layers: Record<string, number> = {}
  const visited = new Set<string>()
  const queue: string[] = []

  // Find roots (no parents)
  nodes.forEach((n) => {
    if (!adj[n.id] || adj[n.id].parents.size === 0) {
      queue.push(n.id)
      layers[n.id] = 0
      visited.add(n.id)
    }
  })

  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!
    const currentLayer = layers[current]
    adj[current]?.children.forEach((child) => {
      const proposedLayer = currentLayer + 1
      if (!visited.has(child) || proposedLayer > layers[child]) {
        layers[child] = proposedLayer
        if (!visited.has(child)) {
          visited.add(child)
          queue.push(child)
        }
      }
    })
  }

  // Assign isolated nodes
  let maxLayer = Math.max(0, ...Object.values(layers))
  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      layers[n.id] = maxLayer + 1
      maxLayer += 1
    }
  })

  return layers
}

// ---- Smart edge handle assignment ----

interface HandleAssignment {
  sourceHandle: string | undefined
  targetHandle: string | undefined
}

function computeEdgeHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
): HandleAssignment {
  const dx = targetPos.x - sourcePos.x
  const dy = targetPos.y - sourcePos.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // Mostly horizontal
  if (absDx > absDy * 1.3) {
    if (dx > 0) {
      return { sourceHandle: "right-source", targetHandle: "left-target" }
    } else {
      return { sourceHandle: "left-source", targetHandle: "right-target" }
    }
  }

  // Mostly vertical or diagonal-ish
  if (dy > 0) {
    return { sourceHandle: undefined, targetHandle: undefined } // bottom -> top (defaults)
  } else {
    // Target is above source - use top source isn't available, so use left/right
    if (dx > 0) {
      return { sourceHandle: "right-source", targetHandle: "left-target" }
    } else if (dx < 0) {
      return { sourceHandle: "left-source", targetHandle: "right-target" }
    }
    return { sourceHandle: undefined, targetHandle: undefined }
  }
}

// ---- Spacing ----
const H_SPACING = 320
const V_SPACING = 160
const CLUSTER_PADDING = 40
const CLUSTER_HEADER = 36

export function convertToFlowElements(data: DiagramData): {
  nodes: Node[]
  edges: Edge[]
} {
  const { nodes: diagramNodes, connections, clusters = [] } = data

  // Group by cluster
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

  // ---- Layout unclustered nodes with topological layers ----
  const adj = buildGraph(unclusteredNodes, connections)
  const layers = assignLayers(unclusteredNodes, adj)

  const layerMap: Record<number, DiagramNodeData[]> = {}
  unclusteredNodes.forEach((n) => {
    const l = layers[n.id] ?? 0
    if (!layerMap[l]) layerMap[l] = []
    layerMap[l].push(n)
  })

  const sortedLayers = Object.keys(layerMap)
    .map(Number)
    .sort((a, b) => a - b)

  const nodePositions: Record<string, { x: number; y: number }> = {}
  const startX = 80
  const startY = 80

  sortedLayers.forEach((layerIdx, layerOrder) => {
    const nodesInLayer = layerMap[layerIdx]
    // Center each layer
    const layerWidth = nodesInLayer.length * H_SPACING
    const maxLayerWidth = Math.max(...sortedLayers.map((l) => (layerMap[l]?.length || 1))) * H_SPACING
    const offsetX = startX + (maxLayerWidth - layerWidth) / 2

    nodesInLayer.forEach((node, colIdx) => {
      const x = offsetX + colIdx * H_SPACING
      const y = startY + layerOrder * V_SPACING
      nodePositions[node.id] = { x, y }

      const nodeType = node.type || "process"
      const config = NODE_TYPE_CONFIGS[nodeType as keyof typeof NODE_TYPE_CONFIGS]

      flowNodes.push({
        id: node.id,
        type: nodeType,
        position: { x, y },
        data: {
          ...node,
          borderColor: node.borderColor || config?.borderColor,
          bgColor: node.bgColor || config?.bgColor,
        },
      })
    })
  })

  // ---- Place cluster groups ----
  const unclusteredMaxX = Object.values(nodePositions).reduce((max, p) => Math.max(max, p.x), 0)
  let clusterX = unclusteredNodes.length > 0 ? unclusteredMaxX + H_SPACING + 80 : startX
  let clusterY = startY

  Object.entries(clusterGroups).forEach(([clusterId, clusterNodes]) => {
    const cluster = clusters.find((c) => c.id === clusterId)
    const clusterColor = cluster?.color || "#e2e8f0"
    const borderColorDarker = darkenColor(clusterColor, 0.2)

    const cols = Math.min(clusterNodes.length, Math.max(2, Math.ceil(Math.sqrt(clusterNodes.length))))
    const rows = Math.ceil(clusterNodes.length / cols)
    const cWidth = cols * H_SPACING + CLUSTER_PADDING * 2
    const cHeight = rows * V_SPACING + CLUSTER_PADDING * 2 + CLUSTER_HEADER

    // Cluster group node
    flowNodes.push({
      id: `cluster-${clusterId}`,
      type: "group",
      position: { x: clusterX, y: clusterY },
      style: {
        width: cWidth,
        height: cHeight,
        backgroundColor: `${clusterColor}80`,
        borderRadius: "16px",
        border: `2px ${cluster?.dashedBorder ? "dashed" : "solid"} ${borderColorDarker}`,
        padding: "0",
      },
      data: {
        label: cluster?.name || clusterId,
        clusterData: cluster,
      },
    })

    clusterNodes.forEach((node, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const nodeType = node.type || "process"
      const config = NODE_TYPE_CONFIGS[nodeType as keyof typeof NODE_TYPE_CONFIGS]

      const x = CLUSTER_PADDING + col * H_SPACING
      const y = CLUSTER_PADDING + CLUSTER_HEADER + row * V_SPACING

      nodePositions[node.id] = { x: clusterX + x, y: clusterY + y }

      flowNodes.push({
        id: node.id,
        type: nodeType,
        position: { x, y },
        parentId: `cluster-${clusterId}`,
        extent: "parent" as const,
        data: {
          ...node,
          borderColor: node.borderColor || config?.borderColor,
          bgColor: node.bgColor || config?.bgColor,
        },
      })
    })

    clusterY += cHeight + 60
  })

  // ---- Convert connections to edges ----
  const edges: Edge[] = connections.map((conn, i) => {
    const sourcePos = nodePositions[conn.from] || { x: 0, y: 0 }
    const targetPos = nodePositions[conn.to] || { x: 0, y: 0 }

    const { sourceHandle, targetHandle } = computeEdgeHandles(sourcePos, targetPos)

    return {
      id: `e-${conn.from}-${conn.to}-${i}`,
      source: conn.from,
      target: conn.to,
      sourceHandle,
      targetHandle,
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
        width: 18,
        height: 18,
      },
      labelStyle: {
        fontSize: 11,
        fontWeight: 500,
        fill: "#64748b",
      },
      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 0.95,
      },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    }
  })

  return { nodes: flowNodes, edges }
}

/** Reconstruct DiagramData from flow state */
export function flowToJson(
  flowNodes: Node[],
  flowEdges: Edge[],
  existingData: DiagramData,
): DiagramData {
  const nodes: DiagramNodeData[] = flowNodes
    .filter((n) => n.type !== "group")
    .map((n) => {
      const d = n.data as any
      return {
        id: n.id,
        type: (d.type || n.type || "process") as DiagramNodeType,
        label: (d.label as string) || n.id,
        description: d.description as string | undefined,
        icon: d.icon as string | undefined,
        image: d.image as string | undefined,
        cluster: d.cluster as string | undefined,
        tags: d.tags as string[] | undefined,
        borderColor: d.borderColor as string | undefined,
        bgColor: d.bgColor as string | undefined,
        dashedBorder: d.dashedBorder as boolean | undefined,
      }
    })

  const connections: DiagramConnection[] = flowEdges.map((e) => ({
    from: e.source,
    to: e.target,
    label: e.label as string | undefined,
    animated: e.animated || false,
    dashed: e.style?.strokeDasharray ? true : false,
  }))

  return {
    nodes,
    connections,
    clusters: existingData.clusters || [],
  }
}

export function darkenColor(color: string, amount = 0.15): string {
  const hex = color.replace("#", "")
  if (hex.length < 6) return color
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
      id: "start",
      type: "input",
      label: "User Request",
      icon: "User",
      description: "Client initiates the process",
      tags: ["Start"],
    },
    {
      id: "api-gateway",
      type: "service",
      label: "API Gateway",
      icon: "Network",
      description: "Routes incoming requests",
      tags: ["REST", "v2"],
    },
    {
      id: "is-authorized",
      type: "decision",
      label: "Authorized?",
      icon: "GitBranch",
      tags: ["Check"],
    },
    {
      id: "auth-service",
      type: "process",
      label: "Auth Service",
      icon: "Shield",
      description: "Validates JWT tokens",
      tags: ["OAuth", "JWT"],
    },
    {
      id: "user-service",
      type: "process",
      label: "User Service",
      icon: "Users",
      tags: ["CRUD"],
    },
    {
      id: "database",
      type: "database",
      label: "PostgreSQL",
      icon: "Database",
      tags: ["Primary"],
      cluster: "storage",
    },
    {
      id: "cache",
      type: "database",
      label: "Redis Cache",
      icon: "Zap",
      tags: ["Cache"],
      cluster: "storage",
    },
    {
      id: "response",
      type: "output",
      label: "API Response",
      icon: "LogOut",
      tags: ["JSON"],
    },
    {
      id: "error-note",
      type: "text",
      label: "Returns 401 Unauthorized",
    },
  ],
  connections: [
    { from: "start", to: "api-gateway", label: "HTTP Request" },
    { from: "api-gateway", to: "is-authorized" },
    { from: "is-authorized", to: "auth-service", label: "No" },
    { from: "is-authorized", to: "user-service", label: "Yes" },
    { from: "auth-service", to: "error-note" },
    { from: "user-service", to: "database" },
    { from: "user-service", to: "cache", dashed: true },
    { from: "user-service", to: "response" },
  ],
  clusters: [{ id: "storage", name: "Data Layer", color: "#dbeafe" }],
}
