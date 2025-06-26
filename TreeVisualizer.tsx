import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  x?: number;
  y?: number;
  id: string;
}

interface TraversalStep {
  visitedNodes: string[];
  currentNode?: string;
  traversalOrder: number[];
}

const TreeVisualizer = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [algorithm, setAlgorithm] = useState('inorder');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TraversalStep[]>([]);
  const [traversalResult, setTraversalResult] = useState<number[]>([]);

  const generateRandomTree = () => {
    const values = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100) + 1);
    let root: TreeNode | null = null;
    
    const insert = (node: TreeNode | null, value: number, id: string): TreeNode => {
      if (!node) {
        return { value, id };
      }
      
      if (value < node.value) {
        node.left = insert(node.left, value, id);
      } else {
        node.right = insert(node.right, value, id);
      }
      
      return node;
    };

    values.forEach((value, index) => {
      root = insert(root, value, `node-${index}`);
    });

    calculatePositions(root);
    setTree(root);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setTraversalResult([]);
  };

  const calculatePositions = (node: TreeNode | null, x = 400, y = 50, level = 0): void => {
    if (!node) return;
    
    const horizontalSpacing = 400 / Math.pow(2, level);
    
    node.x = x;
    node.y = y;
    
    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, y + 80, level + 1);
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, y + 80, level + 1);
    }
  };

  useEffect(() => {
    generateRandomTree();
  }, []);

  const inorderTraversal = (node: TreeNode | null, steps: TraversalStep[], visited: string[] = [], result: number[] = []): void => {
    if (!node) return;
    
    if (node.left) {
      inorderTraversal(node.left, steps, visited, result);
    }
    
    steps.push({
      visitedNodes: [...visited],
      currentNode: node.id,
      traversalOrder: [...result]
    });
    
    visited.push(node.id);
    result.push(node.value);
    
    steps.push({
      visitedNodes: [...visited],
      currentNode: undefined,
      traversalOrder: [...result]
    });
    
    if (node.right) {
      inorderTraversal(node.right, steps, visited, result);
    }
  };

  const preorderTraversal = (node: TreeNode | null, steps: TraversalStep[], visited: string[] = [], result: number[] = []): void => {
    if (!node) return;
    
    steps.push({
      visitedNodes: [...visited],
      currentNode: node.id,
      traversalOrder: [...result]
    });
    
    visited.push(node.id);
    result.push(node.value);
    
    steps.push({
      visitedNodes: [...visited],
      currentNode: undefined,
      traversalOrder: [...result]
    });
    
    if (node.left) {
      preorderTraversal(node.left, steps, visited, result);
    }
    if (node.right) {
      preorderTraversal(node.right, steps, visited, result);
    }
  };

  const postorderTraversal = (node: TreeNode | null, steps: TraversalStep[], visited: string[] = [], result: number[] = []): void => {
    if (!node) return;
    
    steps.push({
      visitedNodes: [...visited],
      currentNode: node.id,
      traversalOrder: [...result]
    });
    
    if (node.left) {
      postorderTraversal(node.left, steps, visited, result);
    }
    if (node.right) {
      postorderTraversal(node.right, steps, visited, result);
    }
    
    visited.push(node.id);
    result.push(node.value);
    
    steps.push({
      visitedNodes: [...visited],
      currentNode: undefined,
      traversalOrder: [...result]
    });
  };

  const bfsTraversal = (root: TreeNode): TraversalStep[] => {
    const steps: TraversalStep[] = [];
    const queue: TreeNode[] = [root];
    const visited: string[] = [];
    const result: number[] = [];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      
      steps.push({
        visitedNodes: [...visited],
        currentNode: node.id,
        traversalOrder: [...result]
      });
      
      visited.push(node.id);
      result.push(node.value);
      
      steps.push({
        visitedNodes: [...visited],
        currentNode: undefined,
        traversalOrder: [...result]
      });
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    return steps;
  };

  const startTraversal = () => {
    if (!tree) return;
    
    const newSteps: TraversalStep[] = [];
    
    switch (algorithm) {
      case 'inorder':
        inorderTraversal(tree, newSteps);
        break;
      case 'preorder':
        preorderTraversal(tree, newSteps);
        break;
      case 'postorder':
        postorderTraversal(tree, newSteps);
        break;
      case 'bfs':
        newSteps.push(...bfsTraversal(tree));
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
      }, 800);
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
      setTraversalResult(steps[steps.length - 1]?.traversalOrder || []);
    }
  }, [isPlaying, currentStep, steps.length]);

  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node || !node.x || !node.y) return null;
    
    const currentStepData = steps[currentStep];
    const isVisited = currentStepData?.visitedNodes.includes(node.id);
    const isCurrent = currentStepData?.currentNode === node.id;
    
    return (
      <g key={node.id}>
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="#6b7280"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#6b7280"
            strokeWidth="2"
          />
        )}
        
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          fill={isCurrent ? "#f59e0b" : isVisited ? "#10b981" : "#3b82f6"}
          stroke="#1f2937"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          {node.value}
        </text>
        
        {node.left && renderTree(node.left)}
        {node.right && renderTree(node.right)}
      </g>
    );
  };

  const algorithmInfo = {
    inorder: { name: 'In-Order (DFS)', description: 'Left → Root → Right. Results in sorted order for BST' },
    preorder: { name: 'Pre-Order (DFS)', description: 'Root → Left → Right. Useful for copying/serializing tree' },
    postorder: { name: 'Post-Order (DFS)', description: 'Left → Right → Root. Useful for deleting tree' },
    bfs: { name: 'Breadth-First Search', description: 'Level by level traversal using queue' }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Traversal Algorithm</label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inorder">In-Order (DFS)</SelectItem>
              <SelectItem value="preorder">Pre-Order (DFS)</SelectItem>
              <SelectItem value="postorder">Post-Order (DFS)</SelectItem>
              <SelectItem value="bfs">Breadth-First Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? () => setIsPlaying(false) : startTraversal}
            className="flex-1"
            disabled={!tree}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={generateRandomTree} variant="outline" size="icon">
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
              setTraversalResult([]);
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
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <svg width="800" height="400" className="mx-auto">
          {tree && renderTree(tree)}
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
          </div>
          
          {steps[currentStep]?.traversalOrder.length > 0 && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">Traversal Order:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {steps[currentStep].traversalOrder.map((value, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {traversalResult.length > 0 && !isPlaying && (
            <div className="bg-green-100 p-3 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">Final Result:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {traversalResult.map((value, index) => (
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
  );
};

export default TreeVisualizer;