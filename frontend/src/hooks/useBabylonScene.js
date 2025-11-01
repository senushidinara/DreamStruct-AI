import { useEffect, useRef } from 'react';

const BABYLON = window.BABYLON;

const createStunningDefaultScene = (scene, materialMap) => {
    // "Heart of the Nebula" Scene - Definitive Stunning Overhaul
    
    // 1. Environment and IBL for realistic reflections and lighting
    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/space_nebula_1_256.env", scene);
    scene.environmentTexture = envTexture;
    scene.createDefaultSkybox(envTexture, true, 1000, 0.5);

    // 2. The "Crystal Heart" Centerpiece with a powerful light
    const crystalHeart = BABYLON.MeshBuilder.CreateIcoSphere("crystalHeart", {radius: 4, subdivisions: 4}, scene);
    crystalHeart.material = materialMap.glass;
    crystalHeart.position.y = 8;
    const heartLight = new BABYLON.PointLight("heartLight", new BABYLON.Vector3(0, 8, 0), scene);
    heartLight.diffuse = new BABYLON.Color3(1.0, 0.7, 1.0);
    heartLight.specular = new BABYLON.Color3(1, 1, 1);
    heartLight.range = 100;
    
    // 3. Floating Crystal Shards
    const crystalShards = [];
    for (let i = 0; i < 40; i++) {
        const shard = BABYLON.MeshBuilder.CreateIcoSphere(`shard${i}`, {radius: 0.5 + Math.random() * 0.5, subdivisions: 1}, scene);
        shard.scaling.y = 2 + Math.random() * 2;
        shard.material = materialMap.purple;
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 20;
        const speed = 0.001 + Math.random() * 0.002;
        const rotSpeed = 0.005 + Math.random() * 0.01;
        shard.position = new BABYLON.Vector3(Math.sin(angle) * radius, 8 + (Math.random() - 0.5) * 10, Math.cos(angle) * radius);
        crystalShards.push({ mesh: shard, angle, radius, speed, rotSpeed });
    }
    
    // 4. Animation Loop
    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += scene.getEngine().getDeltaTime() * 0.001;
        heartLight.intensity = 2.0 + Math.sin(time * 1.5) * 1.0;
        crystalHeart.rotation.y += 0.002;
        
        crystalShards.forEach(shard => {
            shard.angle += shard.speed;
            shard.mesh.position.x = shard.radius * Math.sin(shard.angle);
            shard.mesh.position.z = shard.radius * Math.cos(shard.angle);
            shard.mesh.rotation.y += shard.rotSpeed;
            shard.mesh.rotation.x += shard.rotSpeed * 0.5;
        });
    });
};

const createModelScene = (scene, modelData, materialMap) => {
    // ... (existing function)
};

export const useBabylonScene = (canvasRef, modelData, userShapes, selectedShapeId, onShapeSelect) => {
    const engineRef = useRef(null);
    const sceneRef = useRef(null);
    const baseMeshesRef = useRef([]);
    const userMeshesRef = useRef(new Map());
    const highlightLayerRef = useRef(null);
    const materialMapRef = useRef({});

    // --- Initial Scene Setup ---
    useEffect(() => {
        if (!canvasRef.current || engineRef.current) return;

        const engine = new BABYLON.Engine(canvasRef.current, true);
        engineRef.current = engine;
        const scene = new BABYLON.Scene(engine);
        sceneRef.current = scene;
        scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1.0);
        
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2.5, Math.PI / 2.5, 80, new BABYLON.Vector3(0, 5, 0), scene);
        camera.attachControl(canvasRef.current, true);
        camera.lowerRadiusLimit = 15;
        camera.upperRadiusLimit = 200;
        camera.wheelPrecision = 20;

        // --- STUNNING UPGRADE: Default Rendering Pipeline ---
        const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.2;
        pipeline.bloomWeight = 0.8;
        pipeline.bloomKernel = 64;
        pipeline.bloomScale = 0.5;
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 20;
        pipeline.fxaaEnabled = true;


        const highlightLayer = new BABYLON.HighlightLayer("hl1", scene);
        highlightLayerRef.current = highlightLayer;

        // --- PBR Material Definitions for stunning visuals ---
        const purpleMaterial = new BABYLON.PBRMaterial("purple", scene);
        purpleMaterial.albedoColor = new BABYLON.Color3(0.5, 0.3, 0.8);
        purpleMaterial.metallic = 0.8;
        purpleMaterial.roughness = 0.4;
        purpleMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.4);

        const tealMaterial = new BABYLON.PBRMaterial("teal", scene);
        tealMaterial.albedoColor = new BABYLON.Color3(0.2, 0.8, 0.7);
        tealMaterial.metallic = 0.5;
        tealMaterial.roughness = 0.5;

        const glassMaterial = new BABYLON.PBRMaterial("glass", scene);
        glassMaterial.alpha = 0.2;
        glassMaterial.metallic = 0.1;
        glassMaterial.roughness = 0.1;
        glassMaterial.indexOfRefraction = 1.8;
        glassMaterial.emissiveColor = new BABYLON.Color3(0.6, 0.8, 1);
        glassMaterial.subSurface.isRefractionEnabled = true;

        const goldMaterial = new BABYLON.PBRMaterial("gold", scene);
        goldMaterial.albedoColor = new BABYLON.Color3(1.0, 0.84, 0.0);
        goldMaterial.metallic = 1.0;
        goldMaterial.roughness = 0.3;

        const metallicMaterial = new BABYLON.PBRMaterial("metallic", scene);
        metallicMaterial.albedoColor = new BABYLON.Color3(0.75, 0.75, 0.8);
        metallicMaterial.metallic = 1.0;
        metallicMaterial.roughness = 0.2;
        
        materialMapRef.current = { purple: purpleMaterial, teal: tealMaterial, glass: glassMaterial, gold: goldMaterial, metallic: metallicMaterial };

        scene.onPointerDown = (evt, pickResult) => {
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
    
    // --- Scene Content (AI Model or Default) ---
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // Clear previous base meshes and animations
        baseMeshesRef.current.forEach(mesh => mesh.dispose());
        baseMeshesRef.current = [];
        scene.onBeforeRenderObservable.clear();
        
        const startingMeshCount = scene.meshes.length;
        if (modelData && modelData.shapes) {
            createModelScene(scene, modelData, materialMapRef.current);
        } else {
            createStunningDefaultScene(scene, materialMapRef.current);
        }
        baseMeshesRef.current = scene.meshes.slice(startingMeshCount);

    }, [modelData]);

    // --- Sync User-Added Shapes ---
    useEffect(() => {
        // ... (existing user shape sync logic)
    }, [userShapes]);
    
    // --- Sync Selection Highlight ---
    useEffect(() => {
        // ... (existing selection sync logic)
    }, [selectedShapeId, userShapes]);
};