import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InteractiveCanvas } from './components/InteractiveCanvas';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [prompt, setPrompt] = useState('A floating crystal palace with spiraling light bridges');
  const [modelData, setModelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateModel = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setModelData(null); // Clear previous model
    try {
      const response = await fetch(`${API_BASE_URL}/generate-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate model. The AI server might be busy.');
      }
      const data = await response.json();
      setModelData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section id="demo" className="mb-12 text-center">
          <p className="max-w-3xl mx-auto mb-6 text-gray-400">
            Describe your architectural vision below. Our AI will generate an interactive 3D model of your impossible idea.
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A serene, floating tower..."
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow text-gray-200"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateModel}
              disabled={isLoading}
              className="px-8 py-4 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              {isLoading ? 'Generating...' : 'Generate Model'}
            </button>
          </div>
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </section>

        <section className="mb-16">
          <div className="w-full h-[70vh] max-h-[800px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/30">
            <InteractiveCanvas modelData={modelData} />
          </div>
        </section>

      </main>
      <footer className="text-center py-6 mt-8 border-t border-gray-800">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} DreamStruct AI. Hackathon Edition.</p>
      </footer>
    </div>
  );
}

export default App;
