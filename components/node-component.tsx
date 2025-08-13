"use client"

import type React from "react"
import type { DiagramNode } from "./diagram-builder"
import { Card } from "@/components/ui/card"
import {
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
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Users,
  Database,
  Server,
  Settings,
  Config: Cog,
  Document: FileText,
  Folder,
  Email: Mail,
  Phone,
  Calendar,
  Time: Clock,
  Home,
  Building,
  Cart: ShoppingCart,
  Payment: CreditCard,
  Delivery: Truck,
  Package,
  Chart: BarChart,
  Analytics: PieChart,
  Growth: TrendingUp,
  Goal: Target,
  Search,
  Filter,
  Code,
  Desktop: Monitor,
  Mobile: Smartphone,
  Network: Wifi,
  Cloud,
  Security: Shield,
  Favorite: Heart,
  Star,
  Flag,
  Notification: Bell,
  Message: MessageCircle,
  Camera,
}

interface NodeComponentProps {
  node: DiagramNode & { x: number; y: number; width: number; height: number }
  onClick?: () => void
}

export function NodeComponent({ node, onClick }: NodeComponentProps) {
  const IconComponent = node.icon ? ICON_MAP[node.icon] : null

  const darkenColor = (color: string, amount = 0.2) => {
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substr(0, 2), 16)
    const g = Number.parseInt(hex.substr(2, 2), 16)
    const b = Number.parseInt(hex.substr(4, 2), 16)

    const darkenedR = Math.max(0, Math.floor(r * (1 - amount)))
    const darkenedG = Math.max(0, Math.floor(g * (1 - amount)))
    const darkenedB = Math.max(0, Math.floor(b * (1 - amount)))

    return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`
  }

  const sanitizeSVG = (svgContent: string) => {
    let sanitized = svgContent.replace(/width="[^"]*"/g, "")
    sanitized = sanitized.replace(/height="[^"]*"/g, "")

    // Ensure viewBox is present for proper scaling
    if (!sanitized.includes("viewBox")) {
      const widthMatch = svgContent.match(/width="([^"]*)"/)
      const heightMatch = svgContent.match(/height="([^"]*)"/)
      if (widthMatch && heightMatch) {
        const width = widthMatch[1].replace("px", "")
        const height = heightMatch[1].replace("px", "")
        sanitized = sanitized.replace("<svg", `<svg viewBox="0 0 ${width} ${height}"`)
      }
    }

    return sanitized
  }

  const renderContent = () => {
    if (node.type === "image" && node.content?.startsWith("<svg")) {
      const sanitizedSVG = sanitizeSVG(node.content)
      return (
        <div className="flex items-center justify-center flex-1 min-h-0 w-full">
          <div
            className="w-16 h-16 flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              maxWidth: "64px",
              maxHeight: "64px",
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizedSVG.replace(
                "<svg",
                '<svg style="width: 100%; height: 100%; max-width: 64px; max-height: 64px;"',
              ),
            }}
          />
        </div>
      )
    } else if (node.type === "image") {
      return (
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 gap-2">
          <img
            src={node.content || "/placeholder.svg"}
            alt="Node image"
            className="max-w-full max-h-16 object-contain flex-shrink-0"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
      )
    } else {
      const isTextOnly = !IconComponent
      return (
        <div
          className={cn(
            "flex-1 flex items-center justify-center min-h-0 w-full",
            isTextOnly ? "px-2 py-2" : "px-3 py-2",
          )}
        >
          <div className="text-sm font-medium text-foreground text-center w-full">
            <div
              className="break-words hyphens-auto"
              style={{
                wordBreak: "break-word",
                lineHeight: isTextOnly ? "1.3" : "1.4",
                overflowWrap: "break-word",
              }}
            >
              {node.content}
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <Card
      className={cn(
        "absolute select-none transition-all duration-200 cursor-pointer",
        "border-4 hover:border-primary/50", // Border thickness matches edge thickness (4px)
        "overflow-hidden",
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        zIndex: 15,
        backgroundColor: node.backgroundColor || "#ffffff",
        borderColor: node.backgroundColor ? darkenColor(node.backgroundColor) : "#cccccc",
        borderStyle: node.dashedBorder ? "dashed" : "solid", // Added dashed border support
      }}
      onClick={onClick}
    >
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-0 gap-1">
          {IconComponent && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <IconComponent className="h-8 w-8" style={{ color: node.color || "#1e293b" }} />
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </Card>
  )
}
