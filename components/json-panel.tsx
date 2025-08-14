"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, Download } from "lucide-react"
import type { DiagramNode, DiagramConnection, DiagramCluster } from "./diagram-builder"

interface JsonPanelProps {
  nodes: DiagramNode[]
  connections: DiagramConnection[]
  clusters: DiagramCluster[]
  onImport: (data: { nodes?: DiagramNode[]; connections?: DiagramConnection[]; clusters?: DiagramCluster[] }) => void
  onClose: () => void
}

export function JsonPanel({ nodes, connections, clusters, onImport, onClose }: JsonPanelProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState("")

  const currentData = {
    nodes,
    connections,
    clusters,
  }

  const exampleJson = {
    nodes: [
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
        color: "#10b981",
        backgroundColor: "#f0fdf4",
        dashedBorder: false,
        cluster: "backend",
      },
      {
        id: "user-service",
        content: "User Service",
        icon: "Users",
        color: "#059669",
        backgroundColor: "#ecfdf5",
        dashedBorder: false,
        cluster: "backend",
      },
      {
        id: "database",
        content: "Database",
        icon: "Database",
        color: "#0891b2",
        backgroundColor: "#f0fdfa",
        dashedBorder: false,
        cluster: "backend",
      },
      {
        id: "redis",
        content: "Redis Cache",
        icon: "Server",
        color: "#dc2626",
        backgroundColor: "#f0fdf4",
        dashedBorder: false,
        cluster: "backend",
      },
      {
        id: "client",
        content: `<svg viewBox="0 0 256 308" width="256" height="308" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M239.682 40.707C211.113-.182 154.69-12.301 113.895 13.69L42.247 59.356a82.198 82.198 0 0 0-37.135 55.056 86.566 86.566 0 0 0 8.536 55.576 82.425 82.425 0 0 0-12.296 30.719 87.596 87.596 0 0 0 14.964 66.244c28.574 40.893 84.997 53.007 125.787 27.016l71.648-45.664a82.182 82.182 0 0 0 37.135-55.057 86.601 86.601 0 0 0-8.53-55.577 82.409 82.409 0 0 0 12.29-30.718 87.573 87.573 0 0 0-14.963-66.244" fill="#FF3E00"/><path d="M106.889 270.841c-23.102 6.007-47.497-3.036-61.103-22.648a52.685 52.685 0 0 1-9.003-39.85 49.978 49.978 0 0 1 1.713-6.693l1.35-4.115 3.671 2.697a92.447 92.447 0 0 0 28.036 14.007l2.663.808-.245 2.659a16.067 16.067 0 0 0 2.89 10.656 17.143 17.143 0 0 0 18.397 6.828 15.786 15.786 0 0 0 4.403-1.935l71.67-45.672a14.922 14.922 0 0 0 6.734-9.977 15.923 15.923 0 0 0-2.713-12.011 17.156 17.156 0 0 0-18.404-6.832 15.78 15.78 0 0 0-4.396 1.933l-27.35 17.434a52.298 52.298 0 0 1-14.553 6.391c-23.101 6.007-47.497-3.036-61.101-22.649a52.681 52.681 0 0 1-9.004-39.849 49.428 49.428 0 0 1 22.34-33.114l71.664-45.677a52.218 52.218 0 0 1 14.563-6.398c23.101-6.007 47.497 3.036 61.101 22.648a52.685 52.685 0 0 1 9.004 39.85 50.559 50.559 0 0 1-1.713 6.692l-1.35 4.116-3.67-2.693a92.373 92.373 0 0 0-28.037-14.013l-2.664-.809.246-2.658a16.099 16.099 0 0 0-2.89-10.656 17.143 17.143 0 0 0-18.398-6.828 15.786 15.786 0 0 0-4.402 1.935l-71.67 45.674a14.898 14.898 0 0 0-6.73 9.975 15.9 15.9 0 0 0 2.709 12.012 17.156 17.156 0 0 0 18.404 6.832 15.841 15.841 0 0 0 4.402-1.935l27.345-17.427a52.147 52.147 0 0 1 14.552-6.397c23.101-6.006 47.497 3.037 61.102 22.65a52.681 52.681 0 0 1 9.003 39.848 49.453 49.453 0 0 1-22.34 33.12l-71.664 45.673a52.218 52.218 0 0 1-14.563 6.398" fill="#FFF"/></svg>`,
        type: "image",
        backgroundColor: "#ffffff",
        dashedBorder: false,
        cluster: "frontend",
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

  useEffect(() => {
    if (nodes.length === 0 && connections.length === 0 && clusters.length === 0) {
      const jsonString = JSON.stringify(exampleJson, null, 2)
      setJsonInput(jsonString)
      onImport(exampleJson)
    }
  }, [])

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput)
      onImport(data)
      setError("")
    } catch (err) {
      setError("Invalid JSON format")
    }
  }

  const handleExport = () => {
    const jsonString = JSON.stringify(currentData, null, 2)
    setJsonInput(jsonString)
  }

  const handleLoadExample = () => {
    const jsonString = JSON.stringify(exampleJson, null, 2)
    setJsonInput(jsonString)
  }

  const handleCopyToClipboard = () => {
    const jsonString = JSON.stringify(currentData, null, 2)
    navigator.clipboard.writeText(jsonString)
  }

  return (
    <Card className="h-full rounded-none border-0 flex flex-col">
      <CardHeader className="border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">JSON Editor</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
        <Button onClick={handleImport} className="w-full gap-2" disabled={!jsonInput.trim()}>
          <Upload className="h-4 w-4" />
          Import JSON
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleLoadExample} variant="outline" size="sm">
            JWT Example
          </Button>
          <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
            Copy
          </Button>
        </div>

        <div className="space-y-2">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste JSON data here..."
            className="min-h-[300px] font-mono text-sm resize-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Color Palette</h4>
          <div className="grid grid-cols-5 gap-1 mb-4">
            {[
              "#3b82f6",
              "#ef4444",
              "#10b981",
              "#f59e0b",
              "#8b5cf6",
              "#ec4899",
              "#06b6d4",
              "#84cc16",
              "#f97316",
              "#6366f1",
            ].map((color) => (
              <div
                key={color}
                className="w-8 h-8 rounded cursor-pointer border-2 border-transparent hover:border-gray-400"
                style={{ backgroundColor: color }}
                title={color}
                onClick={() => navigator.clipboard.writeText(color)}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Nodes: {nodes.length}</div>
            <div>Connections: {connections.length}</div>
            <div>Clusters: {clusters.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
