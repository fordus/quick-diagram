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
        id: "client",
        content: `<svg viewBox="0 0 256 296" width="256" height="296" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path fill="#673AB8" d="m128 0 128 73.9v147.8l-128 73.9L0 221.7V73.9z"/><path d="M34.865 220.478c17.016 21.78 71.095 5.185 122.15-34.704 51.055-39.888 80.24-88.345 63.224-110.126-17.017-21.78-71.095-5.184-122.15 34.704-51.055 39.89-80.24 88.346-63.224 110.126Zm7.27-5.68c-5.644-7.222-3.178-21.402 7.573-39.253 11.322-18.797 30.541-39.548 54.06-57.923 23.52-18.375 48.303-32.004 69.281-38.442 19.922-6.113 34.277-5.075 39.92 2.148 5.644 7.223 3.178 21.403-7.573 39.254-11.322 18.797-30.541 39.547-54.06 57.923-23.52 18.375-48.304 32.004-69.281 38.441-19.922 6.114-34.277 5.076-39.92-2.147Z" fill="#FFF"/><path d="M220.239 220.478c17.017-21.78-12.169-70.237-63.224-110.126C105.96 70.464 51.88 53.868 34.865 75.648c-17.017 21.78 12.169 70.238 63.224 110.126 51.055 39.889 105.133 56.485 122.15 34.704Zm-7.27-5.68c-5.643 7.224-19.998 8.262-39.92 2.148-20.978-6.437-45.761-20.066-69.28-38.441-23.52-18.376-42.74-39.126-54.06-57.923-10.752-17.851-13.218-32.03-7.575-39.254 5.644-7.223 19.999-8.261 39.92-2.148 20.978 6.438 45.762 20.067 69.281 38.442 23.52 18.375 42.739 39.126 54.06 57.923 10.752 17.85 13.218 32.03 7.574 39.254Z" fill="#FFF"/><path d="M127.552 167.667c10.827 0 19.603-8.777 19.603-19.604 0-10.826-8.776-19.603-19.603-19.603-10.827 0-19.604 8.777-19.604 19.603 0 10.827 8.777 19.604 19.604 19.604Z" fill="#FFF"/></svg>`,
        type: "image",
        backgroundColor: "#e0f2fe",
        dashedBorder: false,
        cluster: "frontend",
      },
      {
        id: "auth-server",
        content: "Auth Server",
        icon: "Shield",
        color: "#dc2626",
        backgroundColor: "#fef7cd",
        dashedBorder: true,
        cluster: "auth",
      },
      {
        id: "jwt-service",
        content: "JWT Service",
        icon: "Settings",
        color: "#f59e0b",
        backgroundColor: "#fff4e6",
        dashedBorder: false,
        cluster: "auth",
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
    ],
    connections: [
      { from: "client", to: "auth-server", color: "#b3b3b3", direction: "target" },
      { from: "auth-server", to: "jwt-service", color: "#b3b3b3", direction: "both" },
      { from: "client", to: "api-gateway", color: "#b3b3b3", direction: "target", dashed: true },
      { from: "api-gateway", to: "user-service", color: "#b3b3b3", direction: "target" },
      { from: "user-service", to: "database", color: "#b3b3b3", direction: "target" },
      { from: "user-service", to: "redis", color: "#b3b3b3", direction: "target", dashed: true },
      { from: "auth-server", to: "database", color: "#b3b3b3", direction: "target" },
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
        name: "Backend Services",
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
