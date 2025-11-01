import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

router.post('/', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const generationPrompt = `
    As a visionary architect, translate the following user description into a futuristic, "impossible" structure: "${prompt}".

    Your response MUST be a JSON object representing the 3D model with a "shapes" array. Each shape object in the array should conform to the provided schema.

    Generate between 5 to 15 shapes to create an interesting composition. Use a mix of materials ('purple', 'teal', 'glass'). The entire structure should be centered around the origin (0,0,0) and fit within a 30x30x30 unit space.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: generationPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    shapes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['box', 'sphere', 'cylinder'] },
                                position: {
                                    type: Type.OBJECT,
                                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, z: { type: Type.NUMBER } },
                                    required: ['x', 'y', 'z']
                                },
                                rotation: {
                                    type: Type.OBJECT,
                                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, z: { type: Type.NUMBER } },
                                    required: ['x', 'y', 'z']
                                },
                                dimensions: {
                                    type: Type.OBJECT,
                                    properties: {
                                        width: { type: Type.NUMBER }, height: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, diameter: { type: Type.NUMBER }
                                    },
                                    required: ['width', 'height', 'depth']
                                },
                                material: { type: Type.STRING, enum: ['purple', 'teal', 'glass'] }
                            },
                            required: ['type', 'position', 'rotation', 'dimensions', 'material']
                        }
                    }
                },
                required: ['shapes']
            }
        }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    res.json(parsedResponse);

  } catch (error) {
    console.error("Error generating model with Gemini API:", error);
    res.status(500).json({ error: 'Failed to generate model from AI.' });
  }
});

export default router;
