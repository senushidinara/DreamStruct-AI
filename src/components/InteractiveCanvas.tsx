
import React, { useRef } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { ModelData, Shape, Position } from '../types';

interface InteractiveCanvasProps {
    modelData: ModelData | null;
    userShapes: Shape[];
    onShapeSelect: (shapeId: string | null) => void;
    selectedShapeId: string | null;
    onShapeUpdate: (shapeId: string, newTransform: { position: Position, rotation: Position, scaling: Position }) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ modelData, userShapes, onShapeSelect, selectedShapeId, onShapeUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBabylonScene(canvasRef, modelData, userShapes, onShapeSelect, selectedShapeId, onShapeUpdate);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" />;
};
