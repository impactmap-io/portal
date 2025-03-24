import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSolutionStore } from '../store/solutionStore';
import type { Solution } from '../types';

const GRID_SPACING = 250;
const UNCONNECTED_START_X = 50;
const START_Y = 50;

// All nodes use 'default' type to ensure consistent behavior
const NODE_TYPE = 'default';

const getNodeStyle = (category: Solution['category']) => {
  const baseStyle = {
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: '8px',
    minWidth: 150,
  };

  switch (category) {
    case 'product':
      return { ...baseStyle, background: '#e0f2fe', borderColor: '#7dd3fc' };
    case 'platform':
      return { ...baseStyle, background: '#fae8ff', borderColor: '#e879f9' };
    case 'service':
      return { ...baseStyle, background: '#dcfce7', borderColor: '#86efac' };
    case 'integration':
      return { ...baseStyle, background: '#fff1f2', borderColor: '#fda4af' };
    default:
      return baseStyle;
  }
};

const getEdgeStyle = (type: string) => {
  switch (type) {
    case 'collaboration':
      return {
        stroke: '#7dd3fc',
        strokeWidth: 2,
        strokeDasharray: '5,5'  // Dashed line for collaborations
      };
    case 'dependency':
      return {
        stroke: '#e879f9',
        strokeWidth: 2
      };
    case 'integration':
      return {
        stroke: '#86efac',
        strokeWidth: 2,
        strokeDasharray: '3,3'  // Dotted line for integrations
      };
    default:
      return { stroke: '#94a3b8' };
  }
};

const getEdgeMarkers = (flowType: string) => {
  switch (flowType) {
    case 'bidirectional':
      return {
        markerEnd: { type: MarkerType.ArrowClosed },
        markerStart: { type: MarkerType.ArrowClosed }
      };
    case 'lateral':
      return {
        markerEnd: { type: MarkerType.Arrow },
        markerStart: { type: MarkerType.Arrow },
        style: { strokeDasharray: '3,3' }
      };
    default: // unidirectional
      return {
        markerEnd: { type: MarkerType.ArrowClosed }
      };
  }
};

const getInitialNodePositions = (solutions: Solution[], edges: Edge[]) => {
  // Track connected nodes
  const connectedNodes = new Set<string>();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  // Separate connected and unconnected nodes
  const unconnectedNodes = solutions.filter(s => !connectedNodes.has(s.id));
  const connectedSolutions = solutions.filter(s => connectedNodes.has(s.id));

  // Position connected nodes in a grid
  const connectedPositions = connectedSolutions.reduce((acc, solution, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    acc[solution.id] = {
      x: col * GRID_SPACING + GRID_SPACING,
      y: row * GRID_SPACING + START_Y
    };
    return acc;
  }, {} as Record<string, { x: number, y: number }>);

  // Stack unconnected nodes vertically on the left
  const unconnectedPositions = unconnectedNodes.reduce((acc, solution, index) => {
    acc[solution.id] = {
      x: UNCONNECTED_START_X,
      y: index * (GRID_SPACING / 2) + START_Y
    };
    return acc;
  }, {} as Record<string, { x: number, y: number }>);

  return { ...connectedPositions, ...unconnectedPositions };
};

export default function SolutionMap() {
  const { solutions } = useSolutionStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [updateKey, setUpdateKey] = useState(0);

  // Subscribe to solution store changes
  useEffect(() => {
    const unsubscribe = useSolutionStore.subscribe(
      (state) => state.solutions,
      () => {
        setUpdateKey(prev => prev + 1);
      }
    );
    return () => unsubscribe();
  }, []);
  
  // Create edges and nodes using useMemo
  const { initialEdges, initialNodes } = useMemo(() => {
    const edges = solutions.flatMap((solution) => [
      // Collaboration edges
      ...(solution.collaborations?.map((collab) => ({
        id: `collab-${collab.id}`,
        source: collab.sourceSolutionId,
        target: collab.targetSolutionId,
        type: 'smoothstep',
        animated: collab.flowType !== 'lateral',
        label: collab.collaborationType,
        style: getEdgeStyle('collaboration'),
        ...getEdgeMarkers(collab.flowType || 'unidirectional'),
      })) || []),

      // Dependency edges
      ...(solution.dependencies?.map((dep) => ({
        id: `dep-${dep.id}`,
        source: dep.dependentSolutionId,
        target: dep.dependencySolutionId,
        type: 'smoothstep',
        animated: false,
        label: dep.dependencyType,
        style: getEdgeStyle('dependency'),
        ...getEdgeMarkers(dep.flowType || 'unidirectional'),
      })) || []),

      // Integration edges
      ...(solution.integrations?.map((integration) => ({
        id: `int-${integration.id}`,
        source: integration.sourceSolutionId,
        target: integration.targetSolutionId,
        type: 'smoothstep',
        animated: integration.flowType !== 'lateral',
        label: integration.integrationType,
        style: getEdgeStyle('integration'),
        ...getEdgeMarkers(integration.flowType || 'unidirectional'),
      })) || []),
    ]);

    // Calculate node positions
    const nodePositions = getInitialNodePositions(solutions, edges);

    // Create nodes with calculated positions
    const nodes = solutions.map((solution) => ({
      id: solution.id,
      type: NODE_TYPE,
      position: nodePositions[solution.id],
      data: {
        label: (
          <div className="text-sm">
            <div className="font-medium">{solution.name}</div>
            <div className="text-xs text-gray-500">{solution.category}</div>
          </div>
        ),
      },
      style: getNodeStyle(solution.category),
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    return { initialEdges: edges, initialNodes: nodes };
  }, [solutions, updateKey]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when solutions change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => [...eds, { ...params, type: 'smoothstep', animated: true }]);
  }, [setEdges]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full min-h-[500px] bg-white rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true
        }}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: true,
          maxZoom: 2
        }}
        minZoom={0.1}
        maxZoom={2}
        style={{ height: '100%' }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.data?.label?.props?.children[1]?.props?.children === 'product') return '#0ea5e9';
            if (n.data?.label?.props?.children[1]?.props?.children === 'platform') return '#d946ef';
            if (n.data?.label?.props?.children[1]?.props?.children === 'service') return '#22c55e';
            if (n.data?.label?.props?.children[1]?.props?.children === 'integration') return '#f43f5e';
            return '#000000';
          }}
          nodeColor={(n) => {
            if (n.data?.label?.props?.children[1]?.props?.children === 'product') return '#e0f2fe';
            if (n.data?.label?.props?.children[1]?.props?.children === 'platform') return '#fae8ff';
            if (n.data?.label?.props?.children[1]?.props?.children === 'service') return '#dcfce7';
            if (n.data?.label?.props?.children[1]?.props?.children === 'integration') return '#fff1f2';
            return '#ffffff';
          }}
        />
      </ReactFlow>
    </div>
  );
}