
import { useEffect, useRef } from 'react';
import type React from 'react';
import { ModelData, Shape, MaterialType, Position } from '../types';

declare const BABYLON: any;

const createStunningDefaultScene = (scene: any, materialMap: any) => {
    // A "Living Galaxy Core" Scene - Definitive Stunning Overhaul

    // 1. A Living, Breathing Sky with IBL
    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/space_nebula_1_256.env", scene);
    scene.environmentTexture = envTexture;

    // 2. Reflective "Infinity Floor"
    const mirror = new BABYLON.MirrorTexture("mirror", 1024, scene, true);
    const floor = BABYLON.MeshBuilder.CreatePlane("floor", {size: 100}, scene);
    const floorMaterial = new BABYLON.PBRMaterial("floorMat", scene);
    floorMaterial.reflectionTexture = mirror;
    floorMaterial.metallic = 0;
    floorMaterial.roughness = 0.1;
    floor.material = floorMaterial;
    floor.rotation.x = Math.PI / 2;
    mirror.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0); // Reflects everything above y=0

    // 3. The "Crystal Heart" Centerpiece with Volumetric God Rays
    const crystalHeart = BABYLON.MeshBuilder.CreateIcoSphere("crystalHeart", {radius: 4, subdivisions: 3}, scene);
    crystalHeart.material = materialMap.glass;
    crystalHeart.position.y = 8;
    mirror.renderList.push(crystalHeart);

    const heartLight = new BABYLON.PointLight("heartLight", new BABYLON.Vector3(0, 8, 0), scene);
    heartLight.diffuse = new BABYLON.Color3(1.0, 0.7, 1.0);
    heartLight.specular = new BABYLON.Color3(1, 1, 1);
    heartLight.range = 100;
    
    const godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, scene.activeCamera, crystalHeart, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, scene.getEngine(), false);
    godrays.exposure = 0.3;
    godrays.decay = 0.96;
    godrays.weight = 0.6;
    godrays.density = 0.95;

    // 4. Floating Crystal Shards
    const crystalShards: any[] = [];
    for (let i = 0; i < 30; i++) {
        const shard = BABYLON.MeshBuilder.CreateIcoSphere(`shard${i}`, {radius: 0.2 + Math.random() * 0.3, subdivisions: 1}, scene);
        shard.scaling.y = 2 + Math.random() * 3;
        shard.material = materialMap.purple;
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 12;
        shard.position = new BABYLON.Vector3(Math.sin(angle) * radius, 8 + (Math.random() - 0.5) * 8, Math.cos(angle) * radius);
        crystalShards.push({ mesh: shard, angle, radius, speed: 0.001 + Math.random() * 0.002, rotSpeed: 0.005 + Math.random() * 0.01 });
        mirror.renderList.push(shard);
    }
    
    // 5. Animation Loop
    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += scene.getEngine().getDeltaTime() * 0.001;
        heartLight.intensity = 2.0 + Math.sin(time) * 1.0;
        crystalHeart.scaling.x = 1 + Math.sin(time) * 0.05;
        crystalHeart.scaling.y = 1 + Math.sin(time) * 0.05;
        crystalHeart.scaling.z = 1 + Math.sin(time) * 0.05;

        crystalShards.forEach(s => {
            s.angle += s.speed;
            s.mesh.position.x = s.radius * Math.sin(s.angle);
            s.mesh.position.z = s.radius * Math.cos(s.angle);
            s.mesh.rotation.y += s.rotSpeed;
        });
    });
};

const createModelScene = (scene: any, modelData: ModelData, materialMap: any) => {
  modelData.shapes.forEach((shape, index) => {
    let mesh;
    const meshName = `ai_shape_${index}`;
    switch (shape.type) {
      case 'box':
        mesh = BABYLON.MeshBuilder.CreateBox(meshName, { width: shape.dimensions.width, height: shape.dimensions.height, depth: shape.dimensions.depth }, scene);
        break;
      // ... cases for other shapes
    }
    if (mesh) {
      mesh.position = new BABYLON.Vector3(shape.position.x, shape.position.y, shape.position.z);
      mesh.rotation = new BABYLON.Vector3(shape.rotation.x, shape.rotation.y, shape.rotation.z);
      mesh.material = materialMap[shape.material];
    }
  });
};


export const useBabylonScene = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    modelData: ModelData | null,
    userShapes: Shape[],
    onShapeSelect: (shapeId: string | null) => void,
    selectedShapeId: string | null,
    onShapeUpdate: (shapeId: string, newTransform: { position: Position, rotation: Position, scaling: Position }) => void
) => {
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const userMeshesRef = useRef<Map<string, any>>(new Map());
  const baseMeshesRef = useRef<any[]>([]);
  const materialMapRef = useRef<any>({});

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1.0);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 70, new BABYLON.Vector3(0, 8, 0), scene);
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 200;

    const pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, scene, [camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.2;
    pipeline.bloomWeight = 0.8;
    pipeline.chromaticAberrationEnabled = true;
    pipeline.chromaticAberration.aberrationAmount = 15;
    pipeline.fxaaEnabled = true;

    // PBR Materials for stunning visuals
    const purpleMat = new BABYLON.PBRMaterial("purple", scene);
    purpleMat.albedoColor = new BABYLON.Color3(0.5, 0.3, 0.8);
    purpleMat.metallic = 0.8;
    purpleMat.roughness = 0.4;
    purpleMat.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.4);
    materialMapRef.current.purple = purpleMat;

    const glassMat = new BABYLON.PBRMaterial("glass", scene);
    glassMat.alpha = 0.2;
    glassMat.metallic = 0.1;
    glassMat.roughness = 0.1;
    glassMat.indexOfRefraction = 1.8;
    glassMat.emissiveColor = new BABYLON.Color3(0.6, 0.8, 1);
    glassMat.subSurface.isRefractionEnabled = true;
    materialMapRef.current.glass = glassMat;

    const gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;
    gizmoManager.usePointerToAttachGizmos = false;

    scene.onPointerDown = (evt: any, pickResult: any) => {
        if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.metadata?.isUserMesh) {
            onShapeSelect(pickResult.pickedMesh.metadata.shapeId);
        } else if (!pickResult.hit || !pickResult.pickedMesh?.isGizmo) {
            onShapeSelect(null);
        }
    };

    engine.runRenderLoop(() => scene.render());
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gizmoManager.dispose();
      engine.dispose();
    };
  }, [canvasRef, onShapeSelect]);
  
  // Scene Content (AI or Default)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    baseMeshesRef.current.forEach(mesh => mesh.dispose());
    baseMeshesRef.current = [];
    scene.onBeforeRenderObservable.clear();

    const startingMeshCount = scene.meshes.length;
    if (modelData) {
      createModelScene(scene, modelData, materialMapRef.current);
    } else {
      createStunningDefaultScene(scene, materialMapRef.current);
    }
    baseMeshesRef.current = scene.meshes.slice(startingMeshCount);
  }, [modelData]);

  // Sync user shapes
  useEffect(() => { /* ... existing ... */ }, [userShapes]);
  
  // Sync selection & gizmos
  useEffect(() => { /* ... existing ... */ }, [selectedShapeId, onShapeUpdate]);
};
