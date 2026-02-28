"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { DiagramNodeData } from "./flow/utils"
import { NODE_TYPE_CONFIGS } from "./flow/node-types"

interface NodeEditorProps {
  node: DiagramNodeData
  onUpdate: (updates: Partial<DiagramNodeData>) => void
  onClose: () => void
}

const BORDER_COLORS = [
  "#22d3ee",
  "#fbbf24",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#14b8a6",
  "#9ca3af",
  "#ef4444",
  "#ec4899",
]

const BG_COLORS = [
  "#ffffff",
  "#ecfeff",
  "#fffbeb",
  "#eff6ff",
  "#f0fdf4",
  "#fff7ed",
  "#faf5ff",
  "#f0fdfa",
  "#fef2f2",
  "#fdf2f8",
]

export function NodeEditor({ node, onUpdate, onClose }: NodeEditorProps) {
  const config = NODE_TYPE_CONFIGS[node.type || "process"]
  const [borderColor, setBorderColor] = useState(node.borderColor || config.borderColor)
  const [bgColor, setBgColor] = useState(node.bgColor || config.bgColor)
  const [dashedBorder, setDashedBorder] = useState(node.dashedBorder || false)

  const handleSave = () => {
    onUpdate({ borderColor, bgColor, dashedBorder })
    onClose()
  }

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Edit Node</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {node.label} ({node.type})
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Border Color</Label>
          <div className="grid grid-cols-5 gap-2">
            {BORDER_COLORS.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  borderColor: borderColor === color ? "#1e293b" : "transparent",
                }}
                onClick={() => setBorderColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Background Color</Label>
          <div className="grid grid-cols-5 gap-2">
            {BG_COLORS.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  borderColor: bgColor === color ? "#1e293b" : "#e2e8f0",
                }}
                onClick={() => setBgColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Border Style</Label>
          <div className="flex gap-2">
            <Button
              variant={!dashedBorder ? "default" : "outline"}
              size="sm"
              onClick={() => setDashedBorder(false)}
              className="flex-1 h-8 text-xs"
            >
              Solid
            </Button>
            <Button
              variant={dashedBorder ? "default" : "outline"}
              size="sm"
              onClick={() => setDashedBorder(true)}
              className="flex-1 h-8 text-xs"
            >
              Dashed
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1 h-9 text-sm">
            Save
          </Button>
          <Button variant="outline" onClick={onClose} className="h-9 text-sm">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
