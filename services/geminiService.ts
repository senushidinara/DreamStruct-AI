
import { GoogleGenAI, Type } from "@google/genai";
import { ModelData } from "../types";

// FIX: Per coding guidelines, initialize GoogleGenAI directly with process.env.API_KEY.
// The API key is assumed to be configured in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';

export const getFeasibilitySuggestion = async (designPrompt: string): Promise<string> => {
  const systemInstruction = `You are an expert in speculative architectural engineering and theoretical physics.
    Analyze the user's architectural concept with a creative and scientific mindset.
    Provide a feasibility analysis that includes:
    1.  Potential scientific principles that could make it possible (even if theoretical).
    2.  Major engineering challenges.
    3.  Creative solutions or alternative approaches.
    Keep your response concise, informative, and inspiring. Format it with clear headings.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: designPrompt,
      config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          topP: 0.9,
          topK: 40
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "Error: The provided API key is not valid. Please ensure it is configured correctly.";
    }
    throw new Error("Failed to get suggestion from AI. Please try again later.");
  }
};

export const modernizeBlueprint = async (imageBase64: string, mimeType: string): Promise<{description: string; model: ModelData}> => {
    const prompt = `As a visionary architect, analyze this historical blueprint. Reimagine it as a futuristic, "impossible" structure. Retain the core layout but introduce concepts like floating elements, organic curves, and smart materials.
    
    Your response MUST be a JSON object with two keys:
    1. "description": A short, exciting textual summary of your modernized concept.
    2. "model": A JSON object representing the 3D model with a "shapes" array. Each shape object in the array should conform to the provided schema.
    
    Generate between 5 to 10 shapes to create an interesting composition. Use a mix of materials, including 'glass' for windows, 'gold' for accents, 'emissive_blue' for glowing parts, 'metallic' for structural elements, and 'wood' for organic elements. The entire structure should be centered around the origin (0,0,0) and fit within a 20x20x20 unit space.`;

    const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
    };

    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        model: {
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
                                                properties: {
                                                    x: { type: Type.NUMBER },
                                                    y: { type: Type.NUMBER },
                                                    z: { type: Type.NUMBER },
                                                },
                                                required: ['x', 'y', 'z']
                                            },
                                            rotation: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    x: { type: Type.NUMBER },
                                                    y: { type: Type.NUMBER },
                                                    z: { type: Type.NUMBER },
                                                },
                                                required: ['x', 'y', 'z']
                                            },
                                            dimensions: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    width: { type: Type.NUMBER },
                                                    height: { type: Type.NUMBER },
                                                    depth: { type: Type.NUMBER },
                                                    diameter: { type: Type.NUMBER },
                                                },
                                                required: ['width', 'height', 'depth']
                                            },
                                            material: { type: Type.STRING, enum: ['purple', 'teal', 'glass', 'gold', 'emissive_blue', 'wood', 'metallic'] }
                                        },
                                        required: ['type', 'position', 'rotation', 'dimensions', 'material']
                                    }
                                }
                            },
                            required: ['shapes']
                        }
                    },
                    required: ['description', 'model']
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!parsedResponse.description || !parsedResponse.model || !Array.isArray(parsedResponse.model.shapes)) {
             throw new Error("AI response is not in the expected format.");
        }

        return parsedResponse;

    } catch (error) {
        console.error("Error modernizing blueprint with Gemini API:", error);
        throw new Error("Failed to modernize blueprint. The AI may be unable to process this image.");
    }
};
