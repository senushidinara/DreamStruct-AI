
export interface Project {
  title: string;
  description: string;
  gifUrl: string;
  demoUrl: string;
  downloadUrl: string;
}

// Types for AI-generated 3D models
export type ShapeType = 'box' | 'sphere' | 'cylinder' | 'pyramid' | 'torus';
export type MaterialType = 'purple' | 'teal' | 'glass' | 'gold' | 'emissive_blue' | 'wood' | 'metallic' | 'rock';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
  diameter?: number; // For spheres/cylinders
  thickness?: number; // For torus
}

export interface Shape {
  id?: string; // Optional unique ID for user-added shapes
  type: ShapeType;
  position: Position;
  rotation: Rotation;
  scaling: Position; // For gizmo scaling
  dimensions: Dimensions;
  material: MaterialType;
}

export interface ModelData {
  shapes: Shape[];
}
