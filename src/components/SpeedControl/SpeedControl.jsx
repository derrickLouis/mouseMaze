import React, { memo } from 'react';
import {
  MIN_SPEED_MS,
  MAX_SPEED_MS,
  SPEED_SLIDER_STEP,
  SPEED_CALC_OFFSET
} from '../../core/constants';

/**
 * Playback speed slider.
 *
 * The slider is inverted relative to the value it controls: dragging right
 * means "faster", which is a *smaller* playSpeed in milliseconds. The
 * SPEED_CALC_OFFSET subtraction performs that inversion in both directions.
 */
const SpeedControl = ({ playSpeed, setPlaySpeed }) => {
  const seconds = (playSpeed / 1000).toFixed(1);

  return (
    <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-6 py-3">
      <label htmlFor="speed-control" className="text-sm text-gray-300 font-medium">
        Speed:
      </label>
      <input
        id="speed-control"
        type="range"
        min={MIN_SPEED_MS}
        max={MAX_SPEED_MS}
        step={SPEED_SLIDER_STEP}
        value={SPEED_CALC_OFFSET - playSpeed}
        onChange={(e) => setPlaySpeed(SPEED_CALC_OFFSET - Number(e.target.value))}
        aria-label="Playback speed"
        aria-valuetext={`${seconds} seconds per turn`}
        className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
      <span className="text-xs text-gray-400 w-12 text-right">{seconds}s</span>
    </div>
  );
};

export default memo(SpeedControl);
