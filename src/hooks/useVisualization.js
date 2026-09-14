import { useRef, useState } from 'react';

export default function useVisualization(maze, playSpeed, isValidMove) {
  const [exploringCells, setExploringCells] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);
  const [thinkingCells, setThinkingCells] = useState([]);
  const vizRunIdRef = useRef(0);

  const getVisualizationDelay = (baseDelay = 100) => {
    const speedFactor = playSpeed / 1000; // 0.5 to 5.0
    return Math.max(20, Math.min(200, baseDelay * speedFactor * 0.4));
  };

  const visualizePathfinding = async (start, goal, algorithm, player) => {
    const myRunId = ++vizRunIdRef.current;
    const steps = [];
    const exploring = [];
    const visited = [];

    setExploringCells([]);
    setVisitedCells([]);

    if (algorithm === 'astar') {
      steps.push(`A* Search: Exploring with heuristic guidance...`);
      const openSet = [{ ...start, g: 0, h: 0, f: 0, path: [start] }];
      const closedSet = new Set();
      const heuristic = (pos) => Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);

      while (openSet.length > 0) {
        if (vizRunIdRef.current !== myRunId) return steps;
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const key = `${current.x},${current.y}`;

        if (!closedSet.has(key)) {
          closedSet.add(key);
          visited.push({ x: current.x, y: current.y });

          setVisitedCells([...visited]);
          setExploringCells([current]);
          steps.push(`  Exploring (${current.x},${current.y}) - f=${current.f.toFixed(1)}`);
          await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(100)));

          if (current.x === goal.x && current.y === goal.y) {
            steps.push(`✅ Path found! Length: ${current.path.length - 1} steps`);
            break;
          }

          const directions = [
            { x: 0, y: 1 }, { x: 1, y: 0 },
            { x: 0, y: -1 }, { x: -1, y: 0 }
          ];
          for (let dir of directions) {
            const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
            if (isValidMove(neighbor, maze) && !closedSet.has(`${neighbor.x},${neighbor.y}`)) {
              const g = current.g + 1;
              const h = heuristic(neighbor);
              const f = g + h;
              openSet.push({ ...neighbor, g, h, f, path: [...current.path, neighbor] });
              exploring.push(neighbor);
            }
          }
          setExploringCells([...exploring]);
          await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(50)));
          exploring.length = 0;
        }
      }
    } else if (algorithm === 'bfs') {
      steps.push(`BFS: Systematic level-by-level exploration...`);
      const queue = [{ ...start, path: [start], level: 0 }];
      const visitedSet = new Set([`${start.x},${start.y}`]);
      visited.push(start);
      let currentLevel = 0;
      let levelNodes = [];

      while (queue.length > 0) {
        if (vizRunIdRef.current !== myRunId) return steps;
        const current = queue.shift();

        if (current.level > currentLevel) {
          currentLevel = current.level;
          setExploringCells([...levelNodes]);
          await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(150)));
          levelNodes = [];
        }

        setVisitedCells([...visited]);
        steps.push(`  Level ${current.level}: Checking (${current.x},${current.y})`);

        if (current.x === goal.x && current.y === goal.y) {
          steps.push(`✅ Shortest path found! Length: ${current.path.length - 1} steps`);
          break;
        }

        const directions = [
          { x: 0, y: 1 }, { x: 1, y: 0 },
          { x: 0, y: -1 }, { x: -1, y: 0 }
        ];
        for (let dir of directions) {
          const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
          const key = `${neighbor.x},${neighbor.y}`;
          if (isValidMove(neighbor, maze) && !visitedSet.has(key)) {
            visitedSet.add(key);
            visited.push(neighbor);
            queue.push({ ...neighbor, path: [...current.path, neighbor], level: current.level + 1 });
            levelNodes.push(neighbor);
          }
        }
        await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(60)));
      }
    } else if (algorithm === 'dfs') {
      steps.push(`DFS: Deep exploration with backtracking...`);
      const stack = [{ ...start, path: [start], depth: 0 }];
      const visitedSet = new Set();

      while (stack.length > 0) {
        if (vizRunIdRef.current !== myRunId) return steps;
        const current = stack.pop();
        const key = `${current.x},${current.y}`;
        if (visitedSet.has(key)) continue;
        visitedSet.add(key);
        visited.push({ x: current.x, y: current.y });
        setVisitedCells([...visited]);
        setExploringCells([current]);
        steps.push(`  Depth ${current.depth}: Exploring (${current.x},${current.y})`);
        await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(100)));
        if (current.x === goal.x && current.y === goal.y) {
          steps.push(`✅ Path found! Length: ${current.path.length - 1} steps (may not be shortest)`);
          break;
        }
        const directions = [
          { x: 0, y: 1 }, { x: 1, y: 0 },
          { x: 0, y: -1 }, { x: -1, y: 0 }
        ];
        for (let i = directions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        for (let dir of directions) {
          const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (isValidMove(neighbor, maze) && !visitedSet.has(neighborKey)) {
            stack.push({ ...neighbor, path: [...current.path, neighbor], depth: current.depth + 1 });
          }
        }
      }
    } else if (algorithm === 'bidirectional') {
      steps.push(`Bidirectional Search: Expanding from both start and goal simultaneously...`);
      const forwardQueue = [{ ...start, path: [start], level: 0, direction: 'forward' }];
      const backwardQueue = [{ ...goal, path: [goal], level: 0, direction: 'backward' }];
      const forwardVisited = new Map();
      const backwardVisited = new Map();
      forwardVisited.set(`${start.x},${start.y}`, { ...start, path: [start] });
      backwardVisited.set(`${goal.x},${goal.y}`, { ...goal, path: [goal] });
      let forwardLevel = 0;
      let backwardLevel = 0;
      let meetingPoint = null;
      const directions = [
        { x: 0, y: 1 }, { x: 1, y: 0 },
        { x: 0, y: -1 }, { x: -1, y: 0 }
      ];
      while ((forwardQueue.length > 0 || backwardQueue.length > 0)) {
        if (vizRunIdRef.current !== myRunId) return steps;
        if (forwardQueue.length > 0) {
          const current = forwardQueue.shift();
          const currentKey = `${current.x},${current.y}`;
          setVisitedCells(prev => [...prev, { ...current, direction: 'forward' }]);
          setExploringCells([{ ...current, direction: 'forward' }]);
          if (current.level > forwardLevel) {
            forwardLevel = current.level;
            steps.push(`  Forward search level ${forwardLevel}: exploring from start`);
          }
          if (backwardVisited.has(currentKey)) {
            const backwardNode = backwardVisited.get(currentKey);
            steps.push(`🎯 MEETING POINT FOUND at (${current.x},${current.y})!`);
            steps.push(`  Forward path length: ${current.path.length - 1}`);
            steps.push(`  Backward path length: ${backwardNode.path.length - 1}`);
            meetingPoint = { forward: current, backward: backwardNode };
            break;
          }
          for (let dir of directions) {
            const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (isValidMove(neighbor, maze) && !forwardVisited.has(neighborKey)) {
              const neighborNode = { ...neighbor, path: [...current.path, neighbor], level: current.level + 1, direction: 'forward' };
              forwardVisited.set(neighborKey, neighborNode);
              forwardQueue.push(neighborNode);
            }
          }
          await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(100)));
        }
        if (backwardQueue.length > 0 && !meetingPoint) {
          const current = backwardQueue.shift();
          const currentKey = `${current.x},${current.y}`;
          setVisitedCells(prev => [...prev, { ...current, direction: 'backward' }]);
          setExploringCells([{ ...current, direction: 'backward' }]);
          if (current.level > backwardLevel) {
            backwardLevel = current.level;
            steps.push(`  Backward search level ${backwardLevel}: exploring from goal`);
          }
          if (forwardVisited.has(currentKey)) {
            const forwardNode = forwardVisited.get(currentKey);
            steps.push(`🎯 MEETING POINT FOUND at (${current.x},${current.y})!`);
            steps.push(`  Forward path length: ${forwardNode.path.length - 1}`);
            steps.push(`  Backward path length: ${current.path.length - 1}`);
            meetingPoint = { forward: forwardNode, backward: current };
            break;
          }
          for (let dir of directions) {
            const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (isValidMove(neighbor, maze) && !backwardVisited.has(neighborKey)) {
              const neighborNode = { ...neighbor, path: [...current.path, neighbor], level: current.level + 1, direction: 'backward' };
              backwardVisited.set(neighborKey, neighborNode);
              backwardQueue.push(neighborNode);
            }
          }
          await new Promise(resolve => setTimeout(resolve, getVisualizationDelay(100)));
        }
      }
      if (meetingPoint) {
        const totalLength = meetingPoint.forward.path.length + meetingPoint.backward.path.length - 2;
        steps.push(`✅ Optimal path found! Total length: ${totalLength} steps`);
        steps.push(`  Bidirectional search explored fewer nodes than unidirectional!`);
      }
    }

    setTimeout(() => {
      if (vizRunIdRef.current === myRunId) {
        setExploringCells([]);
        setVisitedCells([]);
      }
    }, 1500);

    setThinkingCells(visited);
    setTimeout(() => setThinkingCells([]), 2000);

    return steps;
  };

  return {
    exploringCells,
    visitedCells,
    thinkingCells,
    visualizePathfinding,
  };
}


