"use client"

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
  type OnNodesChange,
  type OnEdgesChange,
  type EdgeMouseHandler,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { customNodeTypes } from "./custom-nodes"
import { memo } from "react"

// Cluster label component rendered on group nodes
function ClusterLabel({ data }: { data: any }) {
  const label = data?.label || ""
  const bgColor = data?.bgColor as string | undefined
  const borderColor = data?.borderColor as string | undefined
  const dashedBorder = data?.dashedBorder as boolean | undefined

  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        backgroundColor: bgColor,
        border: borderColor
          ? `2px ${dashedBorder ? "dashed" : "solid"} ${borderColor}`
          : undefined,
      }}
    >
      {label && (
        <span className="absolute top-2.5 left-3.5 text-xs font-semibold text-slate-500 tracking-wide">
          {label}
        </span>
      )}
    </div>
  )
}

const ClusterLabelMemo = memo(ClusterLabel)

const allNodeTypes: NodeTypes = {
  ...customNodeTypes,
  group: ClusterLabelMemo,
} as unknown as NodeTypes

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  onNodeClick?: (event: React.MouseEvent, node: Node) => void
  onEdgeClick?: EdgeMouseHandler
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void
  showBackground: boolean
  onInit?: (instance: ReactFlowInstance) => void
  onDrop?: (event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onEdgeContextMenu,
  showBackground,
  onInit,
  onDrop,
  onDragOver,
}: FlowCanvasProps) {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeContextMenu={onEdgeContextMenu}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={allNodeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          markerEnd: {
            type: "arrowclosed" as any,
            color: "#94a3b8",
            width: 18,
            height: 18,
          },
        }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={3}
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        {showBackground && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#d1d5db"
          />
        )}
        <Controls
          className="!bg-background !border-border !shadow-md !rounded-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-background !border-border !shadow-md !rounded-lg"
          nodeColor={(node) => {
            const data = node.data as any
            return (data?.borderColor as string) || "#94a3b8"
          }}
          maskColor="rgba(0,0,0,0.08)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
