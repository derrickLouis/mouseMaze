import React, { memo } from 'react';

const GameLog = ({ gameLog }) => {
  return (
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
  );
};

export default memo(GameLog);


