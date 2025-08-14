"use client"
import { forwardRef, useEffect, useState, useRef } from "react"
import type React from "react"

import type { DiagramNode, DiagramConnection, DiagramCluster } from "./diagram-builder"
import { NodeComponent } from "./node-component"

interface DiagramCanvasProps {
  nodes: DiagramNode[]
  connections: DiagramConnection[]
  clusters: DiagramCluster[]
  onNodeClick?: (node: DiagramNode) => void
  onClusterClick?: (cluster: DiagramCluster) => void
}

interface PositionedNode extends DiagramNode {
  x: number
  y: number
  width: number
  height: number
}

const calculateConnectionPath = (
  sourceNode: PositionedNode,
  targetNode: PositionedNode,
  connectionIndex = 0,
  totalConnections = 1,
  direction?: string,
): { path: string; sourcePoint: { x: number; y: number }; targetPoint: { x: number; y: number } } => {
  const offset = totalConnections > 1 ? (connectionIndex - (totalConnections - 1) / 2) * 30 : 0

  // Calculate connection points on node edges instead of centers
  const sourceRect = { x: sourceNode.x, y: sourceNode.y, width: sourceNode.width, height: sourceNode.height }
  const targetRect = { x: targetNode.x, y: targetNode.y, width: targetNode.width, height: targetNode.height }

  let sourceX: number, sourceY: number, targetX: number, targetY: number

  const dx = targetRect.x + targetRect.width / 2 - (sourceRect.x + sourceRect.width / 2)
  const dy = targetRect.y + targetRect.height / 2 - (sourceRect.y + sourceRect.height / 2)

  // Determine connection points based on relative positions
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      // Source to right edge, target to left edge
      sourceX = sourceRect.x + sourceRect.width
      sourceY = sourceRect.y + sourceRect.height / 2 + offset
      targetX = targetRect.x
      targetY = targetRect.y + targetRect.height / 2 + offset
    } else {
      // Source to left edge, target to right edge
      sourceX = sourceRect.x
      sourceY = sourceRect.y + sourceRect.height / 2 + offset
      targetX = targetRect.x + targetRect.width
      targetY = targetRect.y + targetRect.height / 2 + offset
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      // Source to bottom edge, target to top edge
      sourceX = sourceRect.x + sourceRect.width / 2 + offset
      sourceY = sourceRect.y + sourceRect.height
      targetX = targetRect.x + targetRect.width / 2 + offset
      targetY = targetRect.y
    } else {
      // Source to top edge, target to bottom edge
      sourceX = sourceRect.x + sourceRect.width / 2 + offset
      sourceY = sourceRect.y
      targetX = targetRect.x + targetRect.width / 2 + offset
      targetY = targetRect.y + targetRect.height
    }
  }

  // Create straight path with right angles
  let path: string
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal first, then vertical
    const midX = sourceX + (targetX - sourceX) / 2
    path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`
  } else {
    // Vertical first, then horizontal
    const midY = sourceY + (targetY - sourceY) / 2
    path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
  }

  return {
    path,
    sourcePoint: { x: sourceX, y: sourceY },
    targetPoint: { x: targetX, y: targetY },
  }
}

const createArrowHead = (x: number, y: number, angle: number, size = 16) => {
  const angle1 = angle + Math.PI * 0.8
  const angle2 = angle - Math.PI * 0.8

  const x1 = x + Math.cos(angle1) * size
  const y1 = y + Math.sin(angle1) * size
  const x2 = x + Math.cos(angle2) * size
  const y2 = y + Math.sin(angle2) * size

  return `M ${x1} ${y1} L ${x} ${y} L ${x2} ${y2}`
}

const darkenColor = (color: string, amount = 0.1) => {
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  const darkenedR = Math.max(0, Math.floor(r * (1 - amount)))
  const darkenedG = Math.max(0, Math.floor(g * (1 - amount)))
  const darkenedB = Math.max(0, Math.floor(b * (1 - amount)))

  return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`
}

export const DiagramCanvas = forwardRef<HTMLDivElement, DiagramCanvasProps>(
  ({ nodes, connections, clusters, onNodeClick, onClusterClick }, ref) => {
    const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>([])
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const [isPanning, setIsPanning] = useState(false)
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const getNodeDimensions = (node: DiagramNode) => {
      return { width: 140, height: 120 }
    }

    useEffect(() => {
      if (nodes.length === 0) {
        setPositionedNodes([])
        return
      }

      const clusterGroups: { [key: string]: DiagramNode[] } = {}
      const unclusteredNodes: DiagramNode[] = []

      nodes.forEach((node) => {
        if (node.cluster) {
          if (!clusterGroups[node.cluster]) {
            clusterGroups[node.cluster] = []
          }
          clusterGroups[node.cluster].push(node)
        } else {
          unclusteredNodes.push(node)
        }
      })

      const initialNodes: PositionedNode[] = []
      let currentX = 200
      let currentY = 150

      // Position clustered nodes with better spacing
      Object.entries(clusterGroups).forEach(([clusterId, clusterNodes]) => {
        const nodesPerRow = Math.ceil(Math.sqrt(clusterNodes.length))
        const nodeSpacing = 200 // Increased spacing between nodes in clusters

        clusterNodes.forEach((node, index) => {
          const row = Math.floor(index / nodesPerRow)
          const col = index % nodesPerRow
          const dimensions = getNodeDimensions(node)

          initialNodes.push({
            ...node,
            x: currentX + col * nodeSpacing,
            y: currentY + row * 180,
            ...dimensions,
          })
        })

        currentX += nodesPerRow * nodeSpacing + 220
        if (currentX > 1200) {
          currentX = 200
          currentY += 400
        }
      })

      // Position unclustered nodes
      unclusteredNodes.forEach((node, index) => {
        const dimensions = getNodeDimensions(node)
        initialNodes.push({
          ...node,
          x: currentX + (index % 3) * 300,
          y: currentY + Math.floor(index / 3) * 200,
          ...dimensions,
        })
      })

      setPositionedNodes(initialNodes)
    }, [nodes])

    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left mouse button
        setIsPanning(true)
        setLastPanPoint({ x: e.clientX, y: e.clientY })
        e.preventDefault()
      }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x
        const deltaY = e.clientY - lastPanPoint.y

        setTransform((prev) => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))

        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsPanning(false)
    }

    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(3, transform.scale * delta))

      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }))
    }

    useEffect(() => {
      const handleGlobalMouseUp = () => setIsPanning(false)
      document.addEventListener("mouseup", handleGlobalMouseUp)
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp)
    }, [])

    return (
      <div
        ref={ref}
        className="w-full h-full relative bg-white overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
          className="relative w-full h-full"
        >
          {/* Clusters with elegant labels */}
          {clusters.map((cluster, index) => {
            const clusterNodes = positionedNodes.filter((node) => node.cluster === cluster.id)
            if (clusterNodes.length === 0) return null

            const padding = 80
            const minX = Math.min(...clusterNodes.map((n) => n.x)) - padding
            const minY = Math.min(...clusterNodes.map((n) => n.y)) - padding
            const maxX = Math.max(...clusterNodes.map((n) => n.x + n.width)) + padding
            const maxY = Math.max(...clusterNodes.map((n) => n.y + n.height)) + padding

            return (
              <div
                key={cluster.id}
                className="absolute rounded-xl cursor-pointer hover:opacity-90 transition-all duration-200"
                style={{
                  left: minX,
                  top: minY,
                  width: maxX - minX,
                  height: maxY - minY,
                  backgroundColor: cluster.color || "#f1f5f9", // LABEL BORDER
                  zIndex: index,
                  borderStyle: cluster.dashedBorder ? "dashed" : "solid",
                  borderWidth: "4px",
                  borderColor: cluster.color ? darkenColor(cluster.color || "#f1f5f9") : "#cccccc",
                }}
                onClick={() => onClusterClick?.(cluster)}
              >
                <div className="absolute -top-3 left-4">
                  <div
                    className="px-4 py-2 rounded-full text-sm font-semibold border-4 backdrop-blur-sm"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      color: "#1e293b",
                      borderColor: cluster.color ? darkenColor(cluster.color || "#f1f5f9") : "#cccccc",
                      borderStyle: cluster.dashedBorder ? "dashed" : "solid",
                    }}
                  >
                    {cluster.name}
                  </div>
                </div>
              </div>
            )
          })}

          <svg
            className="absolute pointer-events-none"
            style={{
              left: 0,
              top: 0,
              width: "2000px",
              height: "2000px",
              zIndex: 10,
            }}
          >
            {connections.map((connection, index) => {
              const sourceNode = positionedNodes.find((n) => n.id === connection.from)
              const targetNode = positionedNodes.find((n) => n.id === connection.to)

              if (!sourceNode || !targetNode) return null

              const targetConnections = connections.filter((c) => c.to === connection.to)
              const connectionIndex = targetConnections.findIndex(
                (c) => c.from === connection.from && c.to === connection.to,
              )

              const { path, sourcePoint, targetPoint } = calculateConnectionPath(
                sourceNode,
                targetNode,
                connectionIndex,
                targetConnections.length,
                connection.direction,
              )

              const dx = targetPoint.x - sourcePoint.x
              const dy = targetPoint.y - sourcePoint.y
              const sourceAngle = Math.atan2(dy, dx)
              const targetAngle = Math.atan2(-dy, -dx)

              return (
                <g key={`${connection.from}-${connection.to}-${index}`}>
                  <path
                    d={path}
                    stroke={connection.color || "#b3b3b3"}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={connection.dashed ? "8,4" : "none"}
                  />
                  {(connection.direction === "source" || connection.direction === "both") && (
                    <path
                      d={createArrowHead(sourcePoint.x, sourcePoint.y, sourceAngle + Math.PI)}
                      stroke={connection.color || "#b3b3b3"}
                      strokeWidth="4"
                      fill="none"
                    />
                  )}
                  {(connection.direction === "target" || connection.direction === "both" || !connection.direction) && (
                    <path
                      d={createArrowHead(targetPoint.x, targetPoint.y, targetAngle + Math.PI)}
                      stroke={connection.color || "#b3b3b3"}
                      strokeWidth="4"
                      fill="none"
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {positionedNodes.map((node) => (
            <NodeComponent key={node.id} node={node} onClick={() => onNodeClick?.(node)} />
          ))}
        </div>
      </div>
    )
  },
)

DiagramCanvas.displayName = "DiagramCanvas"
