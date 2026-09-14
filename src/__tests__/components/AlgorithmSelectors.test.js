/**
 * Tests for the AlgorithmSelectors component
 *
 * The selects previously had labels with no htmlFor, so assistive tech
 * announced them by their selected value ("Breadth-First Search") rather than
 * by what they control.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AlgorithmSelectors from '../../components/AlgorithmSelectors/AlgorithmSelectors.jsx';
import { ALGORITHM_OPTIONS } from '../../core/constants';

const renderSelectors = (overrides = {}) => {
  const props = {
    redAlgorithm: 'bfs',
    setRedAlgorithm: () => {},
    blueAlgorithm: 'astar',
    setBlueAlgorithm: () => {},
    ...overrides
  };
  render(<AlgorithmSelectors {...props} />);
  return props;
};

describe('AlgorithmSelectors', () => {
  it('names each select after the mouse it controls', () => {
    renderSelectors();
    expect(screen.getByRole('combobox', { name: 'Red Mouse Algorithm' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Blue Mouse Algorithm' })).toBeInTheDocument();
  });

  it('wires each visible label to its own select', () => {
    renderSelectors();

    const redLabel = screen.getByText('Red Mouse Algorithm');
    const blueLabel = screen.getByText('Blue Mouse Algorithm');
    const red = screen.getByRole('combobox', { name: 'Red Mouse Algorithm' });
    const blue = screen.getByRole('combobox', { name: 'Blue Mouse Algorithm' });

    expect(redLabel.getAttribute('for')).toBe(red.id);
    expect(blueLabel.getAttribute('for')).toBe(blue.id);
    expect(red.id).not.toBe(blue.id);
  });

  it('reflects the currently selected algorithm for each mouse', () => {
    renderSelectors({ redAlgorithm: 'dfs', blueAlgorithm: 'bidirectional' });
    expect(screen.getByRole('combobox', { name: 'Red Mouse Algorithm' })).toHaveValue('dfs');
    expect(screen.getByRole('combobox', { name: 'Blue Mouse Algorithm' })).toHaveValue('bidirectional');
  });

  it('offers every configured algorithm in both selects', () => {
    renderSelectors();

    for (const select of screen.getAllByRole('combobox')) {
      const values = Array.from(select.options).map((o) => o.value);
      expect(values).toEqual(ALGORITHM_OPTIONS.map((o) => o.value));
    }
  });

  it('reports the chosen value for the red mouse only', async () => {
    const setRedAlgorithm = jest.fn();
    const setBlueAlgorithm = jest.fn();
    renderSelectors({ setRedAlgorithm, setBlueAlgorithm });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Red Mouse Algorithm' }),
      'bidirectional'
    );

    expect(setRedAlgorithm).toHaveBeenCalledWith('bidirectional');
    expect(setBlueAlgorithm).not.toHaveBeenCalled();
  });

  it('reports the chosen value for the blue mouse only', async () => {
    const setRedAlgorithm = jest.fn();
    const setBlueAlgorithm = jest.fn();
    renderSelectors({ setRedAlgorithm, setBlueAlgorithm });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Blue Mouse Algorithm' }),
      'dfs'
    );

    expect(setBlueAlgorithm).toHaveBeenCalledWith('dfs');
    expect(setRedAlgorithm).not.toHaveBeenCalled();
  });
});
