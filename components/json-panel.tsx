"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, Download, FileJson, RefreshCw } from "lucide-react"
import type { DiagramData } from "./flow/utils"
import { DEFAULT_EXAMPLE } from "./flow/utils"

interface JsonPanelProps {
  diagramData: DiagramData
  onImport: (data: DiagramData) => void
  onClose: () => void
}

export function JsonPanel({ diagramData, onImport, onClose }: JsonPanelProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Auto-sync diagram data to textarea when not manually editing
  useEffect(() => {
    if (!isEditing) {
      setJsonInput(JSON.stringify(diagramData, null, 2))
    }
  }, [diagramData, isEditing])

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput) as DiagramData
      if (!data.nodes || !Array.isArray(data.nodes)) {
        setError("JSON must contain a 'nodes' array")
        return
      }
      if (!data.connections || !Array.isArray(data.connections)) {
        setError("JSON must contain a 'connections' array")
        return
      }
      onImport(data)
      setError("")
      setIsEditing(false)
    } catch {
      setError("Invalid JSON format")
    }
  }

  const handleSync = () => {
    setJsonInput(JSON.stringify(diagramData, null, 2))
    setIsEditing(false)
  }

  const handleLoadExample = () => {
    setJsonInput(JSON.stringify(DEFAULT_EXAMPLE, null, 2))
    setIsEditing(true)
  }

  const handleCopyToClipboard = () => {
    const jsonString = JSON.stringify(diagramData, null, 2)
    navigator.clipboard.writeText(jsonString)
  }

  return (
    <Card className="h-full rounded-none border-0 flex flex-col">
      <CardHeader className="border-b border-border flex-shrink-0 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">JSON Editor</CardTitle>
            {!isEditing && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">synced</span>
            )}
            {isEditing && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">editing</span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto min-h-0">
        <div className="flex gap-2">
          <Button onClick={handleImport} className="flex-1 gap-2 h-9 text-xs" disabled={!jsonInput.trim()}>
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
          {isEditing && (
            <Button onClick={handleSync} variant="outline" className="gap-1.5 h-9 text-xs">
              <RefreshCw className="h-3 w-3" />
              Sync
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleLoadExample} variant="outline" size="sm" className="h-8 text-xs flex-1">
            Example
          </Button>
          <Button onClick={handleCopyToClipboard} variant="outline" size="sm" className="h-8 text-xs flex-1">
            Copy
          </Button>
        </div>

        <div className="space-y-1.5">
          <Textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value)
              setIsEditing(true)
            }}
            onFocus={() => setIsEditing(true)}
            placeholder="Paste your JSON diagram here..."
            className="min-h-[350px] font-mono text-xs resize-none leading-relaxed"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="pt-3 border-t border-border space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Node Types</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { type: "process", color: "#22d3ee", label: "Process" },
              { type: "decision", color: "#fbbf24", label: "Decision" },
              { type: "database", color: "#3b82f6", label: "Database" },
              { type: "service", color: "#22c55e", label: "Service" },
              { type: "pipeline", color: "#f97316", label: "Pipeline" },
              { type: "input", color: "#a855f7", label: "Input" },
              { type: "output", color: "#14b8a6", label: "Output" },
              { type: "circle", color: "#9ca3af", label: "Circle" },
              { type: "text", color: "#94a3b8", label: "Text" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{
                    borderColor: item.color,
                    backgroundColor: `${item.color}15`,
                    border: item.type === "text" ? `1px dashed ${item.color}` : `2px solid ${item.color}`,
                  }}
                />
                <span className="font-mono">{item.type}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-muted-foreground space-y-0.5">
            <div>Nodes: {diagramData.nodes.length}</div>
            <div>Connections: {diagramData.connections.length}</div>
            <div>Clusters: {diagramData.clusters?.length || 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
