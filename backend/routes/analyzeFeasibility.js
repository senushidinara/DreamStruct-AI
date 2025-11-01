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
    
    const systemInstruction = `You are a world-class expert in speculative architectural engineering, theoretical physics, and advanced materials science.
    The user will provide a fantastical, "impossible" architectural concept. Your task is to analyze it with a creative yet scientifically-grounded mindset.
    
    Provide a feasibility analysis that includes:
    1.  **Core Concept & Challenges:** Briefly summarize the main engineering and physics challenges (e.g., gravity, material strength, energy).
    2.  **Theoretical Principles for Success:** Brainstorm how this could be possible. Reference real-world, cutting-edge, or theoretical concepts. Examples:
        - For levitation: Mention magnetic levitation (maglev), quantum locking with superconductors, or exotic matter with negative mass.
        - For impossible strength: Reference carbon nanotubes, graphene composites, or diamond nanothreads.
        - For energy fields/light structures: Discuss plasma containment, solid-light theory, or advanced metamaterials.
    3.  **Creative Engineering Solutions:** Suggest practical (within this futuristic context) design modifications or alternative approaches to overcome the challenges.
    
    Your tone should be inspiring and informative, making the user feel like their dream is just a few scientific breakthroughs away. Format the response as clear, readable text.`;

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