import React from 'react';
import { Play, Pause, RotateCcw, ChevronRight, MapPin, Shuffle, Maximize2, Minimize2 } from 'lucide-react';

const Controls = ({
  isPlaying,
  togglePlay,
  makeMove,
  resetGame,
  randomizeMaze,
  showPaths,
  setShowPaths,
  isFullscreen,
  setIsFullscreen,
  gameOver,
}) => {
  const playLabel = isPlaying ? 'Pause' : 'Auto Play';
  const pathLabel = showPaths ? 'Hide paths' : 'Show paths';
  const fullscreenLabel = isFullscreen ? 'Exit Full Screen' : 'Full Screen';

  return (
    <div className="flex gap-3 items-center" role="group" aria-label="Game controls">
      <button
        onClick={togglePlay}
        aria-label={playLabel}
        title={playLabel}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {playLabel}
      </button>
      <button
        onClick={makeMove}
        disabled={gameOver}
        aria-label="Step"
        title="Step"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg disabled:opacity-50"
      >
        <ChevronRight size={20} />
        Step
      </button>
      <button
        onClick={resetGame}
        aria-label="Reset"
        title="Reset"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg"
      >
        <RotateCcw size={20} />
        Reset
      </button>
      <button
        onClick={randomizeMaze}
        aria-label="New Maze"
        title="New Maze"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg transition-all shadow-lg"
      >
        <Shuffle size={20} />
        New Maze
      </button>
      <button
        onClick={() => setShowPaths(!showPaths)}
        aria-label={pathLabel}
        aria-pressed={showPaths}
        title={pathLabel}
        className={`p-2 rounded-lg transition-all ${
          showPaths ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}
      >
        <MapPin size={20} />
      </button>
      <button
        onClick={() => setIsFullscreen((v) => !v)}
        aria-label={fullscreenLabel}
        aria-pressed={isFullscreen}
        title={fullscreenLabel}
        className="p-2 rounded-lg transition-all bg-gray-700 text-gray-200 hover:bg-gray-600"
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
    </div>
  );
};

export default Controls;
