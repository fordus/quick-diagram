"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Search } from "lucide-react"
import type { DiagramNodeData } from "./flow/utils"
import { NODE_TYPE_CONFIGS, AVAILABLE_ICONS } from "./flow/node-types"
import * as LucideIcons from "lucide-react"

interface NodeEditorProps {
  node: DiagramNodeData
  onUpdate: (updates: Partial<DiagramNodeData>) => void
  onClose: () => void
}

const BORDER_COLORS = [
  "#22d3ee", "#fbbf24", "#3b82f6", "#22c55e", "#f97316",
  "#a855f7", "#14b8a6", "#9ca3af", "#ef4444", "#ec4899",
]

const BG_COLORS = [
  "#ffffff", "#ecfeff", "#fffbeb", "#eff6ff", "#f0fdf4",
  "#fff7ed", "#faf5ff", "#f0fdfa", "#fef2f2", "#fdf2f8",
]

export function NodeEditor({ node, onUpdate, onClose }: NodeEditorProps) {
  const config = NODE_TYPE_CONFIGS[node.type || "process"]
  const [label, setLabel] = useState(node.label || "")
  const [description, setDescription] = useState(node.description || "")
  const [tagsText, setTagsText] = useState((node.tags || []).join(", "))
  const [icon, setIcon] = useState(node.icon || config.defaultIcon)
  const [borderColor, setBorderColor] = useState(node.borderColor || config.borderColor)
  const [bgColor, setBgColor] = useState(node.bgColor || config.bgColor)
  const [dashedBorder, setDashedBorder] = useState(node.dashedBorder || false)
  const [iconSearch, setIconSearch] = useState("")
  const [showIconPicker, setShowIconPicker] = useState(false)

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return AVAILABLE_ICONS.slice(0, 30)
    return AVAILABLE_ICONS.filter((name) =>
      name.toLowerCase().includes(iconSearch.toLowerCase())
    ).slice(0, 30)
  }, [iconSearch])

  const handleSave = () => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    onUpdate({ label, description: description || undefined, tags, icon, borderColor, bgColor, dashedBorder })
    onClose()
  }

  const IconPreview = (LucideIcons as any)[icon]

  return (
    <Card className="w-96 shadow-xl max-h-[85vh] overflow-y-auto">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Edit Node</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{node.type}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Label</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Node label"
            className="h-8 text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="text-sm resize-none h-16"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tags (comma separated)</Label>
          <div className="flex gap-2">
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Tag1, Tag2"
              className="h-8 text-sm flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
              onClick={() => setTagsText((prev) => (prev ? prev + ", New" : "New"))}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {/* Tags preview */}
          {tagsText && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tagsText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Icon */}
        {node.type !== "text" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Icon</Label>
            <button
              className="flex items-center gap-2 w-full h-9 px-3 border rounded-md text-sm hover:bg-muted/50 transition-colors"
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              {IconPreview && <IconPreview className="h-4 w-4 text-muted-foreground" />}
              <span className="text-muted-foreground">{icon}</span>
            </button>

            {showIconPicker && (
              <div className="border rounded-lg p-2 space-y-2 bg-background">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="h-7 text-xs pl-7"
                  />
                </div>
                <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                  {filteredIcons.map((iconName) => {
                    const Comp = (LucideIcons as any)[iconName]
                    if (!Comp) return null
                    return (
                      <button
                        key={iconName}
                        className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
                        style={{
                          backgroundColor: icon === iconName ? `${borderColor}20` : undefined,
                          outline: icon === iconName ? `2px solid ${borderColor}` : undefined,
                        }}
                        onClick={() => {
                          setIcon(iconName)
                          setShowIconPicker(false)
                          setIconSearch("")
                        }}
                        title={iconName}
                      >
                        <Comp className="h-4 w-4 text-slate-600" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Border Color */}
        <div className="space-y-1.5">
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

        {/* Background Color */}
        <div className="space-y-1.5">
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

        {/* Border Style */}
        <div className="space-y-1.5">
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

        {/* Actions */}
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
