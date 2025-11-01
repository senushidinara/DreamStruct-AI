import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InteractiveCanvas } from './components/InteractiveCanvas';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  // State for Model Generation
  const [modelPrompt, setModelPrompt] = useState("A wizard's observatory tower on a floating island, held aloft by glowing crystals");
  const [modelData, setModelData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelError, setModelError] = useState(null);

  // State for Feasibility Analysis
  const [feasibilityPrompt, setFeasibilityPrompt] = useState("A skyscraper made entirely of diamond, reaching into the upper atmosphere.");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);


  const handleGenerateModel = useCallback(async () => {
    if (!modelPrompt.trim()) {
      setModelError('Prompt cannot be empty.');
      return;
    }
    setIsGenerating(true);
    setModelError(null);
    setModelData(null); // Clear previous model
    try {
      const response = await fetch(`${API_BASE_URL}/generate-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: modelPrompt }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate model. The AI server might be busy.');
      }
      const data = await response.json();
      setModelData(data);
    } catch (err) {
      setModelError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [modelPrompt]);

  const handleAnalyzeFeasibility = useCallback(async () => {
    if (!feasibilityPrompt.trim()) {
        setAnalysisError('Prompt cannot be empty.');
        return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult("");
    try {
        const response = await fetch(`${API_BASE_URL}/analyze-feasibility`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: feasibilityPrompt }),
        });
        if (!response.ok) {
            throw new Error('Failed to get analysis. The AI server might be busy.');
        }
        const data = await response.json();
        setAnalysisResult(data.analysis);
    } catch (err) {
        setAnalysisError(err.message);
    } finally {
        setIsAnalyzing(false);
    }
  }, [feasibilityPrompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section id="generator" className="mb-16">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    AI Model Generator
                </h2>
                <p className="max-w-3xl mx-auto mb-6 text-gray-400">
                    Describe your architectural vision. Our AI will generate an interactive 3D model of your impossible idea.
                </p>
            </div>
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <input
              type="text"
              value={modelPrompt}
              onChange={(e) => setModelPrompt(e.target.value)}
              placeholder="e.g., A serene, floating tower..."
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow text-gray-200"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateModel}
              disabled={isGenerating}
              className="px-8 py-4 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 btn-glow"
            >
              {isGenerating ? 'Generating...' : 'Generate Model'}
            </button>
          </div>
          {modelError && <p className="mt-4 text-red-400 text-center">{modelError}</p>}
        </section>

        <section className="mb-16">
          <div className="w-full h-[70vh] max-h-[800px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/30 canvas-container">
            <InteractiveCanvas modelData={modelData} />
          </div>
        </section>

        <section id="ai-feasibility" className="bg-gray-800/50 rounded-xl p-6 md:p-8 shadow-lg border border-teal-500/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
            AI Feasibility Check
          </h2>
          <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">
            Describe an impossible concept. Our AI will provide a "realistic" analysis grounded in speculative science.
          </p>
          <div className="flex flex-col gap-4">
            <textarea
              value={feasibilityPrompt}
              onChange={(e) => setFeasibilityPrompt(e.target.value)}
              placeholder="e.g., A bridge made of solidified light..."
              className="w-full h-28 p-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow text-gray-200 resize-none"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleAnalyzeFeasibility}
              disabled={isAnalyzing}
              className="self-center px-8 py-3 font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-lg hover:from-teal-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30 btn-glow"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Feasibility'}
            </button>
          </div>
          {analysisError && <p className="mt-4 text-red-400 text-center">{analysisError}</p>}
          {analysisResult && (
            <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold mb-2 text-teal-400">AI Analysis:</h3>
              <p className="text-gray-300 whitespace-pre-wrap font-mono">{analysisResult}</p>
            </div>
          )}
        </section>

      </main>
      <footer className="text-center py-6 mt-8 border-t border-gray-800">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} DreamStruct AI. Hackathon Edition.</p>
      </footer>
    </div>
  );
}

export default App;
