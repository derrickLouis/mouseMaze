import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Brain, Zap, Activity, MapPin } from 'lucide-react';

const MouseMaze = () => {
  const [maze, setMaze] = useState([]);
  const [redPos, setRedPos] = useState({ x: 1, y: 1 });
  const [bluePos, setBluePos] = useState({ x: 8, y: 8 });
  const [cheesePos] = useState({ x: 5, y: 4 });
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [turn, setTurn] = useState(1);
  const [sabotageTokens, setSabotageTokens] = useState({ red: 3, blue: 3 });
  const [turnsSinceMove, setTurnsSinceMove] = useState({ red: 0, blue: 0 });
  const [redAlgorithm, setRedAlgorithm] = useState('bfs');
  const [blueAlgorithm, setBlueAlgorithm] = useState('astar');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [currentPaths, setCurrentPaths] = useState({ red: null, blue: null });
  const [thinkingCells, setThinkingCells] = useState([]);
  const [showPaths, setShowPaths] = useState(true);
  const [exploringCells, setExploringCells] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);
  const [playSpeed, setPlaySpeed] = useState(2500);
  const playIntervalRef = useRef(null);

  // Initialize maze on component mount
  useEffect(() => {
    initializeMaze();
  }, []);

  const initializeMaze = () => {
    const initialMaze = [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,1,0,0,0,1,0,1],
      [1,0,1,0,0,1,0,0,0,1],
      [1,0,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,0,0,1,1,0,1],
      [1,0,0,0,0,1,0,0,0,1],
      [1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1]
    ];
    setMaze(initialMaze);
    updatePaths(initialMaze, { x: 1, y: 1 }, { x: 8, y: 8 });
  };

  const resetGame = () => {
    initializeMaze();
    setRedPos({ x: 1, y: 1 });
    setBluePos({ x: 8, y: 8 });
    setCurrentPlayer('red');
    setTurn(1);
    setSabotageTokens({ red: 3, blue: 3 });
    setTurnsSinceMove({ red: 0, blue: 0 });
    setGameOver(false);
    setWinner(null);
    setIsPlaying(false);
    setGameLog([]);
    setCalculationSteps(['Game reset - Ready for strategic competition!']);
    setThinkingCells([]);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  };

  const isValidMove = (pos, currentMaze) => {
    const mazeToUse = currentMaze || maze;
    return pos.x >= 0 && pos.x < 10 &&
           pos.y >= 0 && pos.y < 10 &&
           mazeToUse[pos.y] && mazeToUse[pos.y][pos.x] === 0;
  };

  const findPathBFS = (start, goal, currentMaze) => {
    const queue = [{ ...start, path: [start] }];
    const visited = new Set([`${start.x},${start.y}`]);
   
    while (queue.length > 0) {
      const current = queue.shift();
     
      if (current.x === goal.x && current.y === goal.y) {
        return current.path;
      }
     
      const directions = [
        { x: 0, y: 1 }, { x: 1, y: 0 },
        { x: 0, y: -1 }, { x: -1, y: 0 }
      ];
     
      for (let dir of directions) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
        const key = `${neighbor.x},${neighbor.y}`;
       
        if (isValidMove(neighbor, currentMaze) && !visited.has(key)) {
          visited.add(key);
          queue.push({
            ...neighbor,
            path: [...current.path, neighbor]
          });
        }
      }
    }
   
    return null;
  };

  const findPathAStar = (start, goal, currentMaze) => {
    const openSet = [{ ...start, g: 0, h: 0, f: 0, path: [start] }];
    const closedSet = new Set();
   
    const heuristic = (pos) => Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
   
    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      const key = `${current.x},${current.y}`;
     
      if (closedSet.has(key)) continue;
      closedSet.add(key);
     
      if (current.x === goal.x && current.y === goal.y) {
        return current.path;
      }
     
      const directions = [
        { x: 0, y: 1 }, { x: 1, y: 0 },
        { x: 0, y: -1 }, { x: -1, y: 0 }
      ];
     
      for (let dir of directions) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
       
        if (isValidMove(neighbor, currentMaze) && !closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          const g = current.g + 1;
          const h = heuristic(neighbor);
          const f = g + h;
         
          openSet.push({
            ...neighbor,
            g, h, f,
            path: [...current.path, neighbor]
          });
        }
      }
    }
   
    return null;
  };

  const findPathDFS = (start, goal, currentMaze) => {
    const stack = [{ ...start, path: [start] }];
    const visited = new Set();
   
    while (stack.length > 0) {
      const current = stack.pop();
      const key = `${current.x},${current.y}`;
     
      if (visited.has(key)) continue;
      visited.add(key);
     
      if (current.x === goal.x && current.y === goal.y) {
        return current.path;
      }
     
      const directions = [
        { x: 0, y: 1 }, { x: 1, y: 0 },
        { x: 0, y: -1 }, { x: -1, y: 0 }
      ];
     
      // Shuffle directions for DFS randomness
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
     
      for (let dir of directions) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
        const neighborKey = `${neighbor.x},${neighbor.y}`;
       
        if (isValidMove(neighbor, currentMaze) && !visited.has(neighborKey)) {
          stack.push({
            ...neighbor,
            path: [...current.path, neighbor]
          });
        }
      }
    }
   
    return null;
  };

  const findPath = (start, goal, algorithm, currentMaze) => {
    switch(algorithm) {
      case 'astar':
        return findPathAStar(start, goal, currentMaze);
      case 'bfs':
        return findPathBFS(start, goal, currentMaze);
      case 'dfs':
        return findPathDFS(start, goal, currentMaze);
      case 'bidirectional':
        // Fallback to A* for bidirectional
        return findPathAStar(start, goal, currentMaze);
      default:
        return findPathBFS(start, goal, currentMaze);
    }
  };

  const updatePaths = (currentMaze, redPosition, bluePosition) => {
    const redPath = findPath(
      redPosition || redPos,
      cheesePos,
      redAlgorithm,
      currentMaze
    );
    const bluePath = findPath(
      bluePosition || bluePos,
      cheesePos,
      blueAlgorithm,
      currentMaze
    );
    setCurrentPaths({ red: redPath, blue: bluePath });
  };

  const visualizePathfinding = async (start, goal, algorithm, player) => {
    const steps = [];
    const exploring = [];
    const visited = [];
   
    // Clear previous visualization
    setExploringCells([]);
    setVisitedCells([]);
   
    if (algorithm === 'astar') {
      steps.push(`A* Search: Exploring with heuristic guidance...`);
      const openSet = [{ ...start, g: 0, h: 0, f: 0, path: [start] }];
      const closedSet = new Set();
      const heuristic = (pos) => Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
     
      let iterations = 0;
      while (openSet.length > 0 && iterations < 20) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const key = `${current.x},${current.y}`;
       
        if (!closedSet.has(key)) {
          closedSet.add(key);
          visited.push({ x: current.x, y: current.y });
         
          // Update visualization
          setVisitedCells([...visited]);
          setExploringCells([current]);
          steps.push(`  Exploring (${current.x},${current.y}) - f=${current.f.toFixed(1)}`);
          await new Promise(resolve => setTimeout(resolve, 100));
         
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
              openSet.push({...neighbor, g, h, f, path: [...current.path, neighbor]});
              exploring.push(neighbor);
            }
          }
         
          // Show cells being considered
          setExploringCells([...exploring]);
          await new Promise(resolve => setTimeout(resolve, 50));
          exploring.length = 0;
         
          iterations++;
        }
      }
    } else if (algorithm === 'bfs') {
      steps.push(`BFS: Systematic level-by-level exploration...`);
      const queue = [{ ...start, path: [start], level: 0 }];
      const visitedSet = new Set([`${start.x},${start.y}`]);
      visited.push(start);
     
      let iterations = 0;
      let currentLevel = 0;
      let levelNodes = [];
     
      while (queue.length > 0 && iterations < 25) {
        const current = queue.shift();
       
        // Show level-by-level exploration
        if (current.level > currentLevel) {
          currentLevel = current.level;
          setExploringCells([...levelNodes]);
          await new Promise(resolve => setTimeout(resolve, 150));
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
            queue.push({...neighbor, path: [...current.path, neighbor], level: current.level + 1});
            levelNodes.push(neighbor);
          }
        }
       
        iterations++;
        await new Promise(resolve => setTimeout(resolve, 60));
      }
    } else if (algorithm === 'dfs') {
      steps.push(`DFS: Deep exploration with backtracking...`);
      const stack = [{ ...start, path: [start], depth: 0 }];
      const visitedSet = new Set();
     
      let iterations = 0;
      while (stack.length > 0 && iterations < 20) {
        const current = stack.pop();
        const key = `${current.x},${current.y}`;
       
        if (visitedSet.has(key)) continue;
        visitedSet.add(key);
        visited.push({ x: current.x, y: current.y });
       
        // Update visualization for DFS
        setVisitedCells([...visited]);
        setExploringCells([current]);
        steps.push(`  Depth ${current.depth}: Exploring (${current.x},${current.y})`);
        await new Promise(resolve => setTimeout(resolve, 100));
       
        if (current.x === goal.x && current.y === goal.y) {
          steps.push(`✅ Path found! Length: ${current.path.length - 1} steps (may not be shortest)`);
          break;
        }
       
        const directions = [
          { x: 0, y: 1 }, { x: 1, y: 0 },
          { x: 0, y: -1 }, { x: -1, y: 0 }
        ];
       
        // Shuffle for DFS randomness
        for (let i = directions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [directions[i], directions[j]] = [directions[j], directions[i]];
        }
       
        for (let dir of directions) {
          const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (isValidMove(neighbor, maze) && !visitedSet.has(neighborKey)) {
            stack.push({...neighbor, path: [...current.path, neighbor], depth: current.depth + 1});
          }
        }
       
        iterations++;
      }
    }
   
    // Clear exploration visualization after a delay
    setTimeout(() => {
      setExploringCells([]);
      setVisitedCells([]);
    }, 1500);
   
    setThinkingCells(visited);
    setTimeout(() => setThinkingCells([]), 2000);
   
    return steps;
  };

  const calculateSabotageValue = (player, myDist, opponentDist, opponentPath, tokens) => {
    let sabotageReasons = [];
    let totalValue = 0;
   
    // Opponent is ahead - CRITICAL
    if (opponentDist < myDist && opponentDist <= 3) {
      totalValue += 50;
      sabotageReasons.push(`Opponent ahead by ${myDist - opponentDist} steps`);
    }
   
    // Opponent very close to winning - DESPERATE
    if (opponentDist <= 2) {
      totalValue += 80;
      sabotageReasons.push(`Opponent ${opponentDist} steps from winning!`);
    }
   
    // I'm much further behind - BLOCKING STRATEGY
    if (myDist > opponentDist + 3) {
      totalValue += 30;
      sabotageReasons.push(`Far behind, must block opponent`);
    }
   
    // Endgame with tokens remaining - USE OR LOSE
    if (myDist <= 5 && opponentDist <= 5 && tokens >= 2) {
      totalValue += 25;
      sabotageReasons.push(`Endgame - use remaining tokens`);
    }
   
    // Can create significant delay
    if (opponentPath && opponentPath.length > 2) {
      totalValue += 40;
      sabotageReasons.push(`Can block opponent's main path`);
    }
   
    // Algorithm-specific targeting
    const opponentAlgorithm = player === 'red' ? blueAlgorithm : redAlgorithm;
    if (opponentAlgorithm === 'astar' && opponentPath) {
      totalValue += 20;
      sabotageReasons.push(`Targeting predictable A* path`);
    } else if (opponentAlgorithm === 'dfs') {
      totalValue -= 15;
    }
   
    const shouldSabotage = totalValue >= 40;
   
    return {
      shouldSabotage,
      value: totalValue,
      reason: sabotageReasons.join(', ')
    };
  };

  const validateSabotageAction = (removePos, placePos, testMaze) => {
    // Create a temporary maze to test the sabotage
    const tempMaze = testMaze.map(row => [...row]);
    tempMaze[removePos.y][removePos.x] = 0;
    tempMaze[placePos.y][placePos.x] = 1;
   
    // Check if both mice can still reach the cheese
    const redPath = findPath(redPos, cheesePos, 'bfs', tempMaze);
    const bluePath = findPath(bluePos, cheesePos, 'bfs', tempMaze);
   
    // Both mice must have a valid path
    return redPath !== null && bluePath !== null;
  };

  const getStrategicSabotageAction = (opponentPath) => {
    // Find walls that can be removed
    const removableWalls = [];
    for (let y = 1; y < 9; y++) {
      for (let x = 1; x < 9; x++) {
        if (maze[y][x] === 1) {
          removableWalls.push({ x, y });
        }
      }
    }
   
    if (removableWalls.length === 0 || !opponentPath || opponentPath.length <= 1) {
      return null;
    }
   
    // Target opponent's path
    const targetPositions = opponentPath.slice(1, Math.min(4, opponentPath.length));
   
    // Try each combination and validate it doesn't block all paths
    for (let removeWall of removableWalls.slice(0, 10)) {
      for (let targetPos of targetPositions) {
        if (maze[targetPos.y][targetPos.x] === 0 &&
            !(targetPos.x === redPos.x && targetPos.y === redPos.y) &&
            !(targetPos.x === bluePos.x && targetPos.y === bluePos.y) &&
            !(targetPos.x === cheesePos.x && targetPos.y === cheesePos.y)) {
         
          // Validate this sabotage doesn't completely block either mouse
          if (validateSabotageAction(removeWall, targetPos, maze)) {
            return {
              type: 'sabotage',
              remove: removeWall,
              place: targetPos
            };
          }
        }
      }
    }
   
    // If no strategic placement works, try random valid placements
    const validPlacements = [];
    for (let y = 1; y < 9; y++) {
      for (let x = 1; x < 9; x++) {
        if (maze[y][x] === 0 &&
            !(x === redPos.x && y === redPos.y) &&
            !(x === bluePos.x && y === bluePos.y) &&
            !(x === cheesePos.x && y === cheesePos.y)) {
          validPlacements.push({ x, y });
        }
      }
    }
   
    // Shuffle and try random combinations
    for (let removeWall of removableWalls) {
      for (let placePos of validPlacements) {
        if (validateSabotageAction(removeWall, placePos, maze)) {
          return {
            type: 'sabotage',
            remove: removeWall,
            place: placePos
          };
        }
      }
    }
   
    return null;
  };

  const makeMove = async () => {
    if (gameOver) return;

    const player = currentPlayer;
    const algorithm = player === 'red' ? redAlgorithm : blueAlgorithm;
    const opponentAlgorithm = player === 'red' ? blueAlgorithm : redAlgorithm;
    const myPos = player === 'red' ? redPos : bluePos;
    const opponentPos = player === 'red' ? bluePos : redPos;
    const tokens = sabotageTokens[player];
    const turnsSince = turnsSinceMove[player];
   
    // Show thinking animation
    const calcSteps = [`${player.toUpperCase()} Mouse is thinking...`];
    calcSteps.push(`Step 1: Using ${algorithm.toUpperCase()} algorithm from (${myPos.x},${myPos.y}) to cheese (${cheesePos.x},${cheesePos.y})`);
   
    // Visualize pathfinding
    const pathSteps = await visualizePathfinding(myPos, cheesePos, algorithm, player);
    calcSteps.push(...pathSteps);
   
    // Calculate paths
    const myPath = findPath(myPos, cheesePos, algorithm, maze);
    const opponentPath = findPath(opponentPos, cheesePos, opponentAlgorithm, maze);
   
    const myDist = myPath ? myPath.length - 1 : 999;
    const opponentDist = opponentPath ? opponentPath.length - 1 : 999;
   
    calcSteps.push(`Step 2: Strategic Decision Making...`);
    calcSteps.push(`Current distances: Me=${myDist}, Opponent=${opponentDist}`);
    calcSteps.push(`Tokens remaining: ${tokens}`);
   
    // Force move if haven't moved recently
    if (turnsSince >= 1) {
      calcSteps.push(`⚠️ FORCED to move (turn limit exceeded)`);
      addToLog(`FORCED to move (turn limit)`, player);
     
      if (myPath && myPath.length > 1) {
        const steps = Math.min(2, myPath.length - 1);
        const newPos = myPath[steps];
       
        if (player === 'red') {
          setRedPos(newPos);
        } else {
          setBluePos(newPos);
        }
       
        setTurnsSinceMove(prev => ({ ...prev, [player]: 0 }));
        calcSteps.push(`🏃 DECISION: MOVE (Distance=${myDist})`);
        addToLog(`Moved to (${newPos.x}, ${newPos.y})`, player);
       
        if (newPos.x === cheesePos.x && newPos.y === cheesePos.y) {
          handleWin(player);
        }
      }
    } else {
      // Strategic decision
      const sabotageValue = calculateSabotageValue(player, myDist, opponentDist, opponentPath, tokens);
     
      calcSteps.push(`Option 1: MOVE - Would advance ${Math.min(2, myPath ? myPath.length - 1 : 0)} steps`);
     
      if (tokens > 0) {
        calcSteps.push(`Option 2: SABOTAGE - Analyzing strategic value...`);
        calcSteps.push(`  Sabotage value: ${sabotageValue.value} (threshold: 40)`);
        if (sabotageValue.reason) {
          calcSteps.push(`  Reasons: ${sabotageValue.reason}`);
        }
      }
     
      if (tokens > 0 && sabotageValue.shouldSabotage) {
        // Execute sabotage
        const sabotageAction = getStrategicSabotageAction(opponentPath);
        if (sabotageAction) {
          const newMaze = maze.map(row => [...row]);
          newMaze[sabotageAction.remove.y][sabotageAction.remove.x] = 0;
          newMaze[sabotageAction.place.y][sabotageAction.place.x] = 1;
          setMaze(newMaze);
         
          setSabotageTokens(prev => ({ ...prev, [player]: prev[player] - 1 }));
          setTurnsSinceMove(prev => ({ ...prev, [player]: prev[player] + 1 }));
         
          calcSteps.push(`🎯 DECISION: SABOTAGE (${sabotageValue.reason})`);
          addToLog(`SABOTAGE: Wall (${sabotageAction.remove.x},${sabotageAction.remove.y}) → (${sabotageAction.place.x},${sabotageAction.place.y})`, player);
        }
      } else if (myPath && myPath.length > 1) {
        // Move
        const steps = Math.min(2, myPath.length - 1);
        const newPos = myPath[steps];
       
        if (player === 'red') {
          setRedPos(newPos);
        } else {
          setBluePos(newPos);
        }
       
        setTurnsSinceMove(prev => ({ ...prev, [player]: 0 }));
        calcSteps.push(`🏃 DECISION: MOVE (Distance=${myDist}, Opponent=${opponentDist})`);
        addToLog(`Moved to (${newPos.x}, ${newPos.y})`, player);
       
        if (newPos.x === cheesePos.x && newPos.y === cheesePos.y) {
          handleWin(player);
        }
      }
    }
   
    setCalculationSteps(calcSteps);
   
    // Update paths after move
    updatePaths(maze, redPos, bluePos);
   
    // Switch player
    setCurrentPlayer(player === 'red' ? 'blue' : 'red');
    if (player === 'blue') {
      setTurn(prev => prev + 1);
    }
  };

  const handleWin = (player) => {
    setWinner(player);
    setGameOver(true);
    setIsPlaying(false);
    addToLog(`🎉 ${player.toUpperCase()} MOUSE WINS!`, 'system');
  };

  const addToLog = (message, type) => {
    setGameLog(prev => [...prev, { message, type, turn }]);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
      playIntervalRef.current = setInterval(() => {
        makeMove();
      }, playSpeed);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
   
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, gameOver, currentPlayer, redPos, bluePos, maze, sabotageTokens, turnsSinceMove, redAlgorithm, blueAlgorithm, playSpeed]);

  const getCellClass = (x, y) => {
    let classes = 'aspect-square flex items-center justify-center text-xl border-2 rounded-lg transition-all relative ';
   
    // Base cell type
    if (maze[y] && maze[y][x] === 1) {
      classes += 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700';
    } else {
      classes += 'bg-gradient-to-br from-gray-50 to-white border-gray-200';
    }
   
    // Search visualization effects (in order of priority)
    const isExploring = exploringCells.some(c => c.x === x && c.y === y);
    const isVisited = visitedCells.some(c => c.x === x && c.y === y);
    const isThinking = thinkingCells.some(tc => tc.x === x && tc.y === y);
   
    if (isExploring) {
      // Currently exploring - bright animation
      classes = classes.replace('from-gray-50 to-white', 'from-cyan-300 to-blue-400');
      classes += ' animate-pulse shadow-lg shadow-cyan-500/50 z-20';
    } else if (isVisited) {
      // Already visited - softer color
      classes = classes.replace('from-gray-50 to-white', 'from-purple-100 to-purple-200');
      classes += ' opacity-80';
    } else if (isThinking) {
      // Final path consideration
      classes = classes.replace('from-gray-50 to-white', 'from-yellow-100 to-yellow-200');
      classes += ' animate-pulse';
    }
   
    // Character positions (override search visualization)
    if (x === redPos.x && y === redPos.y) {
      classes = 'aspect-square flex items-center justify-center text-xl border-2 rounded-lg transition-all relative ';
      classes += 'ring-4 ring-red-400 bg-gradient-to-br from-red-100 to-red-200 z-30';
    }
    if (x === bluePos.x && y === bluePos.y) {
      classes = 'aspect-square flex items-center justify-center text-xl border-2 rounded-lg transition-all relative ';
      classes += 'ring-4 ring-blue-400 bg-gradient-to-br from-blue-100 to-blue-200 z-30';
    }
    if (x === cheesePos.x && y === cheesePos.y) {
      classes = 'aspect-square flex items-center justify-center text-xl border-2 rounded-lg transition-all relative ';
      classes += 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200 z-30';
    }
   
    return classes;
  };

  const getCellContent = (x, y) => {
    if (x === redPos.x && y === redPos.y) return '🐭';
    if (x === bluePos.x && y === bluePos.y) return '🐭';
    if (x === cheesePos.x && y === cheesePos.y) return '🧀';
    return '';
  };

  const renderPathDot = (x, y) => {
    const dots = [];
    if (showPaths && currentPaths.red && currentPaths.red.some(p => p.x === x && p.y === y)) {
      dots.push(
        <div key="red" className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full opacity-70" />
      );
    }
    if (showPaths && currentPaths.blue && currentPaths.blue.some(p => p.x === x && p.y === y)) {
      dots.push(
        <div key="blue" className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full opacity-70" />
      );
    }
    return dots;
  };

  const getDistance = (player) => {
    const path = player === 'red' ? currentPaths.red : currentPaths.blue;
    return path ? path.length - 1 : '∞';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Strategic Mice Competition
          </h1>
          <p className="text-gray-300">AI-powered mice compete using pathfinding algorithms and sabotage tactics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-700">
              {/* Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
                  <label className="text-sm text-gray-300 font-medium">Speed:</label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={playSpeed}
                    onChange={(e) => setPlaySpeed(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {(playSpeed / 1000).toFixed(1)}s
                  </span>
                </div>
                <button
                  onClick={() => setShowPaths(!showPaths)}
                  className={`p-2 rounded-lg transition-all ${
                    showPaths
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <MapPin size={20} />
                </button>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Pause' : 'Auto Play'}
                  </button>
                  <button
                    onClick={makeMove}
                    disabled={gameOver}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                    Step
                  </button>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg"
                  >
                    <RotateCcw size={20} />
                    Reset
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPaths(!showPaths)}
                    className={`p-2 rounded-lg transition-all ${
                      showPaths
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div className="text-white">
                  <span className="font-semibold">Turn {turn}</span> |
                  Current: <span className={`font-bold ${currentPlayer === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                    {currentPlayer.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-semibold">Red:</span>
                    <span>{getDistance('red')} steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-semibold">Blue:</span>
                    <span>{getDistance('blue')} steps</span>
                  </div>
                </div>
              </div>

              {/* Algorithm Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-900/30 rounded-xl p-4 border border-red-700">
                  <label className="block text-sm font-bold text-red-400 mb-2">Red Mouse Algorithm</label>
                  <select
                    value={redAlgorithm}
                    onChange={(e) => setRedAlgorithm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-red-400 transition-colors"
                  >
                    <option value="astar">A* Search</option>
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                    <option value="bidirectional">Bidirectional</option>
                  </select>
                </div>
                <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                  <label className="block text-sm font-bold text-blue-400 mb-2">Blue Mouse Algorithm</label>
                  <select
                    value={blueAlgorithm}
                    onChange={(e) => setBlueAlgorithm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-blue-400 transition-colors"
                  >
                    <option value="astar">A* Search</option>
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                    <option value="bidirectional">Bidirectional</option>
                  </select>
                </div>
              </div>

              {/* Maze Grid */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-xl shadow-inner">
                <div className="grid grid-cols-10 gap-0.5">
                  {maze.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={getCellClass(x, y)}
                      >
                        {getCellContent(x, y)}
                        {renderPathDot(x, y)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sabotage Tokens */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-red-900/30 rounded-xl p-4 border border-red-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400">Red Sabotage Tokens</span>
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            i < sabotageTokens.red
                              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                              : 'bg-gray-700'
                          }`}
                        >
                          <Zap size={18} className="text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400">Blue Sabotage Tokens</span>
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            i < sabotageTokens.blue
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                              : 'bg-gray-700'
                          }`}
                        >
                          <Zap size={18} className="text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Winner Message */}
              {winner && (
                <div className="mt-6">
                  <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-6 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-gray-900 text-center animate-pulse">
                      🎉 {winner.toUpperCase()} MOUSE WINS! 🎉
                    </h2>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Calculation Display */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-2xl shadow-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="text-blue-400" size={24} />
                </div>
                <h3 className="font-bold text-lg">AI Calculation Process</h3>
              </div>
              <div className="space-y-2 text-sm font-mono max-h-64 overflow-y-auto">
                {calculationSteps.length > 0 ? (
                  calculationSteps.map((step, i) => (
                    <div
                      key={i}
                      className={`
                        ${step.includes('DECISION') ? 'text-green-400 font-bold' : ''}
                        ${step.includes('FORCED') ? 'text-yellow-400' : ''}
                        ${step.includes('Step') ? 'text-blue-400 mt-2' : ''}
                        ${step.includes('Exploring') || step.includes('Level') || step.includes('Depth') ? 'text-gray-400 ml-2' : ''}
                        ${!step.includes('Step') && !step.includes('Exploring') && !step.includes('Level') && !step.includes('Depth') ? 'text-gray-300' : ''}
                      `}
                    >
                      {step}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Waiting for next turn...</div>
                )}
              </div>
            </div>

            {/* Game Statistics */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl shadow-2xl p-5 border border-purple-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="text-purple-400" size={24} />
                </div>
                <h3 className="font-bold text-lg text-white">Game Statistics</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Turns Since Move (Red):</span>
                  <span className={`font-bold ${turnsSinceMove.red >= 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {turnsSinceMove.red}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Turns Since Move (Blue):</span>
                  <span className={`font-bold ${turnsSinceMove.blue >= 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {turnsSinceMove.blue}
                  </span>
                </div>
                <div className="h-px bg-purple-700 my-2"></div>
                <div className="flex justify-between text-gray-300">
                  <span>Path Visualization:</span>
                  <span className={`font-bold ${showPaths ? 'text-green-400' : 'text-gray-500'}`}>
                    {showPaths ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Log */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-5 border border-gray-700">
              <h3 className="font-bold text-lg text-white mb-4">Game Log</h3>
              <div className="h-72 overflow-y-auto space-y-2 text-sm">
                {gameLog.map((entry, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border ${
                      entry.type === 'red'
                        ? 'bg-red-900/30 border-red-700 text-red-300'
                        : entry.type === 'blue'
                        ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                        : 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                    }`}
                  >
                    <span className="font-semibold">Turn {entry.turn}:</span> {entry.message}
                  </div>
                ))}
                {gameLog.length === 0 && (
                  <div className="text-gray-500">Game events will appear here...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MouseMaze;

