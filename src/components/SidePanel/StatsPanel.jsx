import React, { memo } from 'react';
import { Activity } from 'lucide-react';

const StatsPanel = ({ turnsSinceMove, showPaths }) => {
  return (
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
  );
};

export default memo(StatsPanel);


