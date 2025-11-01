export interface Project {
  title: string;
  description: string;
  gifUrl: string;
  demoUrl: string;
  downloadUrl: string;
}

// Types for AI-generated 3D models
export type ShapeType = 'box' | 'sphere' | 'cylinder';
export type MaterialType = 'purple' | 'teal' | 'glass';

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
}

export interface Shape {
  type: ShapeType;
  position: Position;
  rotation: Rotation;
  dimensions: Dimensions;
  material: MaterialType;
}

export interface ModelData {
  shapes: Shape[];
}
