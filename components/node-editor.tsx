"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { DiagramNode } from "./diagram-builder"

interface NodeEditorProps {
  node: DiagramNode
  onUpdate: (updates: Partial<DiagramNode>) => void
  onClose: () => void
}

const AVAILABLE_ICONS = [
  "User",
  "Users",
  "Database",
  "Server",
  "Settings",
  "Config",
  "Document",
  "Folder",
  "Email",
  "Phone",
  "Calendar",
  "Time",
  "Home",
  "Building",
  "Cart",
  "Payment",
  "Delivery",
  "Package",
  "Chart",
  "Analytics",
  "Growth",
  "Goal",
  "Search",
  "Filter",
  "Code",
  "Desktop",
  "Mobile",
  "Network",
  "Cloud",
  "Security",
  "Favorite",
  "Star",
  "Flag",
  "Notification",
  "Message",
  "Camera",
]

const COLOR_PALETTE = [
  "#1e293b",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#c026d3",
  "#be185d",
]

const PASTEL_COLORS = [
  "#ffffff", // White (default)
  "#fef2f2", // Red pastel
  "#fff7ed", // Orange pastel
  "#fefce8", // Yellow pastel
  "#f0fdf4", // Green pastel
  "#ecfeff", // Cyan pastel
  "#eff6ff", // Blue pastel
  "#f5f3ff", // Purple pastel
  "#fdf2f8", // Pink pastel
  "#f9fafb", // Gray pastel
]

export function NodeEditor({ node, onUpdate, onClose }: NodeEditorProps) {
  const [content, setContent] = useState(node.content || "")
  const [icon, setIcon] = useState(node.icon || "")
  const [color, setColor] = useState(node.color || "#1e293b")
  const [backgroundColor, setBackgroundColor] = useState(node.backgroundColor || "#ffffff") // Added background color state
  const [dashedBorder, setDashedBorder] = useState(node.dashedBorder || false) // Added dashed border state
  const [imageUrl, setImageUrl] = useState(node.type === "image" ? node.content || "" : "")
  const [nodeType, setNodeType] = useState(node.type || "text")

  const handleSave = () => {
    const updates: Partial<DiagramNode> = {
      content: nodeType === "image" ? imageUrl : content,
      icon: nodeType === "text" && icon ? icon : undefined,
      color: nodeType === "text" && icon ? color : undefined,
      backgroundColor,
      dashedBorder, // Added dashed border to updates
      type: nodeType as "text" | "image",
    }
    onUpdate(updates)
    onClose()
  }

  const isCustomSVG = nodeType === "image" && imageUrl.trim().startsWith("<svg")

  return (
    <Card className="w-80">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Node</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="grid grid-cols-5 gap-2">
            {PASTEL_COLORS.map((paletteColor) => (
              <button
                key={paletteColor}
                className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: paletteColor,
                  borderColor: backgroundColor === paletteColor ? "#000" : "#ccc",
                }}
                onClick={() => setBackgroundColor(paletteColor)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Border Style</Label>
          <div className="flex gap-2">
            <Button variant={!dashedBorder ? "default" : "outline"} size="sm" onClick={() => setDashedBorder(false)}>
              Solid
            </Button>
            <Button variant={dashedBorder ? "default" : "outline"} size="sm" onClick={() => setDashedBorder(true)}>
              Dashed
            </Button>
          </div>
        </div>

        {!isCustomSVG && (nodeType === "text" ? icon : true) && (
          <div className="space-y-2">
            <Label>Icon Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((paletteColor) => (
                <button
                  key={paletteColor}
                  className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: paletteColor,
                    borderColor: color === paletteColor ? "#000" : "transparent",
                  }}
                  onClick={() => setColor(paletteColor)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={nodeType} onValueChange={setNodeType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Node</SelectItem>
              <SelectItem value="image">Image/SVG Node</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {nodeType === "text" ? (
          <>
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter node text" />
            </div>
            <div className="space-y-2">
              <Label>Icon (Optional)</Label>
              <Select value={icon || "none"} onValueChange={(value) => setIcon(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="No Icon" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="none">No Icon</SelectItem>
                  {AVAILABLE_ICONS.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      {iconName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label>Image URL or SVG HTML</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png or <svg>...</svg>"
            />
            {isCustomSVG && <p className="text-xs text-muted-foreground">Custom SVGs keep their original colors</p>}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
