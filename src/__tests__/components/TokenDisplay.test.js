/**
 * Tests for the TokenDisplay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TokenDisplay from '../../components/Tokens/TokenDisplay.jsx';

describe('TokenDisplay', () => {
  it('labels the red and blue token groups', () => {
    render(<TokenDisplay sabotageTokens={{ red: 3, blue: 3 }} />);

    expect(screen.getByText('Red Sabotage Tokens')).toBeInTheDocument();
    expect(screen.getByText('Blue Sabotage Tokens')).toBeInTheDocument();
  });

  it('always renders three token slots per player regardless of count', () => {
    const { container } = render(<TokenDisplay sabotageTokens={{ red: 1, blue: 0 }} />);

    const allSlots = container.querySelectorAll('.w-10.h-10.rounded-full');
    expect(allSlots).toHaveLength(6);
  });

  it('fills only as many slots as remaining tokens for each player', () => {
    const { container } = render(<TokenDisplay sabotageTokens={{ red: 2, blue: 1 }} />);

    const redSlots = container.querySelectorAll('[class*="rounded-full"]');
    // First 3 slots are red, next 3 are blue, in render order.
    const filled = Array.from(redSlots).map((el) =>
      el.className.includes('from-red-500') || el.className.includes('from-blue-500')
    );

    expect(filled).toEqual([true, true, false, true, false, false]);
  });

  it('renders no filled slots when a player has zero tokens', () => {
    const { container } = render(<TokenDisplay sabotageTokens={{ red: 0, blue: 0 }} />);

    const filledSlots = container.querySelectorAll('[class*="shadow-red-500"], [class*="shadow-blue-500"]');
    expect(filledSlots).toHaveLength(0);
  });
});
