import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface SortStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
}

const SortingVisualizer = () => {
  const [array, setArray] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [arraySize, setArraySize] = useState([20]);

  const generateRandomArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize[0] }, () => 
      Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
    setSteps([{ array: [...newArray] }]);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [arraySize]);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const bubbleSort = (arr: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const array = [...arr];
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...array],
          comparing: [j, j + 1],
          sorted: Array.from({ length: n - i - 1 }, (_, k) => n - 1 - k)
        });

        if (array[j] > array[j + 1]) {
          steps.push({
            array: [...array],
            swapping: [j, j + 1],
            sorted: Array.from({ length: n - i - 1 }, (_, k) => n - 1 - k)
          });
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
        }
      }
    }
    steps.push({ array: [...array], sorted: Array.from({ length: n }, (_, i) => i) });
    return steps;
  };

  const quickSort = (arr: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const array = [...arr];

    const partition = (low: number, high: number): number => {
      const pivot = array[high];
      steps.push({ array: [...array], pivot: high });
      
      let i = low - 1;
      
      for (let j = low; j <= high - 1; j++) {
        steps.push({ array: [...array], comparing: [j, high], pivot: high });
        
        if (array[j] < pivot) {
          i++;
          if (i !== j) {
            steps.push({ array: [...array], swapping: [i, j], pivot: high });
            [array[i], array[j]] = [array[j], array[i]];
          }
        }
      }
      
      steps.push({ array: [...array], swapping: [i + 1, high], pivot: high });
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      
      return i + 1;
    };

    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    };

    quickSortHelper(0, array.length - 1);
    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i) });
    return steps;
  };

  const mergeSort = (arr: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const array = [...arr];

    const merge = (left: number, mid: number, right: number) => {
      const leftArr = array.slice(left, mid + 1);
      const rightArr = array.slice(mid + 1, right + 1);
      
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        steps.push({ array: [...array], comparing: [left + i, mid + 1 + j] });
        
        if (leftArr[i] <= rightArr[j]) {
          array[k] = leftArr[i];
          i++;
        } else {
          array[k] = rightArr[j];
          j++;
        }
        k++;
        steps.push({ array: [...array] });
      }
      
      while (i < leftArr.length) {
        array[k] = leftArr[i];
        i++;
        k++;
        steps.push({ array: [...array] });
      }
      
      while (j < rightArr.length) {
        array[k] = rightArr[j];
        j++;
        k++;
        steps.push({ array: [...array] });
      }
    };

    const mergeSortHelper = (left: number, right: number) => {
      if (left >= right) return;
      
      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    };

    mergeSortHelper(0, array.length - 1);
    steps.push({ array: [...array], sorted: Array.from({ length: array.length }, (_, i) => i) });
    return steps;
  };

  const startSorting = () => {
    let sortSteps: SortStep[] = [];
    
    switch (algorithm) {
      case 'bubble':
        sortSteps = bubbleSort(array);
        break;
      case 'quick':
        sortSteps = quickSort(array);
        break;
      case 'merge':
        sortSteps = mergeSort(array);
        break;
    }
    
    setSteps(sortSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 101 - speed[0]);
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentStepData = steps[currentStep] || { array };

  const getBarColor = (index: number) => {
    if (currentStepData.sorted?.includes(index)) return 'bg-green-500';
    if (currentStepData.swapping?.includes(index)) return 'bg-red-500';
    if (currentStepData.comparing?.includes(index)) return 'bg-yellow-500';
    if (currentStepData.pivot === index) return 'bg-purple-500';
    return 'bg-blue-500';
  };

  const algorithmInfo = {
    bubble: { name: 'Bubble Sort', complexity: 'O(n²)', description: 'Compares adjacent elements and swaps them if they are in wrong order' },
    quick: { name: 'Quick Sort', complexity: 'O(n log n) avg', description: 'Divides array using a pivot and recursively sorts partitions' },
    merge: { name: 'Merge Sort', complexity: 'O(n log n)', description: 'Divides array into halves and merges them in sorted order' }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Algorithm</label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bubble">Bubble Sort</SelectItem>
              <SelectItem value="quick">Quick Sort</SelectItem>
              <SelectItem value="merge">Merge Sort</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Array Size: {arraySize[0]}</label>
          <Slider
            value={arraySize}
            onValueChange={setArraySize}
            max={50}
            min={5}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Speed: {speed[0]}%</label>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? () => setIsPlaying(false) : startSorting}
            className="flex-1"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={generateRandomArray} variant="outline" size="icon">
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
        <div className="flex items-end justify-center space-x-1 h-80">
          {currentStepData.array.map((value, index) => (
            <div
              key={index}
              className={`transition-all duration-200 ${getBarColor(index)} rounded-t`}
              style={{
                height: `${(value / 300) * 100}%`,
                width: `${Math.max(800 / currentStepData.array.length - 2, 4)}px`,
              }}
            />
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </div>
        
        <div className="flex justify-center space-x-4 mt-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Unsorted</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Comparing</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Swapping</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Sorted</span>
          </div>
          {algorithm === 'quick' && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Pivot</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
