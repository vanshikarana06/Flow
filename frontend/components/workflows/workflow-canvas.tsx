"use client";

import React, { useState, useCallback, useMemo } from "react";
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  TriggerNode, 
  ConditionNode, 
  HitlGateNode, 
  ActionNode 
} from "./workflow-nodes";
import { Play, Sparkles, RefreshCw, X, Sliders, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  hitl_gate: HitlGateNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  // Pipeline 1: VIP Meeting Conflict
  {
    id: "node-1",
    type: "trigger",
    position: { x: 50, y: 80 },
    data: { label: "Calendar Conflict Detected", subtext: "Triggered on Microsoft Graph calendar overlap >= 15m" },
  },
  {
    id: "node-2",
    type: "condition",
    position: { x: 330, y: 80 },
    data: { label: "VIP Client Check", subtext: "Attendee list contains executive stakeholder or client" },
  },
  {
    id: "node-3",
    type: "hitl_gate",
    position: { x: 610, y: 80 },
    data: { label: "Human Review Gate", subtext: "User must authorize staged 4:00 PM slot & email draft" },
  },
  {
    id: "node-4",
    type: "action",
    position: { x: 910, y: 80 },
    data: { label: "Dispatch & Mint Receipt", subtext: "Update Microsoft Graph event and record SHA-256 proof" },
  },

  // Pipeline 2: Urgent Email to Task
  {
    id: "node-5",
    type: "trigger",
    position: { x: 50, y: 280 },
    data: { label: "Inbound Email Marked Urgent", subtext: "Webhook trigger from Resend / Gmail priority parser" },
  },
  {
    id: "node-6",
    type: "condition",
    position: { x: 330, y: 280 },
    data: { label: "Action Item Confidence >= 0.85", subtext: "NLP classifier extracts clear checklist directives" },
  },
  {
    id: "node-7",
    type: "action",
    position: { x: 610, y: 280 },
    data: { label: "Create Structured Task", subtext: "Adds task to Kanban under 'To Do' with AI subtasks" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "node-1", target: "node-2", animated: true, style: { stroke: "#F28C38", strokeWidth: 2 } },
  { id: "e2-3", source: "node-2", target: "node-3", animated: true, style: { stroke: "#D97736", strokeWidth: 2 } },
  { id: "e3-4", source: "node-3", target: "node-4", animated: true, style: { stroke: "#477A58", strokeWidth: 2 } },

  { id: "e5-6", source: "node-5", target: "node-6", animated: true, style: { stroke: "#F28C38", strokeWidth: 2 } },
  { id: "e6-7", source: "node-6", target: "node-7", animated: true, style: { stroke: "#477A58", strokeWidth: 2 } },
];

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#F28C38", strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 3000);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6] shadow-soft overflow-hidden">
      {/* Canvas Top Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#FFFCF6]/90 backdrop-blur-xs p-1.5 rounded-xl border border-[#E8DFD1] shadow-2xs">
          <Badge variant="verified" className="text-[10px] font-mono">
            Interactive Canvas Mode
          </Badge>
          <span className="text-[11px] text-[#777064] hidden sm:inline">
            Drag nodes, connect ports, or click a node to inspect parameters.
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            size="sm"
            onClick={runSimulation}
            disabled={isSimulating}
            className="h-8 text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1.5 shadow-2xs"
          >
            <Play size={12} className={isSimulating ? "animate-spin" : ""} />
            <span>{isSimulating ? "Simulating Signal..." : "Test Run Simulation"}</span>
          </Button>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#FFFCF7]"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#E8DFD1" />
        <Controls className="!bg-[#FFFCF6] !border-[#E8DFD1] !rounded-xl !shadow-2xs text-[#29251F]" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "trigger") return "#F28C38";
            if (n.type === "hitl_gate") return "#C58A32";
            if (n.type === "action") return "#477A58";
            return "#D0C4B2";
          }}
          className="!bg-[#FFFCF6] !border-[#E8DFD1] !rounded-xl"
        />
      </ReactFlow>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="absolute top-14 right-3 w-80 rounded-xl border border-[#E8DFD1] bg-[#FFFCF6] p-4 shadow-elevated z-20 animate-in slide-in-from-right duration-150 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-2">
            <div className="flex items-center gap-1.5">
              <Sliders size={14} className="text-primary" />
              <span className="text-xs font-bold text-[#29251F]">Node Inspector</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-[#777064] hover:text-[#29251F] rounded-md hover:bg-[#F1EADF]"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#777064]">Node Title</span>
              <p className="font-semibold text-sm text-[#29251F]">{selectedNode.data.label as string}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#777064]">Description</span>
              <p className="text-[11px] text-[#777064] leading-relaxed">{selectedNode.data.subtext as string}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#F8F4EC] border border-[#E8DFD1] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-[#777064]">
                <span>Node Type:</span>
                <span className="font-bold text-[#29251F] uppercase">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between text-[#777064]">
                <span>Status:</span>
                <span className="text-[#477A58] font-bold">Active in Graph</span>
              </div>
              <div className="flex justify-between text-[#777064]">
                <span>Retry Policy:</span>
                <span>Exponential Backoff (3x)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

