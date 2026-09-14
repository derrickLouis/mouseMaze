import React, { useEffect, memo } from 'react';
import { Play, Pause, Zap, Minimize2 } from 'lucide-react';
import MazeGrid from '../MazeGrid/MazeGrid.jsx';
import WinnerOverlay from '../WinnerOverlay/WinnerOverlay.jsx';
import { INITIAL_SABOTAGE_TOKENS } from '../../core/constants';

/**
 * Vertical token column shown either side of the board in fullscreen.
 */
const TokenColumn = ({ player, count, side }) => {
  const filled =
    player === 'red'
      ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
      : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50';
  const labelColor = player === 'red' ? 'text-red-300' : 'text-blue-300';
  const label = player === 'red' ? 'Red' : 'Blue';

  return (
    <div
      className={`hidden md:flex flex-col gap-3 items-center ${side === 'left' ? 'mr-6' : 'ml-6'}`}
      role="status"
      aria-label={`${label} sabotage tokens: ${count} of ${INITIAL_SABOTAGE_TOKENS} remaining`}
    >
      {[...Array(INITIAL_SABOTAGE_TOKENS)].map((_, i) => (
        <div
          key={`fs-${side}-${i}`}
          aria-hidden="true"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            i < count ? filled : 'bg-gray-700'
          }`}
        >
          <Zap size={20} className="text-white" />
        </div>
      ))}
      <span className={`mt-1 text-sm ${labelColor}`} aria-hidden="true">
        {label}
      </span>
    </div>
  );
};

/**
 * Fullscreen presentation of the board.
 *
 * Renders the same MazeGrid and WinnerOverlay as the windowed view so the two
 * never drift apart - only the chrome around the board differs.
 */
const FullscreenView = ({
  maze,
  getCellClass,
  getCellContent,
  renderPathDot,
  sabotageTokens,
  isPlaying,
  togglePlay,
  winner,
  resetGame,
  randomizeMaze,
  onExit,
}) => {
  // Escape leaves fullscreen, matching the browser's own fullscreen convention.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  const playLabel = isPlaying ? 'Pause' : 'Auto Play';

  return (
    <div className="fixed inset-0 z-[999] bg-black" role="dialog" aria-modal="true" aria-label="Fullscreen board">
      <div className="absolute top-3 right-3">
        <button
          onClick={onExit}
          aria-label="Exit Full Screen"
          title="Exit Full Screen"
          className="p-2 rounded-lg transition-all bg-gray-700 text-gray-200 hover:bg-gray-600"
        >
          <Minimize2 size={20} />
        </button>
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <TokenColumn player="red" count={sabotageTokens.red} side="left" />

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl shadow-inner w-[65vw] md:w-[60vw] max-w-[800px] mx-auto">
            <MazeGrid
              maze={maze}
              getCellClass={getCellClass}
              getCellContent={getCellContent}
              renderPathDot={renderPathDot}
              keyPrefix="fs"
            />

            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-3">
              <button
                onClick={togglePlay}
                aria-label={playLabel}
                title={playLabel}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {playLabel}
              </button>
            </div>

            <WinnerOverlay winner={winner} resetGame={resetGame} randomizeMaze={randomizeMaze} />
          </div>

          <TokenColumn player="blue" count={sabotageTokens.blue} side="right" />
        </div>
      </div>
    </div>
  );
};

export default memo(FullscreenView);
