import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  value: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface TraversalStep {
  visitedNodes: string[];
  currentNode?: string;
  queue?: string[];
  stack?: string[];
  traversalOrder: number[];
}

const GraphVisualizer = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TraversalStep[]>([]);
  const [startNode, setStartNode] = useState<string>('');

  const generateRandomGraph = useCallback(() => {
    const nodeCount = 8;
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];
    
    // Create nodes in a circular layout
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount;
      const radius = 120;
      const centerX = 300;
      const centerY = 200;
      
      newNodes.push({
        id: `node-${i}`,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        value: i + 1
      });
    }
    
    // Create random edges
    const edgeCount = Math.floor(Math.random() * 6) + 8;
    const possibleEdges: GraphEdge[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        possibleEdges.push({
          from: `node-${i}`,
          to: `node-${j}`
        });
      }
    }
    
    // Ensure connectivity by creating a path through all nodes
    for (let i = 0; i < nodeCount - 1; i++) {
      newEdges.push({
        from: `node-${i}`,
        to: `node-${(i + 1) % nodeCount}`
      });
    }
    
    // Add random additional edges
    const remainingEdges = possibleEdges.filter(edge => 
      !newEdges.some(existing => 
        (existing.from === edge.from && existing.to === edge.to) ||
        (existing.from === edge.to && existing.to === edge.from)
      )
    );
    
    for (let i = 0; i < Math.min(edgeCount - newEdges.length, remainingEdges.length); i++) {
      const randomIndex = Math.floor(Math.random() * remainingEdges.length);
      newEdges.push(remainingEdges.splice(randomIndex, 1)[0]);
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    setStartNode(newNodes[0]?.id || '');
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    generateRandomGraph();
  }, [generateRandomGraph]);

  const getNeighbors = (nodeId: string): string[] => {
    const neighbors: string[] = [];
    edges.forEach(edge => {
      if (edge.from === nodeId) {
        neighbors.push(edge.to);
      } else if (edge.to === nodeId) {
        neighbors.push(edge.from);
      }
    });
    return neighbors;
  };

  const bfsTraversal = (startNodeId: string): TraversalStep[] => {
    const steps: TraversalStep[] = [];
    const visited = new Set<string>();
    const queue = [startNodeId];
    const traversalOrder: number[] = [];
    
    steps.push({
      visitedNodes: [],
      queue: [...queue],
      traversalOrder: []
    });
    
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      if (visited.has(currentNodeId)) continue;
      
      steps.push({
        visitedNodes: Array.from(visited),
        currentNode: currentNodeId,
        queue: [...queue],
        traversalOrder: [...traversalOrder]
      });
      
      visited.add(currentNodeId);
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (currentNode) {
        traversalOrder.push(currentNode.value);
      }
      
      steps.push({
        visitedNodes: Array.from(visited),
        queue: [...queue],
        traversalOrder: [...traversalOrder]
      });
      
      const neighbors = getNeighbors(currentNodeId);
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      });
      
      steps.push({
        visitedNodes: Array.from(visited),
        queue: [...queue],
        traversalOrder: [...traversalOrder]
      });
    }
    
    return steps;
  };

  const dfsTraversal = (startNodeId: string): TraversalStep[] => {
    const steps: TraversalStep[] = [];
    const visited = new Set<string>();
    const stack = [startNodeId];
    const traversalOrder: number[] = [];
    
    steps.push({
      visitedNodes: [],
      stack: [...stack],
      traversalOrder: []
    });
    
    while (stack.length > 0) {
      const currentNodeId = stack.pop()!;
      
      if (visited.has(currentNodeId)) continue;
      
      steps.push({
        visitedNodes: Array.from(visited),
        currentNode: currentNodeId,
        stack: [...stack],
        traversalOrder: [...traversalOrder]
      });
      
      visited.add(currentNodeId);
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (currentNode) {
        traversalOrder.push(currentNode.value);
      }
      
      steps.push({
        visitedNodes: Array.from(visited),
        stack: [...stack],
        traversalOrder: [...traversalOrder]
      });
      
      const neighbors = getNeighbors(currentNodeId);
      neighbors.reverse().forEach(neighbor => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      });
      
      steps.push({
        visitedNodes: Array.from(visited),
        stack: [...stack],
        traversalOrder: [...traversalOrder]
      });
    }
    
    return steps;
  };

  const startTraversal = () => {
    if (!startNode || nodes.length === 0) return;
    
    let newSteps: TraversalStep[] = [];
    
    switch (algorithm) {
      case 'bfs':
        newSteps = bfsTraversal(startNode);
        break;
      case 'dfs':
        newSteps = dfsTraversal(startNode);
        break;
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length]);

  const getNodeColor = (nodeId: string) => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return '#3b82f6';
    
    if (currentStepData.currentNode === nodeId) return '#f59e0b';
    if (currentStepData.visitedNodes.includes(nodeId)) return '#10b981';
    if (currentStepData.queue?.includes(nodeId) || currentStepData.stack?.includes(nodeId)) return '#8b5cf6';
    return '#3b82f6';
  };

  const algorithmInfo = {
    bfs: { 
      name: 'Breadth-First Search', 
      description: 'Explores neighbors level by level using a queue',
      complexity: 'O(V + E)'
    },
    dfs: { 
      name: 'Depth-First Search', 
      description: 'Explores as far as possible along each branch using a stack',
      complexity: 'O(V + E)'
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Algorithm</label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bfs">Breadth-First Search</SelectItem>
              <SelectItem value="dfs">Depth-First Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Start Node</label>
          <Select value={startNode} onValueChange={setStartNode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nodes.map(node => (
                <SelectItem key={node.id} value={node.id}>
                  Node {node.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? () => setIsPlaying(false) : startTraversal}
            className="flex-1"
            disabled={!startNode}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={generateRandomGraph} variant="outline" size="icon">
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }} 
            variant="outline" 
            size="icon"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{algorithmInfo[algorithm as keyof typeof algorithmInfo].name}</CardTitle>
          <CardDescription>
            {algorithmInfo[algorithm as keyof typeof algorithmInfo].description}
            <br />
            <span className="font-semibold">Time Complexity: {algorithmInfo[algorithm as keyof typeof algorithmInfo].complexity}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <svg width="600" height="400" className="mx-auto">
          {/* Render edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#6b7280"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Render nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill={getNodeColor(node.id)}
                stroke="#1f2937"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {node.value}
              </text>
            </g>
          ))}
        </svg>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 mb-2">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex justify-center space-x-4 text-xs mb-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Unvisited</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>In {algorithm === 'bfs' ? 'Queue' : 'Stack'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {algorithm === 'bfs' && steps[currentStep]?.queue && (
              <div className="bg-purple-100 p-3 rounded-lg">
                <h4 className="font-semibold mb-2">Queue:</h4>
                <div className="flex flex-wrap gap-2">
                  {steps[currentStep].queue.map((nodeId, index) => {
                    const node = nodes.find(n => n.id === nodeId);
                    return (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-purple-500 text-white rounded text-sm"
                      >
                        {node?.value}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {algorithm === 'dfs' && steps[currentStep]?.stack && (
              <div className="bg-purple-100 p-3 rounded-lg">
                <h4 className="font-semibold mb-2">Stack:</h4>
                <div className="flex flex-wrap gap-2">
                  {steps[currentStep].stack.map((nodeId, index) => {
                    const node = nodes.find(n => n.id === nodeId);
                    return (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-purple-500 text-white rounded text-sm"
                      >
                        {node?.value}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {steps[currentStep]?.traversalOrder.length > 0 && (
              <div className="bg-green-100 p-3 rounded-lg">
                <h4 className="font-semibold mb-2">Traversal Order:</h4>
                <div className="flex flex-wrap gap-2">
                  {steps[currentStep].traversalOrder.map((value, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;