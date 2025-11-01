import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InteractiveCanvas } from './components/InteractiveCanvas';

const API_BASE_URL = 'http://localhost:3001/api';

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-lg font-bold rounded-t-lg transition-all duration-300 ${
            active
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);

function App() {
  const [activeTab, setActiveTab] = useState('architecture');
  
  // Architecture State
  const [modelPrompt, setModelPrompt] = useState("A serene temple garden with floating lily pads and a gentle waterfall of light");
  const [modelData, setModelData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [userShapes, setUserShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [customDimensions, setCustomDimensions] = useState({ width: 6, height: 0.2, depth: 6 });

  // Image FX State
  const [imageFile, setImageFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("Add a retro vintage filter and a sense of wonder");
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Video AI State
  const [videoFile, setVideoFile] = useState(null);
  const [videoImage, setVideoImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState("A cinematic, slow-motion shot of this scene, with shimmering light");
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  // Check for Veo API key on mount and when tab changes
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
        // Assume key selection is successful to avoid race conditions.
        setApiKeySelected(true);
        setVideoError(null);
    }
  };
  
  // --- Architecture Functions ---
  const handleGenerateModel = useCallback(async () => {
    // ... (existing function)
  }, [modelPrompt]);
  const handleAddFloor = useCallback(() => {
    // ... (existing function)
  }, [customDimensions, userShapes.length]);
  // ... other architecture handlers

  // --- Image FX Functions ---
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        setEditedImage(null);
        setImageError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if (!imageFile || !imagePrompt) {
        setImageError("Please upload an image and provide a prompt.");
        return;
    }
    setIsEditingImage(true);
    setImageError(null);
    setEditedImage(null);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        try {
            const response = await fetch(`${API_BASE_URL}/edit-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64String, mimeType: imageFile.type, prompt: imagePrompt }),
            });
            if (!response.ok) throw new Error('Failed to edit image.');
            const data = await response.json();
            setEditedImage(`data:${data.mimeType};base64,${data.imageBase64}`);
        } catch (err) {
            setImageError(err.message);
        } finally {
            setIsEditingImage(false);
        }
    };
  };

  // --- Video Generation Functions ---
   const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoImage(event.target.result);
        setGeneratedVideo(null);
        setVideoError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoFile || !videoPrompt) {
        setVideoError("Please upload an image and provide a prompt.");
        return;
    }
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideo(null);

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        try {
            const response = await fetch(`${API_BASE_URL}/generate-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    imageBase64: base64String, 
                    mimeType: videoFile.type, 
                    prompt: videoPrompt,
                    aspectRatio: aspectRatio
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.resetKey) setApiKeySelected(false);
                throw new Error(data.error || 'Failed to generate video.');
            }
            // Veo returns a URI that needs the API key appended for access
            const videoUrl = `${data.videoUri}&key=${process.env.REACT_APP_VEO_KEY_PLACEHOLDER}`;
            const videoDataResponse = await fetch(videoUrl);
            const videoBlob = await videoDataResponse.blob();
            const blobUrl = URL.createObjectURL(videoBlob);

            setGeneratedVideo(blobUrl);
        } catch (err) {
            setVideoError(err.message);
        } finally {
            setIsGeneratingVideo(false);
        }
    };
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 border-b-2 border-gray-700">
            <TabButton active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')}>Architecture AI</TabButton>
            <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')}>Image FX AI</TabButton>
            <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')}>Video AI</TabButton>
        </div>

        {/* Architecture Tab */}
        <div className={activeTab === 'architecture' ? 'block' : 'hidden'}>
          {/* ... existing architecture layout ... */}
           <section className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                {/* ... existing controls ... */}
            </div>
            <div className="w-full lg:w-2/3">
                <div className="w-full h-[80vh] min-h-[600px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/30 canvas-container">
                    <InteractiveCanvas 
                        modelData={modelData}
                        userShapes={userShapes}
                        selectedShapeId={selectedShapeId}
                        onShapeSelect={() => {}}
                    />
                </div>
            </div>
          </section>
        </div>

        {/* Image FX Tab */}
        <div className={activeTab === 'image' ? 'block' : 'hidden'}>
            <section className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-teal-500/20">
                <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">Image FX AI</h2>
                <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">Upload an image and use text to perform stunning edits with Gemini 2.5 Flash Image.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-center text-teal-300">Original</h3>
                        <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                           {originalImage ? <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain"/> : <p className="text-gray-600">Upload an image to start</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-center text-teal-300">Edited</h3>
                        <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                           {isEditingImage ? <p className="text-teal-400">Editing...</p> : (editedImage ? <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain"/> : <p className="text-gray-600">Your edited image will appear here</p>)}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex flex-col gap-4 max-w-xl mx-auto">
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="e.g., Add a retro filter..." className="w-full h-20 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow text-gray-200 resize-none" disabled={isEditingImage}/>
                    <button onClick={handleEditImage} disabled={!originalImage || isEditingImage} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-lg hover:from-teal-600 hover:to-green-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30 btn-glow">
                        {isEditingImage ? "Applying FX..." : "Apply AI Effect"}
                    </button>
                    {imageError && <p className="mt-2 text-red-400 text-center">{imageError}</p>}
                </div>
            </section>
        </div>

        {/* Video AI Tab */}
        <div className={activeTab === 'video' ? 'block' : 'hidden'}>
            <section className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-blue-500/20">
                 <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Video Generation AI</h2>
                 <p className="max-w-3xl mx-auto mb-6 text-gray-400 text-center">Upload a starting image, describe a scene, and generate a stunning video with Veo.</p>
                 
                {!apiKeySelected ? (
                    <div className="text-center p-8 bg-gray-900 rounded-lg">
                        <h3 className="text-xl font-bold text-yellow-400 mb-2">API Key Required for Veo</h3>
                        <p className="text-gray-400 mb-4">Video generation is a powerful feature that requires you to select your own API key. Billing is associated with your account.</p>
                        <p className="text-xs text-gray-500 mb-4">For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">billing documentation</a>.</p>
                        <button onClick={handleSelectApiKey} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 btn-glow">
                           Select API Key
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                             <div>
                                <h3 className="text-xl font-bold mb-2 text-center text-blue-300">Starting Image</h3>
                                <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                                   {videoImage ? <img src={videoImage} alt="Video start" className="max-h-full max-w-full object-contain"/> : <p className="text-gray-600">Upload an image to start</p>}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-bold mb-2 text-center text-blue-300">Generated Video</h3>
                                <div className="h-80 bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                                    {isGeneratingVideo ? <p className="text-blue-400 text-center">Generating video...<br/>This may take a few minutes.</p> : (generatedVideo ? <video src={generatedVideo} controls autoPlay loop className="max-h-full max-w-full object-contain"/> : <p className="text-gray-600">Your generated video will appear here</p>)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-4 max-w-xl mx-auto">
                            <input type="file" accept="image/*" onChange={handleVideoFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                            <textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} placeholder="e.g., A cinematic crane shot..." className="w-full h-20 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-gray-200 resize-none" disabled={isGeneratingVideo}/>
                            <div className="flex items-center justify-center gap-4">
                                <label className="font-semibold text-gray-400">Aspect Ratio:</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="p-2 bg-gray-800 border border-gray-700 rounded-md">
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                </select>
                            </div>
                            <button onClick={handleGenerateVideo} disabled={!videoImage || isGeneratingVideo} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 btn-glow">
                                {isGeneratingVideo ? "Generating..." : "Generate Video with Veo"}
                            </button>
                            {videoError && <p className="mt-2 text-red-400 text-center">{videoError}</p>}
                        </div>
                    </>
                )}
            </section>
        </div>

      </main>
      <footer className="text-center py-6 mt-8 border-t border-gray-800">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} DreamStruct AI. Hackathon Edition.</p>
      </footer>
    </div>
  );
}

export default App;