
import React, { useRef } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { ModelData, Shape } from '../types';

interface InteractiveCanvasProps {
    modelData: ModelData | null;
    userShapes: Shape[];
    onShapeSelect: (shapeId: string | null) => void;
    selectedShapeId: string | null;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ modelData, userShapes, onShapeSelect, selectedShapeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBabylonScene(canvasRef, modelData, userShapes, onShapeSelect, selectedShapeId);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" />;
};
