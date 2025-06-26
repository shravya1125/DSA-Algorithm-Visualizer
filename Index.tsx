import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SortingVisualizer from '@/components/SortingVisualizer';
import TreeVisualizer from '@/components/TreeVisualizer';
import GraphVisualizer from '@/components/GraphVisualizer';
import { BarChart3, GitBranch, Network } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            DSA Algorithm Visualizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Interactive visualizations of Data Structures and Algorithms. 
            Watch how sorting algorithms work, explore tree traversals, and understand graph algorithms step by step.
          </p>
        </div>

        <Tabs defaultValue="sorting" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="sorting" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Sorting Algorithms
            </TabsTrigger>
            <TabsTrigger value="trees" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Tree Traversals
            </TabsTrigger>
            <TabsTrigger value="graphs" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Graph Algorithms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sorting">
            <Card>
              <CardHeader>
                <CardTitle>Sorting Algorithm Visualizer</CardTitle>
                <CardDescription>
                  Watch how different sorting algorithms organize data step by step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SortingVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trees">
            <Card>
              <CardHeader>
                <CardTitle>Binary Tree Traversal Visualizer</CardTitle>
                <CardDescription>
                  Explore different ways to traverse binary trees with visual step-by-step execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreeVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graphs">
            <Card>
              <CardHeader>
                <CardTitle>Graph Algorithm Visualizer</CardTitle>
                <CardDescription>
                  Understand graph traversal algorithms with interactive node exploration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GraphVisualizer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
