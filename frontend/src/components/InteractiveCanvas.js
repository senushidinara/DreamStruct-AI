import React, { useRef } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';

export const InteractiveCanvas = ({ modelData, userShapes, selectedShapeId, onShapeSelect }) => {
  const canvasRef = useRef(null);
  useBabylonScene(canvasRef, modelData, userShapes, selectedShapeId, onShapeSelect);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" />;
};
