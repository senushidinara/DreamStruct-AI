
import React, { useRef } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { ModelData, Shape } from '../types';

interface InteractiveCanvasProps {
    modelData: ModelData | null;
    userShapes: Shape[];
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ modelData, userShapes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBabylonScene(canvasRef, modelData, userShapes);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" />;
};
