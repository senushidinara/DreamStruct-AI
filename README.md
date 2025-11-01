# DreamStruct – AI-Powered Impossible Architecture Planner

Welcome to DreamStruct, a hackathon-ready project for Kiroween that allows users to design impossible buildings, hotels, or cities without the constraints of physics. Our AI-driven tools then provide feasibility suggestions and interactive 3D visualizations to bridge the gap between dream and reality.

**Tracks:** Resurrection, Frankenstein, Skeleton Crew, Costume Contest

![Demo GIF](https://placehold.co/800x400/171717/9333ea/gif?text=DreamStruct+Demo)

## 🚀 Core Features

1.  **Freeform 3D Building Designer:** Use natural language to describe gravity-defying structures, twisted towers, and spiral bridges. Our AI, powered by Gemini, translates your words into 3D models.
2.  **AI Feasibility Analyzer:** Get real-time feedback on your wildest designs. The AI analyzes structural stability, material suitability, and energy efficiency, offering creative solutions to make the impossible possible.
3.  **Interactive 3D Walkthrough:** Explore your AI-generated creations in a dynamic, interactive 3D canvas right in your browser, built with Babylon.js.
4.  **Skeleton Crew Templates:** Kickstart your projects with pre-built templates for generating models and running feasibility checks.

## 🤖 How We Use Kiro & Gemini

DreamStruct is built from the ground up with a powerful AI core, leveraging Kiro's development principles and the Gemini API.

-   **Vibe Coding:** We translate natural language prompts like "A serene, floating tower made of glass and glowing purple energy" directly into 3D model data. The backend sends these prompts to the Gemini model, which generates the structured JSON our frontend needs to render the scene.

-   **Spec-Driven Development:** Our AI's creative process is constrained by rules defined in the [`.kiro/specs`](./.kiro/specs/) folder. These markdown and JSON files ensure that generated structures, like floating floors, adhere to predefined architectural logic, maintaining consistency and purpose.

-   **Agent Hooks:** The [`.kiro/hooks`](./.kiro/hooks/) folder contains scripts that can be triggered to automate complex tasks. For example, after a model is generated, a hook could automatically run a feasibility check, analyze material costs, or ensure it connects to existing structures.

-   **Steering Docs:** To maintain a cohesive and futuristic aesthetic, we use [`.kiro/steering`](./.kiro/steering/) documents. This "vibe guide" directs the AI on color palettes, architectural styles, and atmospheric lighting, ensuring every creation feels like it belongs in the world of DreamStruct.

## 🛠️ Project Structure

```
dreamstruct-ai-architecture/
├─ frontend/         # React + Babylon.js Frontend
├─ backend/          # Node.js + Express + Gemini API Backend
├─ templates/        # Skeleton Crew template examples
├─ .kiro/            # Kiro integration folder (hooks, specs, steering)
├─ assets/           # Project visuals (GIFs, textures)
├─ README.md
└─ LICENSE
```

## ⚙️ Getting Started

To run DreamStruct locally, you'll need Node.js and npm installed. You will also need to provide your Gemini API key.

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file and add your Gemini API key
echo "API_KEY=your_gemini_api_key_here" > .env

# Start the backend server (runs on http://localhost:3001)
npm start
```

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server (runs on http://localhost:3000)
npm start
```

Now, open your browser and navigate to `http://localhost:3000` to see DreamStruct in action!
