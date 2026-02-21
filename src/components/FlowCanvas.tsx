import React, { useCallback, useRef } from 'react';
import type { Connection, Edge, Node } from 'reactflow';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from './AgentNode';
import type { Team, Agent, Persona } from '../types';

const nodeTypes = {
  agent: AgentNode,
};

interface FlowCanvasProps {
  team: Team;
  onUpdate: (team: Team) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = React.memo(({ team, onUpdate }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Convert agents to nodes
  const initialNodes: Node[] = (team.agents || []).map((agent) => ({
    id: agent.id,
    type: 'agent',
    position: { x: agent.pos_x || 250, y: agent.pos_y || 200 },
    data: agent,
  }));

  // Convert connections to edges
  const initialEdges: Edge[] = (team.connections || []).map((conn, idx) => ({
    id: `e-${idx}`,
    source: conn.source,
    sourceHandle: conn.source_handle,
    target: conn.target,
    targetHandle: conn.target_handle,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#475569',
    },
    style: { stroke: '#475569', strokeWidth: 2 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const syncChanges = useCallback(
    async (newNodes: Node[], newEdges: Edge[]) => {
      const updatedAgents = newNodes.map((n) => n.data as Agent);
      const updatedConnections = newEdges.map((e) => ({
        source: e.source!,
        source_handle: e.sourceHandle || undefined,
        target: e.target!,
        target_handle: e.targetHandle || undefined,
      }));

      onUpdate({
        ...team,
        agents: updatedAgents,
        connections: updatedConnections,
      });
    },
    [onUpdate, team]
  );

  const onConnect = useCallback(
    async (params: Connection) => {
      setEdges((eds) => {
        const nextEdges = addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
            style: { stroke: '#475569', strokeWidth: 2 },
          },
          eds
        );
        syncChanges(nodes, nextEdges);

        // Persist connection to backend
        fetch('/api/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: team.id,
            source_id: params.source,
            source_handle: params.sourceHandle,
            target_id: params.target,
            target_handle: params.targetHandle,
          }),
        });

        return nextEdges;
      });
    },
    [setEdges, nodes, syncChanges, team.id]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const personaId = event.dataTransfer.getData('application/reactflow/personaId');

      if (!personaId) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const position = {
        x: event.clientX - (reactFlowBounds?.left || 0),
        y: event.clientY - (reactFlowBounds?.top || 0),
      };

      try {
        const pResp = await fetch('/api/personas');
        const personas = (await pResp.json()) as Persona[];
        const persona = personas.find((p) => p.id === personaId);

        if (!persona) return;

        const newAgent: Agent = {
          id: `agent-${Date.now()}`,
          team_id: team.id,
          role: persona.name,
          status: 'working',
          summary: `Newly created ${persona.name} agent.`,
          tokensUsed: 0,
          input_schema: persona.input_schema,
          output_schema: persona.output_schema,
          logs: [`Agent ${persona.name} initialized.`],
          pos_x: position.x,
          pos_y: position.y,
        };

        const newNode: Node = {
          id: newAgent.id,
          type: 'agent',
          position,
          data: newAgent,
        };

        setNodes((nds) => {
          const nextNodes = nds.concat(newNode);
          syncChanges(nextNodes, edges);
          return nextNodes;
        });

        // Persist agent to backend
        await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAgent),
        });
      } catch (error) {
        console.error('Failed to drop agent:', error);
      }
    },
    [setNodes, edges, syncChanges, team.id]
  );

  return (
    <div className="absolute inset-0 w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
});
