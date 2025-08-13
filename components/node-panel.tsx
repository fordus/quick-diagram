"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  X,
  User,
  Users,
  Database,
  Server,
  Settings,
  Cog,
  FileText,
  Folder,
  Mail,
  Phone,
  Calendar,
  Clock,
  Home,
  Building,
  ShoppingCart,
  CreditCard,
  Truck,
  Package,
  BarChart,
  PieChart,
  TrendingUp,
  Target,
  Search,
  Filter,
  Code,
  Monitor,
  Smartphone,
  Wifi,
  Cloud,
  Shield,
  Heart,
  Star,
  Flag,
  Bell,
  MessageCircle,
  Camera,
} from "lucide-react"
import type { DiagramNode } from "./diagram-builder"

interface NodePanelProps {
  onAddNode: (nodeData: Partial<DiagramNode>) => void
  onClose: () => void
}

const USEFUL_ICONS = [
  { icon: User, name: "User" },
  { icon: Users, name: "Users" },
  { icon: Database, name: "Database" },
  { icon: Server, name: "Server" },
  { icon: Settings, name: "Settings" },
  { icon: Cog, name: "Config" },
  { icon: FileText, name: "Document" },
  { icon: Folder, name: "Folder" },
  { icon: Mail, name: "Email" },
  { icon: Phone, name: "Phone" },
  { icon: Calendar, name: "Calendar" },
  { icon: Clock, name: "Time" },
  { icon: Home, name: "Home" },
  { icon: Building, name: "Building" },
  { icon: ShoppingCart, name: "Cart" },
  { icon: CreditCard, name: "Payment" },
  { icon: Truck, name: "Delivery" },
  { icon: Package, name: "Package" },
  { icon: BarChart, name: "Chart" },
  { icon: PieChart, name: "Analytics" },
  { icon: TrendingUp, name: "Growth" },
  { icon: Target, name: "Goal" },
  { icon: Search, name: "Search" },
  { icon: Filter, name: "Filter" },
  { icon: Code, name: "Code" },
  { icon: Monitor, name: "Desktop" },
  { icon: Smartphone, name: "Mobile" },
  { icon: Wifi, name: "Network" },
  { icon: Cloud, name: "Cloud" },
  { icon: Shield, name: "Security" },
  { icon: Heart, name: "Favorite" },
  { icon: Star, name: "Star" },
  { icon: Flag, name: "Flag" },
  { icon: Bell, name: "Notification" },
  { icon: MessageCircle, name: "Message" },
  { icon: Camera, name: "Camera" },
]

export function NodePanel({ onAddNode, onClose }: NodePanelProps) {
  const [nodeType, setNodeType] = useState<"text" | "image">("text")
  const [content, setContent] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("")
  const [weight, setWeight] = useState("1")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    onAddNode({
      type: nodeType,
      content: content.trim(),
      icon: selectedIcon || undefined,
      weight: Number.parseFloat(weight) || 1,
    })

    // Reset form
    setContent("")
    setSelectedIcon("")
    setWeight("1")
  }

  return (
    <Card className="h-full rounded-none border-0">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Add Node</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="node-type">Node Type</Label>
            <Select value={nodeType} onValueChange={(value: "text" | "image") => setNodeType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            {nodeType === "text" ? (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter node text..."
                className="min-h-[80px]"
              />
            ) : (
              <Input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter image URL..."
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {USEFUL_ICONS.map(({ icon: IconComponent, name }) => (
                <Button
                  key={name}
                  type="button"
                  variant={selectedIcon === name ? "default" : "outline"}
                  size="sm"
                  className="h-10 w-full p-2 flex flex-col items-center gap-1"
                  onClick={() => setSelectedIcon(selectedIcon === name ? "" : name)}
                  title={name}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs truncate">{name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight/Priority</Label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="1.0"
            />
          </div>

          <Button type="submit" className="w-full">
            Add Node
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
