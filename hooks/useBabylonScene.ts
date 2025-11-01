
import { useEffect, useRef } from 'react';
import type React from 'react';
import { ModelData, Shape, MaterialType, Position } from '../types';

// Make Babylon.js available from the window object (from CDN)
declare const BABYLON: any;

const createStunningDefaultScene = (scene: any, materialMap: {[key in MaterialType]: any}) => {
    // A "Heart of the Nebula" Scene for maximum visual appeal
    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/space_nebula_1_256.env", scene);
    scene.environmentTexture = envTexture;
    scene.createDefaultSkybox(envTexture, true, 1000, 0.5);

    const crystalHeart = BABYLON.MeshBuilder.CreateIcoSphere("crystalHeart", {radius: 4, subdivisions: 3}, scene);
    crystalHeart.material = materialMap.glass;
    crystalHeart.position.y = 6;

    const heartLight = new BABYLON.PointLight("heartLight", new BABYLON.Vector3(0, 6, 0), scene);
    heartLight.diffuse = new BABYLON.Color3(0.8, 0.5, 1.0);
    heartLight.specular = new BABYLON.Color3(1, 1, 1);

    const crystalShards: {mesh: any, angle: number, radius: number, speed: number, rotSpeed: number}[] = [];
    for (let i = 0; i < 20; i++) {
        const shard = BABYLON.MeshBuilder.CreateBox(`shard${i}`, {width: 0.2 + Math.random(), height: 1 + Math.random() * 2, depth: 0.2 + Math.random()}, scene);
        shard.material = materialMap.emissive_blue;
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 8;
        const speed = 0.001 + Math.random() * 0.002;
        const rotSpeed = 0.005 + Math.random() * 0.01;
        shard.position = new BABYLON.Vector3(Math.sin(angle) * radius, 6 + (Math.random() - 0.5) * 4, Math.cos(angle) * radius);
        crystalShards.push({ mesh: shard, angle, radius, speed, rotSpeed });
    }

    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
    particleSystem.emitter = crystalHeart;
    particleSystem.createSphereEmitter(4.5);
    // ... (rest of particle system setup)
    particleSystem.start();

    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += scene.getEngine().getDeltaTime() * 0.001;
        heartLight.intensity = 1.0 + Math.sin(time * 1.5) * 0.5;
        crystalHeart.rotation.y += 0.002;
        crystalShards.forEach(shard => {
            shard.angle += shard.speed;
            shard.mesh.position.x = shard.radius * Math.sin(shard.angle);
            shard.mesh.position.z = shard.radius * Math.cos(shard.angle);
            shard.mesh.rotation.y += shard.rotSpeed;
        });
    });
};

const createModelScene = (scene: any, modelData: ModelData, materialMap: {[key in MaterialType]: any}) => {
    // ... (same as before)
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
  const highlightLayerRef = useRef<any>(null);
  const gizmoManagerRef = useRef<any>(null);

  // --- Initial Scene Setup ---
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1.0);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 50, new BABYLON.Vector3(0, 5, 0), scene);
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 50;

    const highlightLayer = new BABYLON.HighlightLayer("hl1", scene);
    highlightLayerRef.current = highlightLayer;
    
    const gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 1.5;

    // --- Gizmo Manager Setup ---
    const gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;
    gizmoManager.usePointerToAttachGizmos = false; // We'll control attachment manually
    gizmoManagerRef.current = gizmoManager;

    scene.onPointerDown = (evt: any, pickResult: any) => {
        if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.metadata?.isUserMesh) {
            onShapeSelect(pickResult.pickedMesh.metadata.shapeId);
        } else {
            // Deselect if not clicking a user mesh or a gizmo
            if (!pickResult.hit || !pickResult.pickedMesh?.isGizmo) {
               onShapeSelect(null);
            }
        }
    };

    engine.runRenderLoop(() => scene.render());
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gizmoManager.dispose();
      engine.dispose();
      engineRef.current = null;
    };
  }, [canvasRef, onShapeSelect]);

  // --- Base Scene Content (AI Model or Default) ---
  useEffect(() => {
    // ... (same as before)
  }, [modelData]);

  // --- Sync User-Added Shapes (from React state to Babylon) ---
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const materialMap = scene.materials.reduce((acc, mat) => {
        acc[mat.name] = mat;
        return acc;
    }, {} as {[key: string]: any});

    const currentMeshIds = new Set(Array.from(userMeshesRef.current.keys()));
    const shapesToRender = new Map(userShapes.map(shape => [shape.id, shape]));

    currentMeshIds.forEach(id => {
        if (!shapesToRender.has(id)) {
            userMeshesRef.current.get(id)?.dispose();
            userMeshesRef.current.delete(id);
        }
    });

    shapesToRender.forEach((shape, id) => {
        let mesh = userMeshesRef.current.get(id);
        if (!mesh) {
            if (shape.type === 'box' && id) {
                mesh = BABYLON.MeshBuilder.CreateBox(id, {
                    width: shape.dimensions.width,
                    height: shape.dimensions.height,
                    depth: shape.dimensions.depth
                }, scene);
                mesh.metadata = { isUserMesh: true, shapeId: id };
                userMeshesRef.current.set(id, mesh);
            }
        }

        if (mesh) {
            mesh.position.x = shape.position.x;
            mesh.position.y = shape.position.y;
            mesh.position.z = shape.position.z;
            
            // Use Quaternion for rotation to avoid gimbal lock
            mesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(shape.rotation.x, shape.rotation.y, shape.rotation.z);

            mesh.scaling.x = shape.scaling.x;
            mesh.scaling.y = shape.scaling.y;
            mesh.scaling.z = shape.scaling.z;

            const matName = `${shape.material}Mat`;
            mesh.material = materialMap[matName] || materialMap['tealMat'];
        }
    });
  }, [userShapes]);

  // --- Sync Selection and Gizmos ---
  useEffect(() => {
    const highlightLayer = highlightLayerRef.current;
    const gizmoManager = gizmoManagerRef.current;
    if (!highlightLayer || !gizmoManager) return;

    highlightLayer.removeAllMeshes();
    gizmoManager.attachToMesh(null);

    if (selectedShapeId) {
        const selectedMesh = userMeshesRef.current.get(selectedShapeId);
        if (selectedMesh) {
            highlightLayer.addMesh(selectedMesh, BABYLON.Color3.White());
            gizmoManager.attachToMesh(selectedMesh);

            // --- Sync Gizmo Changes back to React State ---
            const observables = [
                gizmoManager.gizmos.positionGizmo?.onDragEndObservable,
                gizmoManager.gizmos.rotationGizmo?.onDragEndObservable,
                gizmoManager.gizmos.scaleGizmo?.onDragEndObservable,
            ];

            const observerCallback = () => {
                if(selectedMesh){
                    const newRotation = selectedMesh.rotationQuaternion.toEulerAngles();
                    onShapeUpdate(selectedShapeId, {
                        position: { x: selectedMesh.position.x, y: selectedMesh.position.y, z: selectedMesh.position.z },
                        rotation: { x: newRotation.x, y: newRotation.y, z: newRotation.z },
                        scaling: { x: selectedMesh.scaling.x, y: selectedMesh.scaling.y, z: selectedMesh.scaling.z },
                    });
                }
            };

            const observers = observables.map(obs => obs?.add(observerCallback));
            
            // Cleanup function for this effect
            return () => {
                observers.forEach((obs, index) => {
                    if (obs) {
                        observables[index]?.remove(obs);
                    }
                });
            };
        }
    }
  }, [selectedShapeId, onShapeUpdate]);
};