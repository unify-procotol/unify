import { TodoExample } from './components/TodoExample';
function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">React Todo Demo</h1>
          <p className="text-gray-600">Simple todo list using UniRender & URPC</p>
        </header>
        
        <div className="bg-white rounded-lg shadow p-6">
          <TodoExample />
        </div>
      </div>
    </div>
  );
}

export default App; 