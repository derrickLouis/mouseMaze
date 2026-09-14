import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game header', () => {
  render(<App />);
  const heading = screen.getByText(/Strategic Mice Competition/i);
  expect(heading).toBeInTheDocument();
});
