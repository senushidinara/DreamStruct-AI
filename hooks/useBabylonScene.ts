
import { useEffect, useRef } from 'react';
import type React from 'react';
import { ModelData, Shape, MaterialType } from '../types';

// Make Babylon.js available from the window object (from CDN)
declare const BABYLON: any;

const createDefaultScene = (scene: any, materialMap: {[key in MaterialType]: any}) => {
    // A more appealing "Floating Celestial Shrine"
    const mainPlatform = BABYLON.MeshBuilder.CreateCylinder("mainPlatform", {height: 1, diameter: 15, tessellation: 36}, scene);
    mainPlatform.material = materialMap.teal;
    mainPlatform.position.y = 0;

    const centralStructure = BABYLON.MeshBuilder.CreateBox("centralStructure", {size: 4}, scene);
    centralStructure.material = materialMap.purple;
    centralStructure.position.y = 2.5;

    // A large, magical, rotating torus
    const torus = BABYLON.MeshBuilder.CreateTorus("torus", {diameter: 25, thickness: 0.8, tessellation: 64}, scene);
    torus.material = materialMap.glass;
    torus.position.y = 3;
    torus.rotation.x = Math.PI / 2;

    const orbitingIslands: any[] = [];
    for (let i = 0; i < 4; i++) {
        const island = BABYLON.MeshBuilder.CreateSphere(`orbitIsland${i}`, {diameter: 2 + Math.random() * 2}, scene);
        island.material = materialMap.purple;
        orbitingIslands.push({mesh: island, angle: (Math.PI / 2) * i, radius: 18 + (Math.random() - 0.5) * 4});
    }

    // "WOW" Factor: Magical Stardust Particle System
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
    particleSystem.emitter = new BABYLON.Vector3(0, 10, 0); // Emitter centered above
    particleSystem.minEmitBox = new BABYLON.Vector3(-15, -10, -15);
    particleSystem.maxEmitBox = new BABYLON.Vector3(15, 10, 15);
    particleSystem.color1 = new BABYLON.Color4(0.8, 0.7, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.5, 0.8, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.4;
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 5;
    particleSystem.emitRate = 300;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -0.2, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 0.5, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 0.5, 0.5);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.start();

    console.log("DreamStruct AI Interactive Demo loaded!");
    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += 0.005;
        centralStructure.rotation.y += 0.002;
        torus.rotation.z += 0.001;
        orbitingIslands.forEach((island) => {
            island.mesh.position.x = island.radius * Math.sin(time + island.angle);
            island.mesh.position.z = island.radius * Math.cos(time + island.angle);
            island.mesh.rotation.y += 0.003;
        });
    });
};


const createModelScene = (scene: any, modelData: ModelData, materialMap: {[key in MaterialType]: any}) => {
    const generatedMeshes: {mesh: any, originalY: number, shapeType: Shape['type']}[] = [];
    modelData.shapes.forEach((shape: Shape, index: number) => {
        let mesh;
        switch (shape.type) {
            case 'box': mesh = BABYLON.MeshBuilder.CreateBox(`shape_${index}`, {width: shape.dimensions.width, height: shape.dimensions.height, depth: shape.dimensions.depth}, scene); break;
            case 'sphere': mesh = BABYLON.MeshBuilder.CreateSphere(`shape_${index}`, {diameter: shape.dimensions.diameter || shape.dimensions.width}, scene); break;
            case 'cylinder': mesh = BABYLON.MeshBuilder.CreateCylinder(`shape_${index}`, {height: shape.dimensions.height, diameter: shape.dimensions.diameter || shape.dimensions.width}, scene); break;
        }
        if (mesh) {
            mesh.position = new BABYLON.Vector3(shape.position.x, shape.position.y, shape.position.z);
            mesh.rotation = new BABYLON.Vector3(shape.rotation.x, shape.rotation.y, shape.rotation.z);
            mesh.material = materialMap[shape.material] || materialMap.purple;
            generatedMeshes.push({ mesh, originalY: shape.position.y, shapeType: shape.type });
        }
    });
    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += 0.01;
        generatedMeshes.forEach(({ mesh, originalY, shapeType }, index) => {
            if (mesh.material.name === "glassMat") {
                const glow = (Math.sin(time * 0.8 + index * 0.5) + 1) / 2 * 0.4 + 0.6;
                const baseColor = materialMap.glass.emissiveColor;
                mesh.material.emissiveColor = new BABYLON.Color3(baseColor.r * glow, baseColor.g * glow, baseColor.b * glow);
            } else if (mesh.material.name === "emissiveBlueMat") {
                 const glow = (Math.sin(time * 2.5 + index) + 1) / 2 * 0.5 + 0.5;
                 const baseColor = materialMap.emissive_blue.emissiveColor;
                 mesh.material.emissiveColor = new BABYLON.Color3(baseColor.r * glow, baseColor.g * glow, baseColor.b * glow);
            }
            if (shapeType === 'sphere') { mesh.position.y = originalY + Math.sin(time + index) * 0.2; } 
            else { mesh.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1); mesh.rotation.x += 0.0005; }
        });
    });
    console.log("DreamStruct AI Modernized Blueprint loaded!");
};

export const useBabylonScene = (
    canvasRef: React.RefObject<HTMLCanvasElement>, 
    modelData: ModelData | null, 
    userShapes: Shape[],
    onShapeSelect: (shapeId: string | null) => void,
    selectedShapeId: string | null
) => {
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const userMeshesRef = useRef<Map<string, any>>(new Map());
  const highlightLayerRef = useRef<any>(null);
  const baseMeshesRef = useRef<any[]>([]);

  // --- Initial Scene Setup ---
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1);
    
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 50, new BABYLON.Vector3(0, 5, 0), scene);
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 50;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    
    const light2 = new BABYLON.PointLight("pointlight", new BABYLON.Vector3(-10, 10, -10), scene);
    light2.intensity = 0.6;
    light2.diffuse = new BABYLON.Color3(0.8, 0.5, 1);

    const highlightLayer = new BABYLON.HighlightLayer("hl1", scene);
    highlightLayerRef.current = highlightLayer;

    scene.onPointerDown = (evt: any, pickResult: any) => {
        if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.metadata?.isUserMesh) {
            onShapeSelect(pickResult.pickedMesh.metadata.shapeId);
        } else {
            onShapeSelect(null);
        }
    };

    engine.runRenderLoop(() => scene.render());
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, [canvasRef, onShapeSelect]);

  // --- Base Scene Content (AI Model or Default) ---
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous base meshes and animations
    baseMeshesRef.current.forEach(mesh => mesh.dispose());
    baseMeshesRef.current = [];
    scene.onBeforeRenderObservable.clear();

    // Recreate materials as they belong to the scene
    const purpleMaterial = new BABYLON.StandardMaterial("purpleMat", scene);
    purpleMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.8);
    purpleMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    purpleMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.4);
    const tealMaterial = new BABYLON.StandardMaterial("tealMat", scene);
    tealMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.7);
    tealMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    tealMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.35);
    const glassMaterial = new BABYLON.StandardMaterial("glassMat", scene);
    glassMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1.0);
    glassMaterial.alpha = 0.3;
    glassMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    glassMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.6, 1);
    const goldMaterial = new BABYLON.StandardMaterial("goldMat", scene);
    goldMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.84, 0.0);
    goldMaterial.specularColor = new BABYLON.Color3(0.8, 0.7, 0.2);
    goldMaterial.specularPower = 128;
    goldMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.0);
    const emissiveBlueMaterial = new BABYLON.StandardMaterial("emissiveBlueMat", scene);
    emissiveBlueMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.5);
    emissiveBlueMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    emissiveBlueMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.7, 1.0);
    const metallicMaterial = new BABYLON.StandardMaterial("metallicMat", scene);
    metallicMaterial.diffuseColor = new BABYLON.Color3(0.75, 0.75, 0.8);
    metallicMaterial.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    metallicMaterial.specularPower = 128;
    metallicMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.15);
    const woodMaterial = new BABYLON.StandardMaterial("woodMat", scene);
    if (BABYLON.WoodProceduralTexture) {
        const woodTexture = new BABYLON.WoodProceduralTexture("woodTex", 1024, scene);
        woodTexture.ampScale = 80.0;
        woodMaterial.diffuseTexture = woodTexture;
    } else {
        woodMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
    }
    woodMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.08, 0.05);
    const materialMap: {[key in MaterialType]: any} = {
        purple: purpleMaterial, teal: tealMaterial, glass: glassMaterial,
        gold: goldMaterial, emissive_blue: emissiveBlueMaterial, wood: woodMaterial,
        metallic: metallicMaterial
    };
    
    const startingMeshCount = scene.meshes.length;
    if (modelData) {
      createModelScene(scene, modelData, materialMap);
    } else {
      createDefaultScene(scene, materialMap);
    }
    // Store references to the newly created base meshes
    baseMeshesRef.current = scene.meshes.slice(startingMeshCount);

  }, [modelData]);

  // --- Sync User-Added Shapes ---
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    // Get a map of materials from the scene
    const materialMap = scene.materials.reduce((acc, mat) => {
        acc[mat.name] = mat;
        return acc;
    }, {} as {[key: string]: any});

    const currentMeshIds = new Set(Array.from(userMeshesRef.current.keys()));
    const shapesToRender = new Map(userShapes.map(shape => [shape.id, shape]));

    // Remove meshes that are no longer in the userShapes array
    currentMeshIds.forEach(id => {
        if (!shapesToRender.has(id)) {
            userMeshesRef.current.get(id)?.dispose();
            userMeshesRef.current.delete(id);
        }
    });

    // Add or update meshes
    shapesToRender.forEach((shape, id) => {
        let mesh = userMeshesRef.current.get(id);
        if (!mesh) { // If mesh doesn't exist, create it
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
        
        if (mesh) { // Update properties
            mesh.position.x = shape.position.x;
            mesh.position.y = shape.position.y;
            mesh.position.z = shape.position.z;
            
            const matName = `${shape.material}Mat`;
            mesh.material = materialMap[matName] || materialMap['tealMat'];
        }
    });
  }, [userShapes]);

  // --- Sync Selection Highlight ---
  useEffect(() => {
    const highlightLayer = highlightLayerRef.current;
    if (!highlightLayer) return;

    highlightLayer.removeAllMeshes();
    if (selectedShapeId) {
        const selectedMesh = userMeshesRef.current.get(selectedShapeId);
        if (selectedMesh) {
            highlightLayer.addMesh(selectedMesh, BABYLON.Color3.White());
        }
    }
  }, [selectedShapeId]);
};
