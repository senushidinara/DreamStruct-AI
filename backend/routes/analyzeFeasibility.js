import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

router.post('/', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const systemInstruction = `You are an expert in speculative architectural engineering and theoretical physics.
    Analyze the user's architectural concept with a creative and scientific mindset.
    Provide a feasibility analysis that includes:
    1.  Potential scientific principles that could make it possible (even if theoretical).
    2.  Major engineering challenges.
    3.  Creative solutions or alternative approaches.
    Keep your response concise, informative, and inspiring. Format it as plain text.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction
            }
        });
        res.json({ analysis: response.text });
    } catch (error) {
        console.error("Error analyzing feasibility with Gemini API:", error);
        res.status(500).json({ error: 'Failed to get analysis from AI.' });
    }
});

export default router;
