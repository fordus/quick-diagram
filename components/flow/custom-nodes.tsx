"use client"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import type { NodeProps } from "@xyflow/react"
import {
  User, Users, Database, Server, Settings, Cog, FileText, Folder,
  Mail, Phone, Calendar, Clock, Home, Building, ShoppingCart, CreditCard,
  Truck, Package, BarChart, PieChart, TrendingUp, Target, Search, Filter,
  Code, Monitor, Smartphone, Wifi, Cloud, Shield, Heart, Star, Flag,
  Bell, MessageCircle, Camera, Workflow, HelpCircle, GitBranch, LogIn,
  LogOut, Network, Layers, Zap, Globe, Lock, Key, Activity,
  Cpu, HardDrive, Terminal, FileCode, GitCommit, Boxes,
  ArrowLeftRight, Split, Merge, CheckCircle, AlertTriangle, Info,
} from "lucide-react"
import type { ComponentType } from "react"
import { NODE_TYPE_CONFIGS } from "./node-types"

const ICON_MAP: Record<string, ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  User, Users, Database, Server, Settings, Cog, FileText, Folder,
  Mail, Phone, Calendar, Clock, Home, Building, ShoppingCart, CreditCard,
  Truck, Package, BarChart, PieChart, TrendingUp, Target, Search, Filter,
  Code, Monitor, Smartphone, Wifi, Cloud, Shield, Heart, Star, Flag,
  Bell, MessageCircle, Camera, Workflow, HelpCircle, GitBranch, LogIn,
  LogOut, Network, Layers, Zap, Globe, Lock, Key, Activity,
  Cpu, HardDrive, Terminal, FileCode, GitCommit, Boxes,
  ArrowLeftRight, Split, Merge, CheckCircle, AlertTriangle, Info,
}

function getIcon(iconName?: string) {
  if (!iconName) return null
  return ICON_MAP[iconName] || null
}

const TAG_COLORS = ["#22d3ee", "#f59e0b", "#22c55e", "#a855f7", "#f97316", "#3b82f6", "#ef4444", "#14b8a6"]

function TagBadge({ tag, color }: { tag: string; color: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full leading-tight"
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {tag}
    </span>
  )
}

const handleStyle = "!w-2 !h-2 !bg-slate-300 !border-[1.5px] !border-white !rounded-full"

function NodeHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleStyle} />
      <Handle type="target" position={Position.Right} id="right-target" className={handleStyle} />
      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleStyle} />
      <Handle type="source" position={Position.Left} id="left-source" className={handleStyle} />
    </>
  )
}

// ---- Standard rectangular node used by most types ----
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
      className="rounded-xl transition-shadow"
      style={{
        backgroundColor: bgColor,
        border: `2px ${dashedBorder ? "dashed" : "solid"} ${borderColor}`,
        boxShadow: selected
          ? `0 0 0 2px ${borderColor}40, 0 4px 16px rgba(0,0,0,0.1)`
          : "0 1px 6px rgba(0,0,0,0.06)",
        minWidth: 200,
        maxWidth: 280,
      }}
    >
      <NodeHandles />
      <div className="flex flex-col gap-1.5 px-4 py-3">
        {/* Header row: icon + label */}
        <div className="flex items-center gap-2.5">
          {image ? (
            <img
              src={image}
              alt=""
              className="w-7 h-7 rounded-lg object-contain flex-shrink-0"
              crossOrigin="anonymous"
            />
          ) : IconComp ? (
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${borderColor}20` }}
            >
              <IconComp className="w-4 h-4" style={{ color: borderColor }} />
            </div>
          ) : null}
          <span className="text-sm font-semibold text-slate-800 leading-tight truncate">
            {label}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-[11px] text-slate-400 leading-snug italic pl-[38px]">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-[38px] mt-0.5">
            {tags.map((tag, i) => (
              <TagBadge key={`${tag}-${i}`} tag={tag} color={TAG_COLORS[i % TAG_COLORS.length]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Text / Annotation Node ----
function TextNodeComponent({ data, selected }: NodeProps) {
  const label = data.label as string
  const description = data.description as string | undefined

  return (
    <div
      className="px-3 py-2 rounded-lg transition-shadow"
      style={{
        backgroundColor: selected ? "#f8fafc" : "transparent",
        border: selected ? "1px dashed #94a3b8" : "1px dashed transparent",
        maxWidth: 220,
      }}
    >
      <NodeHandles />
      <p className="text-xs font-medium text-slate-500 text-center leading-snug italic">
        {label}
      </p>
      {description && (
        <p className="text-[10px] text-slate-400 text-center mt-0.5">{description}</p>
      )}
    </div>
  )
}

// ---- Memoized exports ----
export const ProcessNode = memo(RectangularNode)
export const DecisionNode = memo(RectangularNode)
export const DatabaseNode = memo(RectangularNode)
export const ServiceNode = memo(RectangularNode)
export const PipelineNode = memo(RectangularNode)
export const InputNode = memo(RectangularNode)
export const OutputNode = memo(RectangularNode)
export const TextNode = memo(TextNodeComponent)

export const customNodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  database: DatabaseNode,
  service: ServiceNode,
  pipeline: PipelineNode,
  input: InputNode,
  output: OutputNode,
  text: TextNode,
}
