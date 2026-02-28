"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { DiagramCluster } from "./flow/utils"

interface ClusterEditorProps {
  cluster: DiagramCluster
  onUpdate: (updates: Partial<DiagramCluster>) => void
  onClose: () => void
}

const CLUSTER_COLORS = [
  "#dbeafe",
  "#fef3c7",
  "#dcfce7",
  "#fce7f3",
  "#f3e8ff",
  "#ecfdf5",
  "#fef2f2",
  "#fff7ed",
  "#f0f9ff",
  "#fdf4ff",
]

export function ClusterEditor({ cluster, onUpdate, onClose }: ClusterEditorProps) {
  const [name, setName] = useState(cluster.name || "")
  const [color, setColor] = useState(cluster.color || "#dbeafe")
  const [dashedBorder, setDashedBorder] = useState(cluster.dashedBorder || false)

  const handleSave = () => {
    onUpdate({ name, color, dashedBorder })
    onClose()
  }

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Edit Cluster</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Cluster Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter cluster name" className="h-8 text-sm" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Background Color</Label>
          <div className="grid grid-cols-5 gap-2">
            {CLUSTER_COLORS.map((paletteColor) => (
              <button
                key={paletteColor}
                className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: paletteColor,
                  borderColor: color === paletteColor ? "#1e293b" : "transparent",
                }}
                onClick={() => setColor(paletteColor)}
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
