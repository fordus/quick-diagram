"use client"

import { useCallback, useRef } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { customNodeTypes } from "./custom-nodes"

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: ReturnType<typeof useNodesState>[2]
  onEdgesChange: ReturnType<typeof useEdgesState>[2]
  onConnect: (connection: Connection) => void
  onNodeClick?: (event: React.MouseEvent, node: Node) => void
  showBackground: boolean
  onInit?: (instance: ReactFlowInstance) => void
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  showBackground,
  onInit,
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
        onInit={onInit}
        nodeTypes={customNodeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          markerEnd: {
            type: "arrowclosed" as any,
            color: "#94a3b8",
            width: 20,
            height: 20,
          },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={3}
        snapToGrid
        snapGrid={[15, 15]}
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
