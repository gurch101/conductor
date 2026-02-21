import React, { useCallback, useRef } from 'react';
import type { Connection, Edge, Node } from 'reactflow';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
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
  const { screenToFlowPosition } = useReactFlow();

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

  const onNodesDelete = useCallback(
    async (deleted: Node[]) => {
      try {
        const idsToDelete = deleted.map((n) => n.id);

        // Delete from backend
        await Promise.all(
          idsToDelete.map((id) => fetch(`/api/agents/${id}`, { method: 'DELETE' }))
        );

        // Sync with parent state
        const updatedAgents = team.agents.filter((a) => !idsToDelete.includes(a.id));
        const updatedConnections = team.connections.filter(
          (c) => !idsToDelete.includes(c.source) && !idsToDelete.includes(c.target)
        );

        onUpdate({
          ...team,
          agents: updatedAgents,
          connections: updatedConnections,
        });
      } catch (error) {
        console.error('Failed to delete agents:', error);
      }
    },
    [onUpdate, team]
  );

  const syncChanges = useCallback(
    async (newNodes: Node[], newEdges: Edge[]) => {
      const updatedAgents = newNodes.map((n) => {
        const agent = n.data as Agent;
        return {
          ...agent,
          pos_x: n.position.x,
          pos_y: n.position.y,
        };
      });
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

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      const nextNodes = nodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              position: node.position,
              data: {
                ...(n.data as Agent),
                pos_x: node.position.x,
                pos_y: node.position.y,
              },
            }
          : n
      );

      setNodes(nextNodes);
      syncChanges(nextNodes, edges);

      try {
        await fetch(`/api/agents/${node.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pos_x: node.position.x, pos_y: node.position.y }),
        });
      } catch (error) {
        console.error('Failed to persist agent position:', error);
      }
    },
    [nodes, edges, setNodes, syncChanges]
  );

  const onEdgesDelete = useCallback(
    async (deleted: Edge[]) => {
      try {
        await Promise.all(
          deleted.map((edge) =>
            fetch('/api/connections', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                team_id: team.id,
                source_id: edge.source,
                source_handle: edge.sourceHandle || null,
                target_id: edge.target,
                target_handle: edge.targetHandle || null,
              }),
            })
          )
        );

        const deletedIds = new Set(deleted.map((edge) => edge.id));
        const remainingEdges = edges.filter((edge) => !deletedIds.has(edge.id));
        syncChanges(nodes, remainingEdges);
      } catch (error) {
        console.error('Failed to delete connections:', error);
      }
    },
    [team.id, edges, nodes, syncChanges]
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

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      try {
        const pResp = await fetch('/api/personas');
        const personas = (await pResp.json()) as Persona[];
        const persona = personas.find((p) => p.id === personaId);

        if (!persona) return;

        const newAgent: Agent = {
          id: `agent-${Date.now()}`,
          team_id: team.id,
          persona_id: persona.id,
          persona_name: persona.name,
          description: persona.description || persona.name,
          status: 'working',
          summary: `Newly created ${persona.name} agent.`,
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
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
    [setNodes, edges, syncChanges, team.id, screenToFlowPosition]
  );

  return (
    <div className="absolute inset-0 w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        deleteKeyCode={['Backspace', 'Delete']}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
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
