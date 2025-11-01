
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ProjectCard } from './components/ProjectCard';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { getFeasibilitySuggestion, modernizeBlueprint } from './services/geminiService';
import { Project, ModelData, Shape } from './types';

const projects: Project[] = [
  {
    title: 'Poltergeist',
    description: 'A gravity-defying structure with floating floors and ethereal, transparent walls that challenge conventional physics.',
    gifUrl: 'https://picsum.photos/seed/poltergeist/600/400',
    demoUrl: '#',
    downloadUrl: '#',
  },
  {
    title: 'Phantom',
    description: 'An architectural marvel featuring impossible spiral bridges that connect hovering rooftop gardens across a cityscape.',
    gifUrl: 'https://picsum.photos/seed/phantom/600/400',
    demoUrl: '#',
    downloadUrl: '#',
  },
];

const App: React.FC = () => {
  // State for Feasibility Check
  const [prompt, setPrompt] = useState<string>('Describe the feasibility of a building with floating, magnetically levitated floors.');
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for Blueprint Revival
  const [blueprintImage, setBlueprintImage] = useState<string | null>(null);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [modernizedDescription, setModernizedDescription] = useState<string>('');
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isModernizing, setIsModernizing] = useState<boolean>(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for user-added shapes
  const [userShapes, setUserShapes] = useState<Shape[]>([]);

  const handleGenerateSuggestion = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion('');
    try {
      const result = await getFeasibilitySuggestion(prompt);
      setSuggestion(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setBlueprintFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setBlueprintImage(reader.result as string);
            setBlueprintError(null);
            setModernizedDescription('');
        };
        reader.readAsDataURL(file);
    }
  };

  const handleModernize = useCallback(async () => {
    if (!blueprintImage || !blueprintFile) {
      setBlueprintError('Please upload a blueprint image first.');
      return;
    }
    setIsModernizing(true);
    setBlueprintError(null);
    setModernizedDescription('');
    
    // Reset to default scene before loading new one
    setModelData(null); 

    try {
      const base64Data = blueprintImage.split(',')[1];
      const result = await modernizeBlueprint(base64Data, blueprintFile.type);
      setModernizedDescription(result.description);
      setModelData(result.model);
    } catch (err) {
      setBlueprintError(err instanceof Error ? err.message : 'An unknown error occurred while modernizing.');
    } finally {
      setIsModernizing(false);
    }
  }, [blueprintImage, blueprintFile]);

  const handleAddFloor = useCallback(() => {
    const newFloor: Shape = {
      type: 'box',
      position: { 
        x: (userShapes.length % 4 - 1.5) * 7,
        y: 10 + Math.floor(userShapes.length / 4) * 5,
        z: (userShapes.length % 3 - 1) * 5,
      },
      rotation: { x: 0, y: Math.random() * Math.PI, z: 0 },
      dimensions: { width: 6, height: 0.2, depth: 6 },
      material: 'teal',
    };
    setUserShapes(prevShapes => [...prevShapes, newFloor]);
  }, [userShapes]);
  
  const handleClearUserShapes = useCallback(() => {
    setUserShapes([]);
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8">
        
        <section id="demo" className="mb-12 md:mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Interactive Demo
            </h2>
            <p className="max-w-3xl mx-auto mb-8 text-gray-400">
              Interact with the scene, add your own platforms, or upload a blueprint below to see it modernized by AI.
            </p>
            <div className="w-full h-[60vh] max-h-[700px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/30 transition-all duration-300 hover:shadow-purple-500/40 hover:border-purple-500/50">
                <InteractiveCanvas modelData={modelData} userShapes={userShapes} />
            </div>
        </section>

        <section id="interactive-design" className="mb-12 md:mb-16 text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-300">Interactive Design</h3>
            <p className="max-w-2xl mx-auto mb-6 text-gray-400">
                Add your own custom elements to the architectural concept in real-time.
            </p>
            <div className="flex justify-center gap-4">
                 <button
                    onClick={handleAddFloor}
                    className="px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
                >
                    Add Floating Floor
                </button>
                {userShapes.length > 0 && (
                    <button
                        onClick={handleClearUserShapes}
                        className="px-6 py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Clear Customizations
                    </button>
                )}
            </div>
        </section>

        <section id="blueprint-revival" className="mb-12 md:mb-16 bg-gray-800/50 rounded-xl p-8 shadow-lg border border-blue-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Historical Blueprint Revival
            </h2>
            <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">
                Upload an image of a classic blueprint and watch our AI resurrect it into a modern, 3D architectural concept.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-64">
                    {blueprintImage ? (
                        <img src={blueprintImage} alt="Blueprint preview" className="max-w-full max-h-full object-contain rounded-md"/>
                    ) : (
                        <p className="text-gray-500">Blueprint preview will appear here</p>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                    <button
                        onClick={handleFileSelect}
                        disabled={isModernizing}
                        className="w-full px-6 py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                        {blueprintFile ? `Selected: ${blueprintFile.name}` : 'Upload Blueprint Image'}
                    </button>
                    <button
                        onClick={handleModernize}
                        disabled={isModernizing || !blueprintImage}
                        className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30"
                    >
                        {isModernizing ? 'Modernizing...' : 'Revive & Modernize'}
                    </button>
                </div>
            </div>
             {blueprintError && <p className="mt-4 text-red-400 text-center">{blueprintError}</p>}
             {modernizedDescription && (
                <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-2 text-cyan-400">AI Modernization Concept:</h3>
                <p className="text-gray-300 whitespace-pre-wrap font-mono">{modernizedDescription}</p>
                </div>
            )}
        </section>

        <section id="projects" className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            Featured Concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </section>

        <section id="ai-feasibility" className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-teal-500/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
            AI Feasibility Check
          </h2>
          <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">
            Have an idea for impossible architecture? Describe it below and our AI, powered by Gemini, will provide a feasibility analysis based on speculative science and creative engineering.
          </p>
          <div className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A bridge made of solidified light..."
              className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow text-gray-200 resize-none"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateSuggestion}
              disabled={isLoading}
              className="self-center px-8 py-3 font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-lg hover:from-teal-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30"
            >
              {isLoading ? 'Dreaming...' : 'Analyze Feasibility'}
            </button>
          </div>
          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          {suggestion && (
            <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold mb-2 text-teal-400">AI Analysis:</h3>
              <p className="text-gray-300 whitespace-pre-wrap font-mono">{suggestion}</p>
            </div>
          )}
        </section>
      </main>
      <footer className="text-center py-6 mt-12 border-t border-gray-800">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} DreamStruct AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
