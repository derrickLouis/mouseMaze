import React from 'react';

const WinnerOverlay = ({ winner, resetGame, randomizeMaze }) => {
  if (!winner) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 rounded-xl">
      <div className="bg-white/90 px-6 py-4 rounded-lg shadow-xl text-center">
        <div className="text-2xl font-bold text-gray-900 mb-2">{winner.toUpperCase()} MOUSE WINS!</div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg shadow"
          >
            Play Again
          </button>
          <button
            onClick={randomizeMaze}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow"
          >
            New Maze
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerOverlay;


