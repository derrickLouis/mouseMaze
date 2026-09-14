import MouseMaze from './MouseMaze';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <MouseMaze />
      </div>
    </ErrorBoundary>
  );
}

export default App;
