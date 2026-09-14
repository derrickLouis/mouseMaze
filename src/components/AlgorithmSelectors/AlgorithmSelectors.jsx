import React, { memo } from 'react';
import { ALGORITHM_OPTIONS } from '../../core/constants';

/**
 * Per-mouse pathfinding algorithm pickers.
 *
 * Each select is associated with its visible label via htmlFor/id so screen
 * readers announce "Red Mouse Algorithm", not just the selected value.
 */
const AlgorithmSelector = ({ id, label, value, onChange, theme }) => (
  <div className={`${theme.container} rounded-xl p-4 border`}>
    <label htmlFor={id} className={`block text-sm font-bold ${theme.label} mb-2`}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg ${theme.focus} transition-colors`}
    >
      {ALGORITHM_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const THEMES = {
  red: {
    container: 'bg-red-900/30 border-red-700',
    label: 'text-red-400',
    focus: 'focus:border-red-400'
  },
  blue: {
    container: 'bg-blue-900/30 border-blue-700',
    label: 'text-blue-400',
    focus: 'focus:border-blue-400'
  }
};

const AlgorithmSelectors = ({ redAlgorithm, setRedAlgorithm, blueAlgorithm, setBlueAlgorithm }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <AlgorithmSelector
        id="red-algorithm"
        label="Red Mouse Algorithm"
        value={redAlgorithm}
        onChange={setRedAlgorithm}
        theme={THEMES.red}
      />
      <AlgorithmSelector
        id="blue-algorithm"
        label="Blue Mouse Algorithm"
        value={blueAlgorithm}
        onChange={setBlueAlgorithm}
        theme={THEMES.blue}
      />
    </div>
  );
};

export default memo(AlgorithmSelectors);
