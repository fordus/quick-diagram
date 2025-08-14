"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DiagramCanvas } from "./diagram-canvas"
import { JsonPanel } from "./json-panel"
import { NodeEditor } from "./node-editor"
import { ClusterEditor } from "./cluster-editor"
import { Download, Github, HelpCircle, X } from "lucide-react"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

export interface DiagramNode {
  id: string
  content: string
  type?: "text" | "image"
  icon?: string
  weight?: number
  color?: string
  cluster?: string
  backgroundColor?: string
  dashedBorder?: boolean // Added dashed border support for nodes
}

export interface DiagramConnection {
  from: string
  to: string
  color?: string
  direction?: "source" | "target" | "both" | null
  dashed?: boolean
}

export interface DiagramCluster {
  id: string
  name: string
  color?: string
  dashedBorder?: boolean // Added dashed border support for clusters
}

export function DiagramBuilder() {
  const [nodes, setNodes] = useState<DiagramNode[]>([])
  const [connections, setConnections] = useState<DiagramConnection[]>([])
  const [clusters, setClusters] = useState<DiagramCluster[]>([])
  const [showJsonPanel, setShowJsonPanel] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [editingNode, setEditingNode] = useState<DiagramNode | null>(null)
  const [editingCluster, setEditingCluster] = useState<DiagramCluster | null>(null)
  const [editMode, setEditMode] = useState(true) // Added edit mode state
  const canvasRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initialData = {
      nodes: [
        {
          id: "client",
          content: `<svg viewBox="0 0 256 308" width="256" height="308" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M239.682 40.707C211.113-.182 154.69-12.301 113.895 13.69L42.247 59.356a82.198 82.198 0 0 0-37.135 55.056 86.566 86.566 0 0 0 8.536 55.576 82.425 82.425 0 0 0-12.296 30.719 87.596 87.596 0 0 0 14.964 66.244c28.574 40.893 84.997 53.007 125.787 27.016l71.648-45.664a82.182 82.182 0 0 0 37.135-55.057 86.601 86.601 0 0 0-8.53-55.577 82.409 82.409 0 0 0 12.29-30.718 87.573 87.573 0 0 0-14.963-66.244" fill="#FF3E00"/><path d="M106.889 270.841c-23.102 6.007-47.497-3.036-61.103-22.648a52.685 52.685 0 0 1-9.003-39.85 49.978 49.978 0 0 1 1.713-6.693l1.35-4.115 3.671 2.697a92.447 92.447 0 0 0 28.036 14.007l2.663.808-.245 2.659a16.067 16.067 0 0 0 2.89 10.656 17.143 17.143 0 0 0 18.397 6.828 15.786 15.786 0 0 0 4.403-1.935l71.67-45.672a14.922 14.922 0 0 0 6.734-9.977 15.923 15.923 0 0 0-2.713-12.011 17.156 17.156 0 0 0-18.404-6.832 15.78 15.78 0 0 0-4.396 1.933l-27.35 17.434a52.298 52.298 0 0 1-14.553 6.391c-23.101 6.007-47.497-3.036-61.101-22.649a52.681 52.681 0 0 1-9.004-39.849 49.428 49.428 0 0 1 22.34-33.114l71.664-45.677a52.218 52.218 0 0 1 14.563-6.398c23.101-6.007 47.497 3.036 61.101 22.648a52.685 52.685 0 0 1 9.004 39.85 50.559 50.559 0 0 1-1.713 6.692l-1.35 4.116-3.67-2.693a92.373 92.373 0 0 0-28.037-14.013l-2.664-.809.246-2.658a16.099 16.099 0 0 0-2.89-10.656 17.143 17.143 0 0 0-18.398-6.828 15.786 15.786 0 0 0-4.402 1.935l-71.67 45.674a14.898 14.898 0 0 0-6.73 9.975 15.9 15.9 0 0 0 2.709 12.012 17.156 17.156 0 0 0 18.404 6.832 15.841 15.841 0 0 0 4.402-1.935l27.345-17.427a52.147 52.147 0 0 1 14.552-6.397c23.101-6.006 47.497 3.037 61.102 22.65a52.681 52.681 0 0 1 9.003 39.848 49.453 49.453 0 0 1-22.34 33.12l-71.664 45.673a52.218 52.218 0 0 1-14.563 6.398" fill="#FFF"/></svg>`,
          type: "image",
          cluster: "frontend",
          backgroundColor: "#ffffff",
          dashedBorder: false,
        },
        {
          id: "auth-server",
          content: "Auth Server",
          icon: "Users",
          color: "#dc2626",
          cluster: "auth",
          backgroundColor: "#fefce8",
          dashedBorder: false,
        },
        {
          id: "jwt-service",
          content: "JWT Service",
          icon: "Settings",
          color: "#f59e0b",
          cluster: "auth",
          backgroundColor: "#fefce8",
          dashedBorder: false,
        },
        {
          id: "api-gateway",
          content: "API Gateway",
          icon: "Network",
          color: "#8b5cf6",
          cluster: "backend",
          backgroundColor: "#ffffff",
          dashedBorder: false,
        },
        {
          id: "user-service",
          content: "User Service",
          icon: "Users",
          color: "#10b981",
          cluster: "backend",
          backgroundColor: "#ffffff",
          dashedBorder: false,
        },
        {
          id: "database",
          content: "Database",
          icon: "Database",
          color: "#06b6d4",
          cluster: "backend",
          backgroundColor: "#ffffff",
          dashedBorder: false,
        },
        {
          id: "redis",
          content: "Redis Cache",
          icon: "Server",
          color: "#ef4444",
          cluster: "backend",
          backgroundColor: "#ffffff",
          dashedBorder: false,
        },
      ],
      connections: [
        { from: "client", to: "auth-server", color: "#cbcbcb", direction: null, dashed: true },
        { from: "auth-server", to: "jwt-service", color: "#cbcbcb", direction: null, dashed: false },
        { from: "jwt-service", to: "auth-server", color: "#cbcbcb", direction: null, dashed: false },
        { from: "client", to: "api-gateway", color: "#cbcbcb", direction: null, dashed: false },
        { from: "api-gateway", to: "user-service", color: "#cbcbcb", direction: null, dashed: false },
        { from: "user-service", to: "database", color: "#cbcbcb", direction: null, dashed: false },
        { from: "user-service", to: "redis", color: "#cbcbcb", direction: null, dashed: false },
        { from: "auth-server", to: "database", color: "#cbcbcb", direction: null, dashed: false },
      ],
      clusters: [
        {
          id: "frontend",
          name: "Frontend Layer",
          color: "#dbeafe",
          dashedBorder: false,
        },
        {
          id: "auth",
          name: "Authentication Layer",
          color: "#fef3c7",
          dashedBorder: true,
        },
        {
          id: "backend",
          name: "Backend",
          color: "#dcfce7",
          dashedBorder: false,
        },
      ],
    }

    setNodes(initialData.nodes)
    setConnections(initialData.connections)
    setClusters(initialData.clusters)
  }, [])

  const handleImport = useCallback(
    (data: { nodes?: DiagramNode[]; connections?: DiagramConnection[]; clusters?: DiagramCluster[] }) => {
      if (data.nodes) setNodes(data.nodes)
      if (data.connections) setConnections(data.connections)
      if (data.clusters) setClusters(data.clusters)
      toast({
        title: "Success",
        description: "Diagram imported successfully",
      })
    },
    [toast],
  )

  const handleNodeClick = useCallback(
    (node: DiagramNode) => {
      if (editMode) {
        setEditingNode(node)
      }
    },
    [editMode],
  )

  const handleClusterClick = useCallback(
    (cluster: DiagramCluster) => {
      if (editMode) {
        setEditingCluster(cluster)
      }
    },
    [editMode],
  )

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<DiagramNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)))
  }, [])

  const handleClusterUpdate = useCallback((clusterId: string, updates: Partial<DiagramCluster>) => {
    setClusters((prev) => prev.map((cluster) => (cluster.id === clusterId ? { ...cluster, ...updates } : cluster)))
  }, [])

  const exportDiagram = useCallback(async () => {
    if (!canvasRef.current) return

    setIsExporting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: canvasRef.current.scrollWidth,
        height: canvasRef.current.scrollHeight,
      })

      const link = document.createElement("a")
      link.download = `diagram-${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL("image/png")

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "Diagram exported as PNG successfully",
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
      "id": "unique-node-id",
      "content": "Node Text or SVG HTML",
      "type": "text | image",
      "icon": "Lucide icon name (User, Users, Database, Server, Shield, Settings, Network, Monitor, Phone, Email, Calendar, Building, Home, Cart, Package, Chart, Analytics, Growth, Goal, Search, Filter, Code, Desktop, Mobile, Camera, Star, Heart, Flag, Bell, Message, Config, Cloud, Security, Delivery, Payment, Folder, Document)",
      "color": "#hex-color (for built-in icons only)",
      "cluster": "cluster-id",
      "backgroundColor": "#hex-color (default: #ffffff)",
      "dashedBorder": false
    }
  ],
  "connections": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "color": "#hex-color",
      "direction": "source | target | both | null",
      "dashed": false
    }
  ],
  "clusters": [
    {
      "id": "cluster-id",
      "name": "Cluster Display Name",
      "color": "#hex-color",
      "dashedBorder": false
    }
  ]
}

Available Icons: User, Users, Database, Server, Shield, Settings, Network, Monitor, Phone, Email, Calendar, Building, Home, Cart, Package, Chart, Analytics, Growth, Goal, Search, Filter, Code, Desktop, Mobile, Camera, Star, Heart, Flag, Bell, Message, Config, Cloud, Security, Delivery, Payment, Folder, Document

Color Options: Node backgrounds support any hex color. Built-in icons can be colored. Custom SVGs keep original colors. Node borders automatically darken based on background color.

Border Options:
- "dashedBorder": true/false for both nodes and clusters
- Node and cluster borders are 4px thick and match edge thickness
- Border color automatically darkens based on background color

Direction Options: 
- "source": Arrow at start of connection
- "target": Arrow at end of connection  
- "both": Arrows at both ends
- null: No arrows

For custom SVGs, you can visit https://svgl.app/ as a helpful resource for finding SVG icons. Paste the SVG code in the content field with type: "image".`

    navigator.clipboard
      .writeText(schema)
      .then(() => {
        toast({
          title: "Success",
          description: "Schema copied to clipboard",
        })
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy schema to clipboard",
          variant: "destructive",
        })
      })
  }, [toast])

  return (
    <div className="flex h-full bg-background">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="#1e293b" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h1 className="text-xl font-semibold">Quick Diagram v1</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setEditMode(!editMode)} variant={editMode ? "default" : "outline"} size="sm">
                {editMode ? "Edit Mode" : "View Mode"}
              </Button>
              <Button onClick={copySchema} variant="outline" size="sm" className="gap-2 bg-transparent">
                📋 Copy Schema
              </Button>
              <Button onClick={() => setShowHelpDialog(true)} variant="outline" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                asChild
                size="sm"
                className="gap-2 text-white hover:bg-gray-700"
                style={{ backgroundColor: "#1e293b" }}
              >
                <a
                  href="https://github.com/fordus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Tristan
                </a>
              </Button>
              <Button onClick={() => setShowJsonPanel(!showJsonPanel)} variant="outline" size="sm">
                {showJsonPanel ? "Hide JSON" : "Show JSON"}
              </Button>
              <Button
                onClick={exportDiagram}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export PNG"}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <DiagramCanvas
            ref={canvasRef}
            nodes={nodes}
            connections={connections}
            clusters={clusters}
            onNodeClick={handleNodeClick}
            onClusterClick={handleClusterClick}
          />
        </div>
      </div>

      {/* JSON Panel */}
      {showJsonPanel && (
        <Card className="w-96 border-l border-border rounded-none">
          <JsonPanel
            nodes={nodes}
            connections={connections}
            clusters={clusters}
            onImport={handleImport}
            onClose={() => setShowJsonPanel(false)}
          />
        </Card>
      )}

      {editingNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <NodeEditor
            node={editingNode}
            onUpdate={(updates) => handleNodeUpdate(editingNode.id, updates)}
            onClose={() => setEditingNode(null)}
          />
        </div>
      )}

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
          <Card className="w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quick Guide - JSON Diagram Builder</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHelpDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium mb-2">📝 JSON Structure</h3>
                  <p>
                    Everything is controlled from the JSON panel. Toggle Edit Mode to click nodes and clusters to edit
                    them directly. Use the "Copy Schema" button to get the complete JSON structure for AI models.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">🤖 AI Generation</h3>
                  <p>
                    Click "Copy Schema" to get the complete JSON structure. You can then ask AI models like ChatGPT,
                    Claude, or others to generate diagrams following this schema.
                  </p>
                  <p className="mt-1 text-xs bg-gray-100 p-2 rounded">
                    Example prompt: "Generate a JSON diagram for a microservices architecture using the schema I
                    provided"
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">🎯 Nodes</h3>
                  <p>
                    <code>id</code>: Unique identifier
                  </p>
                  <p>
                    <code>content</code>: Node text or image URL/SVG
                  </p>
                  <p>
                    <code>type</code>: "text" or "image"
                  </p>
                  <p>
                    <code>icon</code>: Icon name (User, Database, etc.) - leave empty for no icon
                  </p>
                  <p>
                    <code>color</code>: Icon color (#hex) - only applies to built-in icons
                  </p>
                  <p>
                    <code>cluster</code>: Cluster ID it belongs to
                  </p>
                  <p>
                    <code>backgroundColor</code>: Node background color (#hex) - default white
                  </p>
                  <p>
                    <code>dashedBorder</code>: Dashed border style (true/false) - default false
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">🔗 Connections</h3>
                  <p>
                    <code>from</code>: Source node ID
                  </p>
                  <p>
                    <code>to</code>: Target node ID
                  </p>
                  <p>
                    <code>color</code>: Edge color (#hex)
                  </p>
                  <p>
                    <code>direction</code>: Arrow direction - "source", "target", "both", or null
                  </p>
                  <p>
                    <code>dashed</code>: Make connection dashed (true/false) - default false
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">🎨 Clusters</h3>
                  <p>
                    <code>id</code>: Cluster identifier
                  </p>
                  <p>
                    <code>name</code>: Visible name
                  </p>
                  <p>
                    <code>color</code>: Background color (#hex)
                  </p>
                  <p>
                    <code>dashedBorder</code>: Dashed border style (true/false) - default false
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">🎨 SVG Resources</h3>
                  <p>
                    For custom SVG icons, you can visit{" "}
                    <a
                      href="https://svgl.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://svgl.app/
                    </a>{" "}
                    as a helpful resource for finding SVG icons.
                  </p>
                  <p>
                    Copy the SVG code and paste it in the image field when editing nodes. Custom SVGs keep their
                    original colors.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">⚡ Features</h3>
                  <p>• Toggle Edit Mode to click nodes and clusters for editing</p>
                  <p>• Support for SVG HTML content in image nodes</p>
                  <p>• Dashed borders for both nodes and clusters</p>
                  <p>• Background color selection with automatic border darkening</p>
                  <p>• Auto-layout with smart positioning</p>
                  <p>• Straight horizontal/vertical connections with separation</p>
                  <p>• Color-coded cluster regions</p>
                  <p>• Mouse navigation: drag to pan, scroll to zoom</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">💡 Example</h3>
                  <p>Use the "JWT Example" button in the JSON panel to see a complete example.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
