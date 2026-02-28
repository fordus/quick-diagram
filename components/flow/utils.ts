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

  // BFS to assign layers
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

  // Assign unvisited (isolated) nodes
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
  sourceType: string,
  targetType: string,
): HandleAssignment {
  const dx = targetPos.x - sourcePos.x
  const dy = targetPos.y - sourcePos.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  let sourceHandle: string | undefined
  let targetHandle: string | undefined

  // Prefer vertical flow (top-to-bottom)
  if (absDy >= absDx * 0.4) {
    if (dy > 0) {
      // Target is below
      sourceHandle = undefined // default bottom
      targetHandle = undefined // default top
    } else {
      // Target is above
      sourceHandle = undefined // bottom source -> top target reversed
      targetHandle = undefined
    }
  }

  // Horizontal preference when nodes are mostly side by side
  if (absDx > absDy * 1.5) {
    if (dx > 0) {
      sourceHandle = "right-source"
      targetHandle = "left-target"
    } else {
      sourceHandle = "left-source"
      targetHandle = "right-target"
    }
  }

  return { sourceHandle, targetHandle }
}

// ---- Spacing constants ----
const H_SPACING = 300
const V_SPACING = 180
const CLUSTER_PADDING = 50

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

  // ---- Layout unclustered nodes using topological layers ----
  const adj = buildGraph(unclusteredNodes, connections)
  const layers = assignLayers(unclusteredNodes, adj)

  // Group nodes by layer
  const layerMap: Record<number, DiagramNodeData[]> = {}
  unclusteredNodes.forEach((n) => {
    const l = layers[n.id] ?? 0
    if (!layerMap[l]) layerMap[l] = []
    layerMap[l].push(n)
  })

  const sortedLayers = Object.keys(layerMap)
    .map(Number)
    .sort((a, b) => a - b)

  // Calculate cluster area offset (clusters go on the right side)
  const clusterEntries = Object.entries(clusterGroups)
  let clusterTotalWidth = 0

  // First pass: calculate cluster widths
  const clusterDimensions: { width: number; height: number }[] = []
  clusterEntries.forEach(([, clusterNodes]) => {
    const cols = Math.min(clusterNodes.length, Math.max(2, Math.ceil(Math.sqrt(clusterNodes.length))))
    const rows = Math.ceil(clusterNodes.length / cols)
    const w = cols * H_SPACING + CLUSTER_PADDING * 2
    const h = rows * V_SPACING + CLUSTER_PADDING * 2 + 40
    clusterDimensions.push({ width: w, height: h })
    clusterTotalWidth = Math.max(clusterTotalWidth, w)
  })

  // Place unclustered nodes in layers (left-to-right, top-to-bottom)
  const nodePositions: Record<string, { x: number; y: number }> = {}
  const startX = 80
  const startY = 80

  sortedLayers.forEach((layerIdx, layerOrder) => {
    const nodesInLayer = layerMap[layerIdx]
    const layerWidth = nodesInLayer.length * H_SPACING
    const offsetX = startX + Math.max(0, (3 * H_SPACING - layerWidth) / 2) // Center layers

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

  // ---- Place cluster groups on the right ----
  let clusterX = startX + (sortedLayers.length > 0 ? Math.max(...sortedLayers.map((l) => (layerMap[l]?.length || 1))) * H_SPACING + 120 : 80)
  let clusterY = startY

  clusterEntries.forEach(([clusterId, clusterNodes], ci) => {
    const cluster = clusters.find((c) => c.id === clusterId)
    const { width: cWidth, height: cHeight } = clusterDimensions[ci]

    const cols = Math.min(clusterNodes.length, Math.max(2, Math.ceil(Math.sqrt(clusterNodes.length))))

    flowNodes.push({
      id: `cluster-${clusterId}`,
      type: "group",
      position: { x: clusterX, y: clusterY },
      style: {
        width: cWidth,
        height: cHeight,
        backgroundColor: cluster?.color ? `${cluster.color}` : "#f1f5f9",
        borderRadius: "12px",
        border: `2px ${cluster?.dashedBorder ? "dashed" : "solid"} ${darkenColor(cluster?.color || "#f1f5f9", 0.15)}`,
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
      const y = CLUSTER_PADDING + 40 + row * V_SPACING

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

    clusterY += cHeight + 40
  })

  // ---- Convert connections to edges with smart handles ----
  const edges: Edge[] = connections.map((conn, i) => {
    const sourcePos = nodePositions[conn.from] || { x: 0, y: 0 }
    const targetPos = nodePositions[conn.to] || { x: 0, y: 0 }
    const sourceNode = diagramNodes.find((n) => n.id === conn.from)
    const targetNode = diagramNodes.find((n) => n.id === conn.to)

    const { sourceHandle, targetHandle } = computeEdgeHandles(
      sourcePos,
      targetPos,
      sourceNode?.type || "process",
      targetNode?.type || "process",
    )

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

/** Reconstruct DiagramData from current React Flow nodes and edges */
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
  clusters: [
    { id: "storage", name: "Data Layer", color: "#dbeafe" },
  ],
}
