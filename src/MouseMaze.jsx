import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Zap, Minimize2 } from 'lucide-react';
import MazeGrid from './components/MazeGrid/MazeGrid.jsx';
import Controls from './components/Controls/Controls.jsx';
import {
  MAX_MOVES_PER_TURN,
  FORCED_MOVE_THRESHOLD,
  MIN_SPEED_MS,
  MAX_SPEED_MS,
  SPEED_SLIDER_STEP,
  SPEED_CALC_OFFSET,
  MAZE_SIZE,
  CELL_TYPES
} from './core/constants';
import { findPath } from './algorithms/index.js';
import useVisualization from './hooks/useVisualization.js';
import useGameState from './hooks/useGameState.js';
import useAutoplay from './hooks/useAutoplay.js';
import { evaluateAllSabotageOptions, shouldSabotageOverMove } from './core/ai.js';
import AICalculationPanel from './components/SidePanel/AICalculationPanel.jsx';
import StatsPanel from './components/SidePanel/StatsPanel.jsx';
import GameLog from './components/SidePanel/GameLog.jsx';
import AlgorithmSelectors from './components/AlgorithmSelectors/AlgorithmSelectors.jsx';
import WinnerOverlay from './components/WinnerOverlay/WinnerOverlay.jsx';
import TokenDisplay from './components/Tokens/TokenDisplay.jsx';

const MouseMaze = () => {
  // Game state hook
  const gameState = useGameState();
  const {
    maze, setMaze,
    redPos, bluePos, cheesePos,
    currentPlayer, turn,
    sabotageTokens, turnsSinceMove,
    redAlgorithm, setRedAlgorithm,
    blueAlgorithm, setBlueAlgorithm,
    gameOver, winner,
    isPlaying, setIsPlaying,
    gameLog, calculationSteps, setCalculationSteps,
    currentPaths, showPaths, setShowPaths,
    playSpeed, setPlaySpeed,
    isFullscreen, setIsFullscreen,
    initializeMaze, randomizeMaze, resetGame,
    updatePaths, updatePlayerPosition,
    incrementTurnsSinceMove, switchPlayer,
    handleWin, addToLog, consumeSabotageToken
  } = gameState;

  // Visualization run ID ref (for cancellation)
  const vizRunIdRef = useRef(0);

  // Processing guard ref (for preventing overlapping moves)
  const isProcessingRef = useRef(false);
  const playIntervalRef = useRef(null);

  // Visualization hook
  const viz = useVisualization(maze, playSpeed, isValidMove);
  const exploringCellsHook = viz.exploringCells;
  const visitedCellsHook = viz.visitedCells;
  const thinkingCellsHook = viz.thinkingCells;
  const visualizePathfindingHook = viz.visualizePathfinding;

  // Optimize cell lookups: Convert arrays to Sets/Maps for O(1) access
  const exploringCellsSet = useMemo(() => {
    const set = new Map();
    exploringCellsHook.forEach(cell => {
      set.set(`${cell.x},${cell.y}`, cell);
    });
    return set;
  }, [exploringCellsHook]);

  const visitedCellsSet = useMemo(() => {
    const set = new Map();
    visitedCellsHook.forEach(cell => {
      set.set(`${cell.x},${cell.y}`, cell);
    });
    return set;
  }, [visitedCellsHook]);

  const thinkingCellsSet = useMemo(() => {
    const set = new Set();
    thinkingCellsHook.forEach(cell => {
      set.add(`${cell.x},${cell.y}`);
    });
    return set;
  }, [thinkingCellsHook]);

  // Memoize path sets for O(1) lookup
  const redPathSet = useMemo(() => {
    if (!showPaths || !currentPaths.red) return new Set();
    return new Set(currentPaths.red.map(p => `${p.x},${p.y}`));
  }, [showPaths, currentPaths.red]);

  const bluePathSet = useMemo(() => {
    if (!showPaths || !currentPaths.blue) return new Set();
    return new Set(currentPaths.blue.map(p => `${p.x},${p.y}`));
  }, [showPaths, currentPaths.blue]);

  // Initialize maze on component mount (only once)
  useEffect(() => {
    initializeMaze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isValidMove(pos, currentMaze) {
    const mazeToUse = currentMaze || maze;
    return (
      pos.x >= 0 &&
      pos.x < MAZE_SIZE &&
      pos.y >= 0 &&
      pos.y < MAZE_SIZE &&
      mazeToUse[pos.y] &&
      mazeToUse[pos.y][pos.x] === CELL_TYPES.OPEN
    );
  }

  // Wrapper for randomizeMaze with cleanup callback
  const handleRandomizeMaze = () => {
    randomizeMaze(() => {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    });
  };

  // Wrapper for resetGame with cleanup callback
  const handleResetGame = () => {
    resetGame(() => {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    });
  };

  const visualizePathfinding = async (start, goal, algorithm, player) => {
    return await visualizePathfindingHook(start, goal, algorithm, player);
  };

  // Memoize makeMove to prevent unnecessary hook re-runs
  const makeMove = useCallback(async () => {
    if (gameOver) return;
    if (isProcessingRef.current) return; // prevent overlap
    isProcessingRef.current = true;

    try {

    const player = currentPlayer;
    const algorithm = player === 'red' ? redAlgorithm : blueAlgorithm;
    const opponentAlgorithm = player === 'red' ? blueAlgorithm : redAlgorithm;
    const myPos = player === 'red' ? redPos : bluePos;
    const opponentPos = player === 'red' ? bluePos : redPos;
    const tokens = sabotageTokens[player];
    const turnsSince = turnsSinceMove[player];
   
    // Track resulting state for accurate path updates
    let resultingMaze = maze;
    let resultingRedPos = redPos;
    let resultingBluePos = bluePos;
   
    // Show thinking animation
    const calcSteps = [`${player.toUpperCase()} Mouse is thinking...`];
    calcSteps.push(`Step 1: Using ${algorithm.toUpperCase()} algorithm from (${myPos.x},${myPos.y}) to cheese (${cheesePos.x},${cheesePos.y})`);
   
    // Compute path first; if no path, skip visualization to avoid confusing flashes
      const previewPath = findPath(algorithm, myPos, cheesePos, maze);
    if (previewPath) {
      const pathSteps = await visualizePathfindingHook(myPos, cheesePos, algorithm, player);
    calcSteps.push(...pathSteps);
    } else {
      calcSteps.push(`No path available; skipping visualization`);
    }
   
    // Calculate paths
    const myPath = previewPath || findPath(algorithm, myPos, cheesePos, maze);
    const opponentPath = findPath(opponentAlgorithm, opponentPos, cheesePos, maze);
   
    const myDist = myPath ? myPath.length - 1 : 999;
    const opponentDist = opponentPath ? opponentPath.length - 1 : 999;
   
    calcSteps.push(`Step 2: Strategic Decision Making...`);
    calcSteps.push(`Current distances: Me=${myDist}, Opponent=${opponentDist}`);
    calcSteps.push(`Tokens remaining: ${tokens}`);
   
    // Force move if haven't moved recently
    if (turnsSince >= FORCED_MOVE_THRESHOLD) {
      calcSteps.push(`⚠️ FORCED to move (turn limit exceeded)`);
      addToLog(`FORCED to move (turn limit)`, player);
     
      if (myPath && myPath.length > 1) {
        const steps = Math.min(MAX_MOVES_PER_TURN, myPath.length - 1);
        const newPos = myPath[steps];
       
        updatePlayerPosition(player, newPos);
        resultingRedPos = player === 'red' ? newPos : resultingRedPos;
        resultingBluePos = player === 'blue' ? newPos : resultingBluePos;
        
        calcSteps.push(`🏃 DECISION: MOVE (Distance=${myDist})`);
        addToLog(`Moved to (${newPos.x}, ${newPos.y})`, player);
       
        if (newPos.x === cheesePos.x && newPos.y === cheesePos.y) {
          handleWin(player);
        }
      }
    } else {
      // Strategic decision using min-max evaluation
      calcSteps.push(`Step 3: Evaluating all strategic options...`);
     
      const movementBenefit = myPath ? Math.min(MAX_MOVES_PER_TURN, myPath.length - 1) : 0;
      calcSteps.push(`Option 1: MOVE - Would advance ${movementBenefit} steps (distance: ${myDist} → ${Math.max(0, myDist - movementBenefit)})`);
     
      let bestSabotage = null;
      if (tokens > 0) {
        calcSteps.push(`Option 2: SABOTAGE - Analyzing all wall combinations...`);
        bestSabotage = evaluateAllSabotageOptions(
          player,
          myPos,
          opponentPos,
          cheesePos,
          myDist,
          opponentDist,
          tokens,
          algorithm,
          opponentAlgorithm,
          maze
        );
        
        if (bestSabotage) {
          calcSteps.push(`  Best sabotage found: ${bestSabotage.reason}`);
          calcSteps.push(`  Remove wall (${bestSabotage.remove.x},${bestSabotage.remove.y}), place at (${bestSabotage.place.x},${bestSabotage.place.y})`);
          calcSteps.push(`  My distance: ${myDist} → ${bestSabotage.myNewDist}, Opponent: ${opponentDist} → ${bestSabotage.opponentNewDist}`);
          calcSteps.push(`  Total strategic value: ${bestSabotage.score.toFixed(1)}`);
        } else {
          calcSteps.push(`  No beneficial sabotage options found`);
        }
      }
      
      // Decision: Sabotage vs Move
      const shouldSabotage = bestSabotage && shouldSabotageOverMove(bestSabotage, movementBenefit);
      
      if (shouldSabotage) {
        // Execute sabotage
          const newMaze = resultingMaze.map(row => [...row]);
        newMaze[bestSabotage.remove.y][bestSabotage.remove.x] = 0; // Remove wall
        newMaze[bestSabotage.place.y][bestSabotage.place.x] = 1;   // Place wall
          setMaze(newMaze);
          resultingMaze = newMaze;
         
          consumeSabotageToken(player);
          incrementTurnsSinceMove(player);
         
        calcSteps.push(`🎯 DECISION: SABOTAGE - Strategic advantage detected!`);
        calcSteps.push(`  Benefit: ${bestSabotage.reason}`);
        addToLog(`SABOTAGE: Wall (${bestSabotage.remove.x},${bestSabotage.remove.y}) → (${bestSabotage.place.x},${bestSabotage.place.y})`, player);
        addToLog(`Strategic benefit: ${bestSabotage.reason}`, player);
      } else if (myPath && myPath.length > 1) {
        // Move
        const steps = Math.min(2, myPath.length - 1);
        const newPos = myPath[steps];
       
        updatePlayerPosition(player, newPos);
        resultingRedPos = player === 'red' ? newPos : resultingRedPos;
        resultingBluePos = player === 'blue' ? newPos : resultingBluePos;
       
        calcSteps.push(`🏃 DECISION: MOVE - Movement provides better strategic value`);
        calcSteps.push(`  Distance: ${myDist} → ${Math.max(0, myDist - steps)}, Opponent: ${opponentDist}`);
        addToLog(`Moved to (${newPos.x}, ${newPos.y})`, player);
       
        if (newPos.x === cheesePos.x && newPos.y === cheesePos.y) {
          handleWin(player);
        }
      }
    }
   
    setCalculationSteps(calcSteps);
   
    // Update paths using the resulting maze and positions to avoid one-turn lag
    updatePaths(resultingMaze, resultingRedPos, resultingBluePos);
    
      // Switch player (handles turn increment)
      switchPlayer();
    } finally {
      isProcessingRef.current = false;
    }
  }, [
    gameOver,
    currentPlayer,
    redPos,
    bluePos,
    redAlgorithm,
    blueAlgorithm,
    cheesePos,
    maze,
    sabotageTokens,
    turnsSinceMove,
    visualizePathfindingHook,
    evaluateAllSabotageOptions,
    shouldSabotageOverMove,
    updatePlayerPosition,
    consumeSabotageToken,
    incrementTurnsSinceMove,
    setMaze,
    setCalculationSteps,
    updatePaths,
    switchPlayer,
    handleWin,
    addToLog,
    findPath,
    FORCED_MOVE_THRESHOLD,
    MAX_MOVES_PER_TURN
  ]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Autoplay hook - manages scheduling
  useAutoplay(isPlaying, gameOver, makeMove, isProcessingRef, playSpeed, playIntervalRef);

  // Memoize getCellClass for performance (called 100 times per render)
  const getCellClass = useCallback((x, y) => {
    let classes = 'aspect-square flex items-center justify-center text-xl border-2 rounded-lg transition-all relative ';
   
    // Base cell type
    if (maze[y] && maze[y][x] === 1) {
      classes += 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700';
    } else {
      classes += 'bg-gradient-to-br from-gray-50 to-white border-gray-200';
    }
   
    // Search visualization effects (in order of priority) - O(1) lookup
    const cellKey = `${x},${y}`;
    const exploringCell = exploringCellsSet.get(cellKey);
    const visitedCell = visitedCellsSet.get(cellKey);
    const isThinking = thinkingCellsSet.has(cellKey);
   
    if (exploringCell) {
      // Currently exploring - different colors for bidirectional search
      if (exploringCell.direction === 'forward') {
        // Forward search - blue/cyan
      classes = classes.replace('from-gray-50 to-white', 'from-cyan-300 to-blue-400');
      classes += ' animate-pulse shadow-lg shadow-cyan-500/50 z-20';
      } else if (exploringCell.direction === 'backward') {
        // Backward search - orange/red
        classes = classes.replace('from-gray-50 to-white', 'from-orange-300 to-red-400');
        classes += ' animate-pulse shadow-lg shadow-orange-500/50 z-20';
      } else {
        // Default exploring (for other algorithms)
        classes = classes.replace('from-gray-50 to-white', 'from-cyan-300 to-blue-400');
        classes += ' animate-pulse shadow-lg shadow-cyan-500/50 z-20';
      }
    } else if (visitedCell) {
      // Already visited - different colors for bidirectional search
      if (visitedCell.direction === 'forward') {
        // Forward visited - light blue
        classes = classes.replace('from-gray-50 to-white', 'from-blue-100 to-blue-200');
        classes += ' opacity-70';
      } else if (visitedCell.direction === 'backward') {
        // Backward visited - light orange
        classes = classes.replace('from-gray-50 to-white', 'from-orange-100 to-orange-200');
        classes += ' opacity-70';
      } else {
        // Default visited (for other algorithms)
      classes = classes.replace('from-gray-50 to-white', 'from-purple-100 to-purple-200');
      classes += ' opacity-80';
      }
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
  }, [maze, redPos, bluePos, cheesePos, exploringCellsSet, visitedCellsSet, thinkingCellsSet]);

  // Memoize getCellContent
  const getCellContent = useCallback((x, y) => {
    if (x === redPos.x && y === redPos.y) return '🐭';
    if (x === bluePos.x && y === bluePos.y) return '🐹';
    if (x === cheesePos.x && y === cheesePos.y) return '🧀';
    return '';
  }, [redPos, bluePos, cheesePos]);

  // Memoize renderPathDot with O(1) Set lookups
  const renderPathDot = useCallback((x, y) => {
    const cellKey = `${x},${y}`;
    const dots = [];
    if (redPathSet.has(cellKey)) {
      dots.push(
        <div key="red" className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full opacity-70" />
      );
    }
    if (bluePathSet.has(cellKey)) {
      dots.push(
        <div key="blue" className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full opacity-70" />
      );
    }
    return dots;
  }, [redPathSet, bluePathSet]);

  const getDistance = (player) => {
    const path = player === 'red' ? currentPaths.red : currentPaths.blue;
    return path ? path.length - 1 : '∞';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 overflow-x-hidden" style={{ minHeight: '100vh' }}>
      <div className={`mx-auto transform origin-top scale-100 md:scale-100 ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto p-4 max-w-none w-screen h-screen' : 'max-w-6xl'}` }>
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
              {/* Centered Controls */}
              <div className="flex flex-col items-center gap-4 mb-6">
                {/* Main Control Buttons */}
                <Controls
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  makeMove={makeMove}
                  resetGame={handleResetGame}
                  randomizeMaze={handleRandomizeMaze}
                  showPaths={showPaths}
                  setShowPaths={setShowPaths}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={setIsFullscreen}
                />
                
                {/* Speed Control */}
                <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-6 py-3">
                  <label className="text-sm text-gray-300 font-medium">Speed:</label>
                  <input
                    type="range"
                    min={MIN_SPEED_MS}
                    max={MAX_SPEED_MS}
                    step={SPEED_SLIDER_STEP}
                    value={SPEED_CALC_OFFSET - playSpeed}
                    onChange={(e) => setPlaySpeed(SPEED_CALC_OFFSET - Number(e.target.value))}
                    className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {(playSpeed / 1000).toFixed(1)}s
                  </span>
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
              <AlgorithmSelectors
                redAlgorithm={redAlgorithm}
                setRedAlgorithm={setRedAlgorithm}
                blueAlgorithm={blueAlgorithm}
                setBlueAlgorithm={setBlueAlgorithm}
              />

              {/* Maze Grid */}
              <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-xl shadow-inner mx-auto ${isFullscreen ? 'max-w-[800px] md:max-w-[900px]' : 'max-w-[520px] md:max-w-[640px]'}`}>
                <MazeGrid
                  maze={maze}
                  getCellClass={getCellClass}
                  getCellContent={getCellContent}
                  renderPathDot={renderPathDot}
                />
                <WinnerOverlay winner={winner} resetGame={handleResetGame} randomizeMaze={handleRandomizeMaze} />
                      </div>

              {/* Sabotage Tokens */}
              <TokenDisplay sabotageTokens={sabotageTokens} />

              {/* Winner overlay now displayed above the board */}
                </div>
              </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Calculation Display */}
            <AICalculationPanel calculationSteps={calculationSteps} />

            {/* Game Statistics */}
            <StatsPanel turnsSinceMove={turnsSinceMove} showPaths={showPaths} />

            {/* Game Log */}
            <GameLog gameLog={gameLog} />
                        </div>
                    </div>
                  </div>
      {isFullscreen && (
        <div className="fixed inset-0 z-[999] bg-black">
          <div className="absolute top-3 right-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-lg transition-all bg-gray-700 text-gray-200 hover:bg-gray-600"
              title="Exit Full Screen"
            >
              <Minimize2 size={20} />
            </button>
                </div>
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Left tokens */}
              <div className="hidden md:flex flex-col gap-3 items-center mr-6">
                      {[...Array(3)].map((_, i) => (
                        <div
                    key={`fs-left-${i}`}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      i < sabotageTokens.red
                        ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                              : 'bg-gray-700'
                          }`}
                        >
                    <Zap size={20} className="text-white" />
                        </div>
                      ))}
                <span className="mt-1 text-sm text-red-300">Red</span>
                    </div>
              {/* Board */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl shadow-inner w-[65vw] md:w-[60vw] max-w-[800px] mx-auto">
                <div className="grid grid-cols-10 gap-0.5">
                  {maze.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`fs-${x}-${y}`}
                        className={getCellClass(x, y)}
                      >
                        {getCellContent(x, y)}
                        {renderPathDot(x, y)}
                    </div>
                  ))
                )}
              </div>
                {/* Fullscreen controls */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Pause' : 'Auto Play'}
                  </button>
            </div>
                {winner && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 rounded-xl">
                    <div className="bg-white/90 px-6 py-4 rounded-lg shadow-xl text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{winner.toUpperCase()} MOUSE WINS!</div>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleResetGame}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg shadow"
                        >
                          Play Again
                        </button>
                        <button
                          onClick={handleRandomizeMaze}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow"
                        >
                          New Maze
                        </button>
                </div>
              </div>
                </div>
                )}
                </div>
              {/* Right tokens */}
              <div className="hidden md:flex flex-col gap-3 items-center ml-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`fs-right-${i}`}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      i < sabotageTokens.blue
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                        : 'bg-gray-700'
                    }`}
                  >
                    <Zap size={20} className="text-white" />
                  </div>
                ))}
                <span className="mt-1 text-sm text-blue-300">Blue</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MouseMaze;

