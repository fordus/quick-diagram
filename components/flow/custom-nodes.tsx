"use client"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import type { NodeProps } from "@xyflow/react"
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
  Workflow,
  HelpCircle,
  GitBranch,
  LogIn,
  LogOut,
  Circle,
  Network,
  Layers,
  Zap,
  Globe,
  Lock,
  Key,
  Activity,
  Cpu,
  HardDrive,
  Terminal,
  FileCode,
  GitCommit,
  Boxes,
} from "lucide-react"
import type { ComponentType } from "react"
import { NODE_TYPE_CONFIGS } from "./node-types"

const ICON_MAP: Record<string, ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
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
  Workflow,
  HelpCircle,
  GitBranch,
  LogIn,
  LogOut,
  Circle,
  Network,
  Layers,
  Zap,
  Globe,
  Lock,
  Key,
  Activity,
  Cpu,
  HardDrive,
  Terminal,
  FileCode,
  GitCommit,
  Boxes,
}

function getIcon(iconName?: string) {
  if (!iconName) return null
  return ICON_MAP[iconName] || null
}

function TagBadge({ tag, color }: { tag: string; color: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-sm leading-tight"
      style={{
        backgroundColor: color,
        color: "#fff",
      }}
    >
      {tag}
    </span>
  )
}

const TAG_COLORS = ["#22d3ee", "#f59e0b", "#22c55e", "#a855f7", "#f97316", "#3b82f6", "#ef4444", "#14b8a6"]

function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length]
}

// ---- Rectangular node (process, service, pipeline, input, output, database) ----

function RectangularNode({ data, selected }: NodeProps) {
  const nodeType = (data.type as string) || "process"
  const config = NODE_TYPE_CONFIGS[nodeType as keyof typeof NODE_TYPE_CONFIGS] || NODE_TYPE_CONFIGS.process
  const borderColor = (data.borderColor as string) || config.borderColor
  const bgColor = (data.bgColor as string) || config.bgColor
  const iconName = (data.icon as string) || config.defaultIcon
  const IconComp = getIcon(iconName)
  const label = data.label as string
  const tags = (data.tags as string[]) || []
  const image = data.image as string | undefined
  const description = data.description as string | undefined
  const dashedBorder = data.dashedBorder as boolean | undefined

  return (
    <div
      className="relative rounded-lg transition-shadow"
      style={{
        backgroundColor: bgColor,
        border: `2px ${dashedBorder ? "dashed" : "solid"} ${borderColor}`,
        boxShadow: selected ? `0 0 0 2px ${borderColor}40` : "0 1px 3px rgba(0,0,0,0.06)",
        minWidth: 180,
        minHeight: 60,
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />

      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        {/* Header: icon + label */}
        <div className="flex items-center gap-2">
          {image ? (
            <img
              src={image}
              alt=""
              className="w-6 h-6 rounded object-contain flex-shrink-0"
              crossOrigin="anonymous"
            />
          ) : IconComp ? (
            <div
              className="flex items-center justify-center w-6 h-6 rounded flex-shrink-0"
              style={{ backgroundColor: `${borderColor}25` }}
            >
              <IconComp className="w-3.5 h-3.5" style={{ color: borderColor }} />
            </div>
          ) : null}
          <span className="text-sm font-semibold text-slate-800 leading-tight truncate">
            {label}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-[11px] text-slate-500 leading-tight italic pl-8">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-8">
            {tags.map((tag, i) => (
              <TagBadge key={`${tag}-${i}`} tag={tag} color={getTagColor(i)} />
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />
    </div>
  )
}

// ---- Decision node (diamond shape) ----

function DecisionNodeComponent({ data, selected }: NodeProps) {
  const config = NODE_TYPE_CONFIGS.decision
  const borderColor = (data.borderColor as string) || config.borderColor
  const bgColor = (data.bgColor as string) || config.bgColor
  const iconName = (data.icon as string) || config.defaultIcon
  const IconComp = getIcon(iconName)
  const label = data.label as string
  const dashedBorder = data.dashedBorder as boolean | undefined

  return (
    <div className="relative" style={{ width: 120, height: 120 }}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-slate-300" style={{ top: -4 }} />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-slate-400 !border-slate-300" style={{ left: -4 }} />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: "rotate(45deg)",
          backgroundColor: bgColor,
          border: `2px ${dashedBorder ? "dashed" : "solid"} ${borderColor}`,
          borderRadius: "8px",
          boxShadow: selected ? `0 0 0 2px ${borderColor}40` : "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="flex flex-col items-center gap-1"
          style={{ transform: "rotate(-45deg)" }}
        >
          {IconComp && (
            <div
              className="flex items-center justify-center w-6 h-6 rounded"
              style={{ backgroundColor: `${borderColor}25` }}
            >
              <IconComp className="w-3.5 h-3.5" style={{ color: borderColor }} />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-800 text-center leading-tight max-w-[70px]">
            {label}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-slate-300" style={{ bottom: -4 }} />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-slate-400 !border-slate-300" style={{ right: -4 }} />
    </div>
  )
}

// ---- Circle node (for external services, logos) ----

function CircleNodeComponent({ data, selected }: NodeProps) {
  const config = NODE_TYPE_CONFIGS.circle
  const borderColor = (data.borderColor as string) || config.borderColor
  const bgColor = (data.bgColor as string) || config.bgColor
  const iconName = (data.icon as string) || config.defaultIcon
  const IconComp = getIcon(iconName)
  const label = data.label as string
  const image = data.image as string | undefined

  return (
    <div className="relative flex flex-col items-center" style={{ width: 90 }}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />

      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          boxShadow: selected ? `0 0 0 2px ${borderColor}40` : "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {image ? (
          <img src={image} alt="" className="w-10 h-10 rounded-full object-contain" crossOrigin="anonymous" />
        ) : IconComp ? (
          <IconComp className="w-6 h-6" style={{ color: borderColor }} />
        ) : null}
      </div>

      <span className="text-xs font-medium text-slate-700 text-center mt-1.5 leading-tight max-w-[90px] truncate">
        {label}
      </span>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-slate-400 !border-slate-300" />
    </div>
  )
}

// Memoized exports
export const ProcessNode = memo(RectangularNode)
export const DecisionNode = memo(DecisionNodeComponent)
export const DatabaseNode = memo(RectangularNode)
export const ServiceNode = memo(RectangularNode)
export const PipelineNode = memo(RectangularNode)
export const InputNode = memo(RectangularNode)
export const OutputNode = memo(RectangularNode)
export const CircleNode = memo(CircleNodeComponent)

export const customNodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  database: DatabaseNode,
  service: ServiceNode,
  pipeline: PipelineNode,
  input: InputNode,
  output: OutputNode,
  circle: CircleNode,
}
