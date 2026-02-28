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
  type ReactFlowInstance,
} from "@xyflow/react"
import { toPng } from "html-to-image"
import { JsonPanel } from "./json-panel"
import { NodeEditor } from "./node-editor"
import { ClusterEditor } from "./cluster-editor"
import { FlowCanvas } from "./flow/flow-canvas"
import {
  convertToFlowElements,
  DEFAULT_EXAMPLE,
  type DiagramData,
  type DiagramNodeData,
  type DiagramCluster,
} from "./flow/utils"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type { DiagramNodeData, DiagramCluster }
export type { DiagramData }

export function DiagramBuilder() {
  const [diagramData, setDiagramData] = useState<DiagramData>(DEFAULT_EXAMPLE)
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([])
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([])
  const [showJsonPanel, setShowJsonPanel] = useState(true)
  const [showBackground, setShowBackground] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [editingNode, setEditingNode] = useState<DiagramNodeData | null>(null)
  const [editingCluster, setEditingCluster] = useState<DiagramCluster | null>(null)
  const flowInstance = useRef<ReactFlowInstance | null>(null)
  const { toast } = useToast()

  // Convert diagram data to React Flow elements
  useEffect(() => {
    const { nodes, edges } = convertToFlowElements(diagramData)
    setFlowNodes(nodes)
    setFlowEdges(edges)
  }, [diagramData, setFlowNodes, setFlowEdges])

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
              width: 20,
              height: 20,
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
      setDiagramData(data)
      toast({
        title: "Imported",
        description: "Diagram loaded successfully",
      })
      // Fit view after import
      setTimeout(() => {
        flowInstance.current?.fitView({ padding: 0.2 })
      }, 200)
    },
    [toast],
  )

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Skip cluster group nodes
      if (node.type === "group") {
        const clusterData = (node.data as any)?.clusterData as DiagramCluster | undefined
        if (clusterData) {
          setEditingCluster(clusterData)
        }
        return
      }

      const nodeData = node.data as DiagramNodeData
      if (nodeData) {
        setEditingNode(nodeData)
      }
    },
    [],
  )

  const handleNodeUpdate = useCallback(
    (nodeId: string, updates: Partial<DiagramNodeData>) => {
      setDiagramData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
      }))
    },
    [],
  )

  const handleClusterUpdate = useCallback(
    (clusterId: string, updates: Partial<DiagramCluster>) => {
      setDiagramData((prev) => ({
        ...prev,
        clusters: (prev.clusters || []).map((c) =>
          c.id === clusterId ? { ...c, ...updates } : c,
        ),
      }))
    },
    [],
  )

  const exportDiagram = useCallback(async () => {
    setIsExporting(true)
    try {
      const viewport = document.querySelector(".react-flow__viewport") as HTMLElement
      if (!viewport) throw new Error("No viewport found")

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          // Exclude controls and minimap from export
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

      toast({
        title: "Exported",
        description: "Diagram saved as PNG",
      })
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
      "type": "process | decision | database | service | pipeline | input | output | circle",
      "label": "Node Title",
      "description": "Optional description text",
      "icon": "Lucide icon name (see list below)",
      "image": "https://url-to-image.png (optional, replaces icon)",
      "cluster": "cluster-id (optional)",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "connections": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "label": "optional edge label",
      "animated": false,
      "dashed": false
    }
  ],
  "clusters": [
    {
      "id": "cluster-id",
      "name": "Cluster Display Name"
    }
  ]
}

Node Types:
- process: General process step (cyan border)
- decision: Diamond-shaped conditional branching (amber border)
- database: Data storage (blue border)
- service: Microservice/API (green border)
- pipeline: Data pipeline/transform (orange border)
- input: Data source input (purple border)
- output: Result/output (teal border)
- circle: External service with logo (gray border)

Available Icons: User, Users, Database, Server, Settings, Cog, FileText, Folder, Mail, Phone, Calendar, Clock, Home, Building, ShoppingCart, CreditCard, Truck, Package, BarChart, PieChart, TrendingUp, Target, Search, Filter, Code, Monitor, Smartphone, Wifi, Cloud, Shield, Heart, Star, Flag, Bell, MessageCircle, Camera, Workflow, HelpCircle, GitBranch, LogIn, LogOut, Circle, Network, Layers, Zap, Globe, Lock, Key, Activity, Cpu, HardDrive, Terminal, FileCode, GitCommit, Boxes

Colors are automatically assigned per node type. Edge connections use smoothstep routing with arrow markers.`

    navigator.clipboard
      .writeText(schema)
      .then(() => {
        toast({ title: "Copied", description: "Schema copied to clipboard" })
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy",
          variant: "destructive",
        })
      })
  }, [toast])

  const handleFitView = useCallback(() => {
    flowInstance.current?.fitView({ padding: 0.2 })
  }, [])

  return (
    <div className="flex h-full bg-background">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between px-4 py-2.5">
            {/* Left: Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground">
                <svg className="h-4 w-4" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-base font-semibold text-foreground">Quick Diagram</h1>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">v2</span>
            </div>

            {/* Center: Canvas controls */}
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setShowBackground(!showBackground)}
                variant={showBackground ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5 h-8 text-xs"
                title="Toggle background dots"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                Grid
              </Button>
              <Button
                onClick={handleFitView}
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                title="Fit diagram to view"
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
                <Copy className="h-3.5 w-3.5" />
                Copy Schema
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
                  href="https://github.com/fordus"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </Button>
              <Button
                onClick={() => setShowJsonPanel(!showJsonPanel)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                title={showJsonPanel ? "Hide JSON panel" : "Show JSON panel"}
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
            showBackground={showBackground}
            onInit={(instance) => {
              flowInstance.current = instance
            }}
          />
        </div>
      </div>

      {/* JSON Panel */}
      {showJsonPanel && (
        <Card className="w-96 border-l border-border rounded-none flex-shrink-0">
          <JsonPanel
            diagramData={diagramData}
            onImport={handleImport}
            onClose={() => setShowJsonPanel(false)}
          />
        </Card>
      )}

      {/* Node Editor Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <NodeEditor
            node={editingNode}
            onUpdate={(updates) => handleNodeUpdate(editingNode.id, updates)}
            onClose={() => setEditingNode(null)}
          />
        </div>
      )}

      {/* Cluster Editor Modal */}
      {editingCluster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ClusterEditor
            cluster={editingCluster}
            onUpdate={(updates) => handleClusterUpdate(editingCluster.id, updates)}
            onClose={() => setEditingCluster(null)}
          />
        </div>
      )}

      {/* Help Dialog */}
      {showHelpDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[520px] max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Quick Diagram v2 - Guide</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHelpDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4 text-sm text-foreground">
                <div>
                  <h3 className="font-medium mb-2">JSON-Driven Diagrams</h3>
                  <p className="text-muted-foreground">
                    Define your diagram structure in JSON with nodes, connections, and optional clusters.
                    Click "Copy Schema" to get the full JSON specification for AI generation.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">AI Generation</h3>
                  <p className="text-muted-foreground">
                    Copy the schema and paste it into any AI model (ChatGPT, Claude, etc.) with a prompt
                    like: "Generate a JSON diagram for a microservices architecture using this schema."
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Node Types</h3>
                  <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                    <span><strong className="text-foreground">process</strong> - General step</span>
                    <span><strong className="text-foreground">decision</strong> - Conditional (diamond)</span>
                    <span><strong className="text-foreground">database</strong> - Data storage</span>
                    <span><strong className="text-foreground">service</strong> - API/microservice</span>
                    <span><strong className="text-foreground">pipeline</strong> - Transform/ETL</span>
                    <span><strong className="text-foreground">input</strong> - Data source</span>
                    <span><strong className="text-foreground">output</strong> - Result/output</span>
                    <span><strong className="text-foreground">circle</strong> - External service</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Editing</h3>
                  <p className="text-muted-foreground">
                    Click any node or cluster to change its colors and border style.
                    Drag nodes to reposition. Use the grid toggle for clean screenshots.
                    Connect nodes by dragging from handles.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Features</h3>
                  <ul className="text-muted-foreground space-y-0.5">
                    <li>Smooth-step edge routing with arrow markers</li>
                    <li>Drag-and-drop node repositioning</li>
                    <li>Auto-layout on JSON import</li>
                    <li>Toggle dot grid background for clean exports</li>
                    <li>Interactive connections between nodes</li>
                    <li>Tags and descriptions on nodes</li>
                    <li>Decision nodes for conditional flows</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
