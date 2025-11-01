import React, { useRef } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';

export const InteractiveCanvas = ({ modelData }) => {
  const canvasRef = useRef(null);
  useBabylonScene(canvasRef, modelData);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" />;
};
