import React, { memo } from 'react';
import { Zap } from 'lucide-react';

const TokenDisplay = ({ sabotageTokens }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-red-900/30 rounded-xl p-4 border border-red-700">
        <div className="flex items-center justify-between">
          <span className="font-bold text-red-400">Red Sabotage Tokens</span>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={`red-${i}`}
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
                key={`blue-${i}`}
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
  );
};

export default memo(TokenDisplay);


