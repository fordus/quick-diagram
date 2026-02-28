"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react"
import { toPng } from "html-to-image"
import { JsonPanel } from "./json-panel"
import { NodeEditor } from "./node-editor"
import { ClusterEditor } from "./cluster-editor"
import { FlowCanvas } from "./flow/flow-canvas"
import {
  convertToFlowElements,
  flowToJson,
  DEFAULT_EXAMPLE,
  darkenColor,
  type DiagramData,
  type DiagramNodeData,
  type DiagramCluster,
} from "./flow/utils"
import { NODE_TYPE_CONFIGS, type DiagramNodeType } from "./flow/node-types"
import {
  Download,
  Github,
  HelpCircle,
  X,
  Grid3X3,
  Maximize,
  Copy,
  PanelRightOpen,
  PanelRightClose,
  Plus,
  Trash2,
  Check,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type { DiagramNodeData, DiagramCluster }
export type { DiagramData }

let nodeCounter = 100

const { nodes: INITIAL_NODES, edges: INITIAL_EDGES } = convertToFlowElements(DEFAULT_EXAMPLE)

export function DiagramBuilder() {
  const [diagramData, setDiagramData] = useState<DiagramData>(DEFAULT_EXAMPLE)
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node>(INITIAL_NODES)
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)
  const [showJsonPanel, setShowJsonPanel] = useState(true)
  const [showBackground, setShowBackground] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showNodePalette, setShowNodePalette] = useState(false)
  const [editingNode, setEditingNode] = useState<DiagramNodeData | null>(null)
  const [editingCluster, setEditingCluster] = useState<DiagramCluster | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [edgeContextMenu, setEdgeContextMenu] = useState<{
    x: number
    y: number
    edge: Edge
  } | null>(null)
  const [schemaCopied, setSchemaCopied] = useState(false)
  const flowInstance = useRef<ReactFlowInstance | null>(null)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isImportingRef = useRef(false)
  const { toast } = useToast()

  // Convert diagram data to React Flow elements on import
  useEffect(() => {
    if (isImportingRef.current) {
      const { nodes, edges } = convertToFlowElements(diagramData)
      setFlowNodes(nodes)
      setFlowEdges(edges)
      isImportingRef.current = false
      setTimeout(() => {
        flowInstance.current?.fitView({ padding: 0.3 })
      }, 150)
    }
  }, [diagramData, setFlowNodes, setFlowEdges])

  // Initial load
  useEffect(() => {
    isImportingRef.current = true
    setDiagramData(DEFAULT_EXAMPLE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync flow state back to JSON (debounced)
  const syncToJson = useCallback(() => {
    if (isImportingRef.current) return
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(() => {
      setDiagramData((prev) => flowToJson(flowNodes, flowEdges, prev))
    }, 500)
  }, [flowNodes, flowEdges])

  useEffect(() => {
    syncToJson()
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [flowNodes, flowEdges, syncToJson])

  const onConnect = useCallback(
    (connection: Connection) => {
      setFlowEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            style: { stroke: "#94a3b8", strokeWidth: 2 },
            markerEnd: {
              type: "arrowclosed" as any,
              color: "#94a3b8",
              width: 18,
              height: 18,
            },
          },
          eds,
        ),
      )
    },
    [setFlowEdges],
  )

  const handleImport = useCallback(
    (data: DiagramData) => {
      isImportingRef.current = true
      setDiagramData(data)
      toast({ title: "Imported", description: "Diagram loaded successfully" })
    },
    [toast],
  )

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setEdgeContextMenu(null)
      setSelectedEdge(null)
      if (node.type === "group") {
        const clusterData = (node.data as any)?.clusterData as DiagramCluster | undefined
        if (clusterData) setEditingCluster(clusterData)
        return
      }
      const nodeData = node.data as DiagramNodeData
      if (nodeData) setEditingNode(nodeData)
    },
    [],
  )

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setEdgeContextMenu(null)
  }, [])

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault()
      setEdgeContextMenu({ x: event.clientX, y: event.clientY, edge })
    },
    [],
  )

  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      setFlowEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
    if (edgeContextMenu) {
      setFlowEdges((eds) => eds.filter((e) => e.id !== edgeContextMenu.edge.id))
      setEdgeContextMenu(null)
    }
  }, [selectedEdge, edgeContextMenu, setFlowEdges])

  const toggleEdgeAnimation = useCallback(() => {
    const edge = edgeContextMenu?.edge || selectedEdge
    if (!edge) return
    setFlowEdges((eds) =>
      eds.map((e) => (e.id === edge.id ? { ...e, animated: !e.animated } : e)),
    )
    setEdgeContextMenu(null)
  }, [edgeContextMenu, selectedEdge, setFlowEdges])

  const toggleEdgeDash = useCallback(() => {
    const edge = edgeContextMenu?.edge || selectedEdge
    if (!edge) return
    setFlowEdges((eds) =>
      eds.map((e) => {
        if (e.id !== edge.id) return e
        const hasDash = e.style?.strokeDasharray
        return {
          ...e,
          style: {
            ...e.style,
            strokeDasharray: hasDash ? undefined : "6 3",
          },
        }
      }),
    )
    setEdgeContextMenu(null)
  }, [edgeContextMenu, selectedEdge, setFlowEdges])

  const handleNodeUpdate = useCallback(
    (nodeId: string, updates: Partial<DiagramNodeData>) => {
      setFlowNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n,
        ),
      )
    },
    [setFlowNodes],
  )

  const handleClusterUpdate = useCallback(
    (clusterId: string, updates: Partial<DiagramCluster>) => {
      setDiagramData((prev) => ({
        ...prev,
        clusters: (prev.clusters || []).map((c) =>
          c.id === clusterId ? { ...c, ...updates } : c,
        ),
      }))
      setFlowNodes((nds) =>
        nds.map((n) => {
          if (n.id !== `cluster-${clusterId}`) return n
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nd = n as any
          const clusterColor = updates.color || nd.data?.clusterData?.color || "#e2e8f0"
          const dashedBorder = updates.dashedBorder !== undefined
            ? updates.dashedBorder
            : nd.data?.clusterData?.dashedBorder
          return {
            ...nd,
            data: {
              ...nd.data,
              label: updates.name || nd.data?.label,
              clusterData: { ...nd.data?.clusterData, ...updates },
              bgColor: `${clusterColor}80`,
              borderColor: darkenColor(clusterColor, 0.2),
              dashedBorder,
            },
            style: {
              width: nd.style?.width,
              height: nd.style?.height,
            },
          }
        }),
      )
    },
    [setFlowNodes],
  )

  // ---- Add node from palette ----
  const addNodeToCanvas = useCallback(
    (nodeType: DiagramNodeType) => {
      nodeCounter++
      const id = `node-${nodeCounter}`
      const config = NODE_TYPE_CONFIGS[nodeType]

      const viewportCenter = flowInstance.current?.screenToFlowPosition({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2,
      }) || { x: 400, y: 300 }

      const newNode: Node = {
        id,
        type: nodeType,
        position: {
          x: viewportCenter.x + (Math.random() - 0.5) * 80,
          y: viewportCenter.y + (Math.random() - 0.5) * 80,
        },
        data: {
          id,
          type: nodeType,
          label: `New ${config.label}`,
          icon: config.defaultIcon,
          borderColor: config.borderColor,
          bgColor: config.bgColor,
        },
      }

      setFlowNodes((nds) => [...nds, newNode])
      setShowNodePalette(false)
      toast({ title: "Node added", description: `${config.label} node created` })
    },
    [setFlowNodes, toast],
  )

  // ---- Drag and drop from palette ----
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData(
        "application/reactflow-type",
      ) as DiagramNodeType
      if (!type || !NODE_TYPE_CONFIGS[type]) return

      const position = flowInstance.current?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      if (!position) return

      nodeCounter++
      const id = `node-${nodeCounter}`
      const config = NODE_TYPE_CONFIGS[type]

      const newNode: Node = {
        id,
        type,
        position,
        data: {
          id,
          type,
          label: `New ${config.label}`,
          icon: config.defaultIcon,
          borderColor: config.borderColor,
          bgColor: config.bgColor,
        },
      }

      setFlowNodes((nds) => [...nds, newNode])
    },
    [setFlowNodes],
  )

  // ---- Export ----
  const exportDiagram = useCallback(async () => {
    setIsExporting(true)
    try {
      const viewport = document.querySelector(
        ".react-flow__viewport",
      ) as HTMLElement
      if (!viewport) throw new Error("No viewport found")

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          const classList = (node as HTMLElement)?.classList
          if (!classList) return true
          return (
            !classList.contains("react-flow__controls") &&
            !classList.contains("react-flow__minimap") &&
            !classList.contains("react-flow__background")
          )
        },
      })

      const link = document.createElement("a")
      link.download = `diagram-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({ title: "Exported", description: "Diagram saved as PNG" })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Error",
        description: "Failed to export diagram",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }, [toast])

  const copySchema = useCallback(() => {
    const schema = `{
  "nodes": [
    {
      "id": "unique-id",
      "type": "process | decision | database | service | pipeline | input | output | text",
      "label": "Node Title",
      "description": "Optional description text",
      "icon": "Lucide icon name (e.g. User, Database, GitBranch, Shield)",
      "image": "https://url-to-image.png (optional, instead of icon)",
      "cluster": "cluster-id (optional, to group inside a cluster)",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "connections": [
    { "from": "source-id", "to": "target-id", "label": "optional label", "animated": false, "dashed": false }
  ],
  "clusters": [
    { "id": "cluster-id", "name": "Cluster Name", "color": "#dbeafe" }
  ]
}

Node Types:
- process (cyan) - General process step, icon + label + description + tags
- decision (amber) - Conditional branch with GitBranch icon, used for yes/no or multiple-path logic
- database (blue) - Data storage (PostgreSQL, Redis, etc.)
- service (green) - API or microservice
- pipeline (orange) - Transform / ETL pipeline step
- input (purple) - Data source or entry point
- output (teal) - Result or output endpoint
- text (no border) - Annotation / label between nodes

Icons (Lucide): User, Users, Database, Server, Settings, FileText, Mail, Calendar, Clock, Home, Building, ShoppingCart, CreditCard, Truck, Package, BarChart, PieChart, TrendingUp, Target, Search, Filter, Code, Monitor, Smartphone, Wifi, Cloud, Shield, Heart, Star, Flag, Bell, MessageCircle, Camera, Workflow, HelpCircle, GitBranch, LogIn, LogOut, Network, Layers, Zap, Globe, Lock, Key, Activity, Cpu, HardDrive, Terminal, FileCode, GitCommit, Boxes, ArrowLeftRight, Split, Merge, CheckCircle, AlertTriangle, Info

Rules:
- Each node must have a unique "id"
- Connections reference node ids via "from" and "to"
- Clusters group nodes visually; assign "cluster" on the node to the cluster's "id"
- Use "decision" nodes for branching logic (if/else, conditions)
- Use "text" nodes for annotations or labels placed between edges`

    navigator.clipboard.writeText(schema).then(() => {
      setSchemaCopied(true)
      toast({ title: "Copied!", description: "Schema instructions copied to clipboard" })
      setTimeout(() => setSchemaCopied(false), 2000)
    })
  }, [toast])

  const handleFitView = useCallback(() => {
    flowInstance.current?.fitView({ padding: 0.3 })
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setEdgeContextMenu(null)
    if (edgeContextMenu) {
      document.addEventListener("click", handleClick)
      return () => document.removeEventListener("click", handleClick)
    }
  }, [edgeContextMenu])

  return (
    <div className="flex h-full bg-background">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Left: Logo + Add Node */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h1 className="text-sm font-semibold text-foreground">
                  Quick Diagram
                </h1>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  v2
                </span>
              </div>

              <div className="w-px h-5 bg-border" />

              {/* Add node button */}
              <div className="relative">
                <Button
                  onClick={() => setShowNodePalette(!showNodePalette)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Node
                </Button>

                {showNodePalette && (
                  <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 w-56 py-1">
                    {(
                      Object.entries(NODE_TYPE_CONFIGS) as [
                        DiagramNodeType,
                        (typeof NODE_TYPE_CONFIGS)[DiagramNodeType],
                      ][]
                    ).map(([type, config]) => (
                      <button
                        key={type}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                        onClick={() => addNodeToCanvas(type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/reactflow-type",
                            type,
                          )
                          e.dataTransfer.effectAllowed = "move"
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded flex-shrink-0"
                          style={{
                            backgroundColor:
                              type === "text"
                                ? "#f1f5f9"
                                : `${config.borderColor}20`,
                            border:
                              type === "text"
                                ? "1px dashed #94a3b8"
                                : `2px solid ${config.borderColor}`,
                            borderRadius: "6px",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">
                            {config.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {config.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Edge actions (visible when edge selected) */}
              {selectedEdge && (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={toggleEdgeAnimation}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    {selectedEdge.animated ? "Static" : "Animate"}
                  </Button>
                  <Button
                    onClick={toggleEdgeDash}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    {selectedEdge.style?.strokeDasharray ? "Solid" : "Dashed"}
                  </Button>
                  <Button
                    onClick={deleteSelectedEdge}
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                  <Button
                    onClick={() => setSelectedEdge(null)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Center: Canvas controls */}
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setShowBackground(!showBackground)}
                variant={showBackground ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                Grid
              </Button>
              <Button
                onClick={handleFitView}
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
              >
                <Maximize className="h-3.5 w-3.5" />
                Fit
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              <Button
                onClick={copySchema}
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
              >
                {schemaCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {schemaCopied ? "Copied!" : "Schema"}
              </Button>
              <Button
                onClick={() => setShowHelpDialog(true)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                asChild
                size="sm"
                className="gap-1.5 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
              >
                <a
                  href="https://github.com/fordus/quick-diagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3.5 w-3.5" />
                  Star on GitHub
                </a>
              </Button>
              <Button
                onClick={() => setShowJsonPanel(!showJsonPanel)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {showJsonPanel ? (
                  <PanelRightClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelRightOpen className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                onClick={exportDiagram}
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                disabled={isExporting}
              >
                <Download className="h-3.5 w-3.5" />
                {isExporting ? "..." : "PNG"}
              </Button>
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onEdgeContextMenu={handleEdgeContextMenu}
            showBackground={showBackground}
            onInit={(instance) => {
              flowInstance.current = instance
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />

          {/* Edge context menu */}
          {edgeContextMenu && (
            <div
              className="fixed bg-background border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]"
              style={{
                left: edgeContextMenu.x,
                top: edgeContextMenu.y,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-muted"
                onClick={toggleEdgeAnimation}
              >
                {edgeContextMenu.edge.animated
                  ? "Remove Animation"
                  : "Animate"}
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-muted"
                onClick={toggleEdgeDash}
              >
                {edgeContextMenu.edge.style?.strokeDasharray
                  ? "Make Solid"
                  : "Make Dashed"}
              </button>
              <div className="border-t border-border my-1" />
              <button
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left text-destructive hover:bg-muted"
                onClick={deleteSelectedEdge}
              >
                <Trash2 className="h-3 w-3" />
                Delete Edge
              </button>
            </div>
          )}
        </div>
      </div>

      {/* JSON Panel */}
      {showJsonPanel && (
        <Card className="w-[480px] border-l border-border rounded-none flex-shrink-0">
          <JsonPanel
            diagramData={diagramData}
            onImport={handleImport}
            onClose={() => setShowJsonPanel(false)}
          />
        </Card>
      )}

      {/* Node Editor Modal */}
      {editingNode && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setEditingNode(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <NodeEditor
              node={editingNode}
              onUpdate={(updates) => handleNodeUpdate(editingNode.id, updates)}
              onClose={() => setEditingNode(null)}
            />
          </div>
        </div>
      )}

      {/* Cluster Editor Modal */}
      {editingCluster && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setEditingCluster(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ClusterEditor
              cluster={editingCluster}
              onUpdate={(updates) =>
                handleClusterUpdate(editingCluster.id, updates)
              }
              onClose={() => setEditingCluster(null)}
            />
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelpDialog && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowHelpDialog(false)}
        >
          <Card
            className="w-[520px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Quick Diagram v2
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4 text-sm text-foreground">
                <div>
                  <h3 className="font-medium mb-1">
                    JSON-Driven + Manual Editing
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Import diagrams from JSON or build them manually. Add nodes
                    from the toolbar, connect them by dragging handles, and the
                    JSON stays in sync automatically.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Adding Nodes</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Click "Add Node" to pick a type, or drag a type from the
                    palette directly onto the canvas. Click any node to edit its
                    label, description, tags, icon, and colors.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Edges</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Hover a node to reveal handles. Drag from a handle to
                    another node to connect. Click an edge to select and
                    modify/delete it. Right-click for a context menu. Press
                    Backspace/Delete to remove selected elements.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Node Types</h3>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">process</strong> -
                      General step
                    </span>
                    <span>
                      <strong className="text-foreground">decision</strong> -
                      Conditional branch
                    </span>
                    <span>
                      <strong className="text-foreground">database</strong> -
                      Data storage
                    </span>
                    <span>
                      <strong className="text-foreground">service</strong> -
                      API/service
                    </span>
                    <span>
                      <strong className="text-foreground">pipeline</strong> -
                      Transform
                    </span>
                    <span>
                      <strong className="text-foreground">input</strong> - Data
                      source
                    </span>
                    <span>
                      <strong className="text-foreground">output</strong> -
                      Result
                    </span>
                    <span>
                      <strong className="text-foreground">text</strong> -
                      Annotation
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">AI Generation</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Click "Schema" to copy the JSON specification with all
                    available node types and icons. Paste it into any AI and
                    describe the diagram you need. Import the result.
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <a
                    href="https://github.com/fordus/quick-diagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    github.com/fordus/quick-diagram
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
