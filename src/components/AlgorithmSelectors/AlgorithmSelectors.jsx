import React from 'react';

const AlgorithmSelectors = ({ redAlgorithm, setRedAlgorithm, blueAlgorithm, setBlueAlgorithm }) => {
  return (
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
  );
};

export default AlgorithmSelectors;


