
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ProjectCard } from './components/ProjectCard';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { getFeasibilitySuggestion, modernizeBlueprint, editImageWithGemini, generateVideoWithVeo } from './services/geminiService';
import { Project, ModelData, Shape, MaterialType, Position } from './types';

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

const TabButton = ({ active, onClick, children, icon }: { active: boolean, onClick: () => void, children: React.ReactNode, icon: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm md:text-base font-bold rounded-t-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-400 ${
            active
                ? 'bg-gray-800 text-white shadow-lg border-b-2 border-purple-400'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
        }`}
    >
        <span className="text-xl">{icon}</span>
        {children}
    </button>
);


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  // --- Architecture State ---
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isModernizing, setIsModernizing] = useState<boolean>(false);
  const [blueprintImage, setBlueprintImage] = useState<string | null>(null);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [modernizedDescription, setModernizedDescription] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userShapes, setUserShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [customDimensions, setCustomDimensions] = useState({ width: 6, height: 0.2, depth: 6 });

  // --- Image FX State ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>("Add a retro vintage filter and a sense of wonder");
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // --- Video AI State ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoImage, setVideoImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<string>("A cinematic, slow-motion shot of this scene, with shimmering light");
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  
  // Check for Veo API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true);
        setVideoError(null);
    }
  };

  // --- Architecture Functions ---
  const handleFileSelect = () => fileInputRef.current?.click();
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
    if (!blueprintImage || !blueprintFile) return;
    setIsModernizing(true);
    setBlueprintError(null);
    setModernizedDescription('');
    setUserShapes([]);
    setSelectedShapeId(null);
    setModelData(null);
    try {
      const base64Data = blueprintImage.split(',')[1];
      const result = await modernizeBlueprint(base64Data, blueprintFile.type);
      setModernizedDescription(result.description);
      setModelData(result.model);
    } catch (err) {
      setBlueprintError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsModernizing(false);
    }
  }, [blueprintImage, blueprintFile]);
  const handleAddFloor = useCallback(() => { /* ... existing ... */ }, [userShapes, customDimensions]);
  const handleClearUserShapes = useCallback(() => { /* ... existing ... */ }, []);
  const handleShapeSelect = useCallback((shapeId: string | null) => setSelectedShapeId(shapeId), []);
  const handleShapeUpdate = useCallback((shapeId: string, newTransform: { position: Position, rotation: Position, scaling: Position }) => {
    setUserShapes(prevShapes => prevShapes.map(shape => shape.id === shapeId ? { ...shape, ...newTransform } : shape));
  }, []);
  const handleUpdateShapeProperty = (property: 'position' | 'rotation' | 'scaling', axis: 'x' | 'y' | 'z', value: string) => { /* ... existing ... */ };
  const selectedShape = userShapes.find(s => s.id === selectedShapeId);

  // --- Image FX Functions ---
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result as string);
        setEditedImage(null);
        setImageError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = useCallback(async () => {
    if (!imageFile || !originalImage) return;
    setIsEditingImage(true);
    setImageError(null);
    setEditedImage(null);
    try {
      const base64String = originalImage.split(',')[1];
      const result = await editImageWithGemini(base64String, imageFile.type, imagePrompt);
      setEditedImage(`data:${result.mimeType};base64,${result.imageBase64}`);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to edit image.');
    } finally {
      setIsEditingImage(false);
    }
  }, [imageFile, originalImage, imagePrompt]);
  
  // --- Video Generation Functions ---
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoImage(event.target.result as string);
        setGeneratedVideo(null);
        setVideoError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = useCallback(async () => {
    if (!videoFile || !videoImage) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideo(null);
    try {
      const base64String = videoImage.split(',')[1];
      const result = await generateVideoWithVeo(base64String, videoFile.type, videoPrompt, aspectRatio);
      const videoDataResponse = await fetch(`${result.videoUri}&key=${process.env.API_KEY}`);
      const videoBlob = await videoDataResponse.blob();
      const blobUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideo(blobUrl);
    } catch (err) {
      if (err instanceof Error && err.message.includes("API key")) {
          setApiKeySelected(false);
      }
      setVideoError(err instanceof Error ? err.message : 'Failed to generate video.');
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [videoFile, videoImage, videoPrompt, aspectRatio]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8 border-b border-gray-700">
            <TabButton active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} icon="🏛️">Architecture AI</TabButton>
            <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon="🖼️">Image FX AI</TabButton>
            <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon="🎬">Video AI</TabButton>
        </div>

        {/* --- Architecture Tab --- */}
        <div className={activeTab === 'architecture' ? 'block' : 'hidden'}>
           <section id="demo" className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Interactive 3D Demo
                </h2>
                <div className="w-full h-[75vh] max-h-[800px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/30">
                    <InteractiveCanvas 
                      modelData={modelData} 
                      userShapes={userShapes} 
                      onShapeSelect={handleShapeSelect}
                      selectedShapeId={selectedShapeId}
                      onShapeUpdate={handleShapeUpdate}
                    />
                </div>
            </section>
            
            <section id="blueprint-revival" className="mt-12 bg-gray-800/50 rounded-xl p-8 shadow-lg border border-blue-500/20">
              {/* Blueprint Revival UI */}
              <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  Blueprint Revival
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-64">
                      {blueprintImage ? <img src={blueprintImage} alt="Blueprint" className="max-w-full max-h-full object-contain"/> : <p>Blueprint preview</p>}
                  </div>
                  <div className="flex flex-col gap-4">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                      <button onClick={handleFileSelect} disabled={isModernizing} className="w-full btn">
                          {blueprintFile ? `Selected: ${blueprintFile.name}` : 'Upload Blueprint'}
                      </button>
                      <button onClick={handleModernize} disabled={isModernizing || !blueprintImage} className="w-full btn-primary">
                          {isModernizing ? 'Modernizing...' : 'Revive & Modernize'}
                      </button>
                  </div>
              </div>
               {modernizedDescription && <div className="mt-4 p-4 bg-gray-900 rounded">{modernizedDescription}</div>}
               {blueprintError && <p className="text-red-400">{blueprintError}</p>}
            </section>
        </div>

        {/* --- Image FX Tab --- */}
        <div className={activeTab === 'image' ? 'block' : 'hidden'}>
            <section className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-teal-500/20">
                <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">Image FX AI</h2>
                <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">Upload an image and use text to perform stunning edits with Gemini 2.5 Flash Image.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-center text-teal-300">Original</h3>
                        <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2">
                           {originalImage ? <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain rounded"/> : <p className="text-gray-600">Upload an image to start</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-center text-teal-300">Edited</h3>
                        <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2">
                           {isEditingImage ? <div className="text-teal-400">Editing...</div> : (editedImage ? <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded"/> : <p className="text-gray-600">Your edited image appears here</p>)}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex flex-col gap-4 max-w-xl mx-auto">
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="e.g., Add a retro filter..." className="w-full h-20 p-3 bg-gray-900 border border-gray-700 rounded-lg" disabled={isEditingImage}/>
                    <button onClick={handleEditImage} disabled={!originalImage || isEditingImage} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-lg disabled:opacity-50">
                        {isEditingImage ? "Applying FX..." : "Apply AI Effect"}
                    </button>
                    {imageError && <p className="mt-2 text-red-400 text-center">{imageError}</p>}
                </div>
            </section>
        </div>

        {/* --- Video AI Tab --- */}
        <div className={activeTab === 'video' ? 'block' : 'hidden'}>
           <section className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-blue-500/20">
                 <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Video Generation AI</h2>
                 <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">Upload a starting image, describe a scene, and generate a stunning video with Veo.</p>
                {!apiKeySelected ? (
                    <div className="text-center p-8 bg-gray-900 rounded-lg">
                        <h3 className="text-xl font-bold text-yellow-400 mb-2">API Key Required for Veo</h3>
                        <p className="text-gray-400 mb-4">Video generation requires you to select your own API key. Billing is associated with your account.</p>
                        <p className="text-xs text-gray-500 mb-4"><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">Billing documentation</a>.</p>
                        <button onClick={handleSelectApiKey} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                           Select API Key
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                             <div>
                                <h3 className="text-xl font-bold mb-2 text-center text-blue-300">Starting Image</h3>
                                <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2">
                                   {videoImage ? <img src={videoImage} alt="Video start" className="max-h-full max-w-full object-contain rounded"/> : <p className="text-gray-600">Upload an image to start</p>}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-bold mb-2 text-center text-blue-300">Generated Video</h3>
                                <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2">
                                    {isGeneratingVideo ? <div className="text-blue-400 text-center">Generating video...<br/>This may take a few minutes.</div> : (generatedVideo ? <video src={generatedVideo} controls autoPlay loop className="max-h-full max-w-full object-contain rounded"/> : <p className="text-gray-600">Your video appears here</p>)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-4 max-w-xl mx-auto">
                            <input type="file" accept="image/*" onChange={handleVideoFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                            <textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} placeholder="e.g., A cinematic crane shot..." className="w-full h-20 p-3 bg-gray-900 border border-gray-700 rounded-lg" disabled={isGeneratingVideo}/>
                            <div className="flex items-center justify-center gap-4">
                                <label className="font-semibold text-gray-400">Aspect Ratio:</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} className="p-2 bg-gray-800 border border-gray-700 rounded-md">
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                </select>
                            </div>
                            <button onClick={handleGenerateVideo} disabled={!videoImage || isGeneratingVideo} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg disabled:opacity-50">
                                {isGeneratingVideo ? "Generating..." : "Generate Video with Veo"}
                            </button>
                            {videoError && <p className="mt-2 text-red-400 text-center">{videoError}</p>}
                        </div>
                    </>
                )}
            </section>
        </div>
      </main>
    </div>
  );
};

export default App;
