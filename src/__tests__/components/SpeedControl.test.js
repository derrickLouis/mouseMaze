/**
 * Tests for the SpeedControl component
 *
 * The slider is inverted (right = faster = lower ms), so these cover both the
 * label association merged in PR #11 and the inversion arithmetic.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeedControl from '../../components/SpeedControl/SpeedControl.jsx';
import {
  MIN_SPEED_MS,
  MAX_SPEED_MS,
  SPEED_SLIDER_STEP,
  SPEED_CALC_OFFSET,
  DEFAULT_SPEED_MS
} from '../../core/constants';

describe('SpeedControl', () => {
  it('associates the visible "Speed:" label with the slider', () => {
    const { container } = render(<SpeedControl playSpeed={DEFAULT_SPEED_MS} setPlaySpeed={() => {}} />);

    // Assert the htmlFor/id pair directly: the input also carries an
    // aria-label, which would mask a broken association from getByLabelText.
    const label = screen.getByText('Speed:');
    const slider = screen.getByRole('slider');

    expect(label.tagName).toBe('LABEL');
    expect(label.getAttribute('for')).toBe(slider.id);
    expect(slider.id).toBeTruthy();
    expect(container.querySelectorAll(`#${slider.id}`)).toHaveLength(1);
  });

  it('gives the slider an aria-label as well as the visible label', () => {
    render(<SpeedControl playSpeed={DEFAULT_SPEED_MS} setPlaySpeed={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Playback speed');
  });

  it('exposes the slider with the configured range', () => {
    render(<SpeedControl playSpeed={DEFAULT_SPEED_MS} setPlaySpeed={() => {}} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', String(MIN_SPEED_MS));
    expect(slider).toHaveAttribute('max', String(MAX_SPEED_MS));
    expect(slider).toHaveAttribute('step', String(SPEED_SLIDER_STEP));
  });

  it('announces the speed in seconds rather than raw slider units', () => {
    render(<SpeedControl playSpeed={2500} setPlaySpeed={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '2.5 seconds per turn');
  });

  it('shows the current speed in seconds', () => {
    render(<SpeedControl playSpeed={1200} setPlaySpeed={() => {}} />);
    expect(screen.getByText('1.2s')).toBeInTheDocument();
  });

  it('inverts the slider position so dragging right means faster', () => {
    render(<SpeedControl playSpeed={DEFAULT_SPEED_MS} setPlaySpeed={() => {}} />);
    expect(screen.getByRole('slider')).toHaveValue(String(SPEED_CALC_OFFSET - DEFAULT_SPEED_MS));
  });

  it('converts the slider value back into milliseconds on change', () => {
    const setPlaySpeed = jest.fn();
    render(<SpeedControl playSpeed={DEFAULT_SPEED_MS} setPlaySpeed={setPlaySpeed} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '4000' } });

    expect(setPlaySpeed).toHaveBeenCalledWith(SPEED_CALC_OFFSET - 4000);
  });

  it('maps the slider extremes onto the configured speed bounds', () => {
    const setPlaySpeed = jest.fn();
    render(<SpeedControl playSpeed={DEFAULT_SPEED_MS} setPlaySpeed={setPlaySpeed} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: String(MAX_SPEED_MS) } });
    expect(setPlaySpeed).toHaveBeenLastCalledWith(MIN_SPEED_MS);

    fireEvent.change(slider, { target: { value: String(MIN_SPEED_MS) } });
    expect(setPlaySpeed).toHaveBeenLastCalledWith(MAX_SPEED_MS);
  });
});
