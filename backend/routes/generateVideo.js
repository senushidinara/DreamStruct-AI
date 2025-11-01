import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// NOTE: A new GoogleGenAI instance is created per request to ensure the latest API key is used
// after the user selects one in the frontend, as required by Veo guidelines.

router.post('/', async (req, res) => {
    const { imageBase64, mimeType, prompt, aspectRatio } = req.body;

    if (!imageBase64 || !mimeType || !prompt || !aspectRatio) {
        return res.status(400).json({ error: 'Image data, mimeType, prompt, and aspectRatio are required.' });
    }
    
    // Per Veo guidelines, create a new AI instance just before the call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: imageBase64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        // Polling loop to check for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            res.json({ videoUri: downloadLink });
        } else {
            throw new Error("Video generation completed, but no URI was returned.");
        }

    } catch (error) {
        console.error("Error generating video with Veo API:", error);
        // Handle API key errors specifically, as per Veo guidelines.
        if (error.message.includes("Requested entity was not found.")) {
             res.status(401).json({ error: 'API key may be invalid. Please re-select your API key.', resetKey: true });
        } else {
             res.status(500).json({ error: 'Failed to generate video with AI.' });
        }
    }
});

export default router;