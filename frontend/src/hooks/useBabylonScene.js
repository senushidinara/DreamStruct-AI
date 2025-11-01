import { useEffect } from 'react';

// Make Babylon.js available from the window object (from CDN)
const BABYLON = window.BABYLON;

const createDefaultScene = (scene, materialMap) => {
    // A magical floating island with a wizard's observatory
    const island = BABYLON.MeshBuilder.CreateSphere("island", {diameter: 15, segments: 24, slice: 0.5}, scene);
    island.material = materialMap.purple;
    island.position.y = -5;
    island.rotation.x = Math.PI / 2;

    const tower = BABYLON.MeshBuilder.CreateCylinder("tower", {height: 12, diameter: 4}, scene);
    tower.material = materialMap.purple;
    tower.position.y = 2;

    const roof = BABYLON.MeshBuilder.CreateSphere("roof", {diameter: 5, slice: 0.5}, scene);
    roof.material = materialMap.teal;
    roof.position.y = 8;

    const crystals = [];
    for(let i = 0; i < 5; i++) {
        const crystal = BABYLON.MeshBuilder.CreateIcoSphere(`crystal${i}`, {radius: 1, subdivisions: 2}, scene);
        crystal.material = materialMap.glass;
        crystal.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 12,
            -6 + Math.random() * 2,
            (Math.random() - 0.5) * 12
        );
        crystals.push(crystal);
    }
    
    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += 0.01;
        island.rotation.z += 0.001;
        roof.rotation.y += 0.005;
        crystals.forEach((crystal, i) => {
            crystal.position.y += Math.sin(time * 1.5 + i) * 0.01;
            const glow = (Math.sin(time * 2 + i * 0.5) + 1) / 2 * 0.6 + 0.4;
            crystal.material.emissiveColor = new BABYLON.Color3(0.5 * glow, 0.8 * glow, 1 * glow);
        });
    });
};

const createModelScene = (scene, modelData, materialMap) => {
    const generatedMeshes = [];

    modelData.shapes.forEach((shape, index) => {
        let mesh;
        switch (shape.type) {
            case 'box':
                mesh = BABYLON.MeshBuilder.CreateBox(`shape_${index}`, {
                    width: shape.dimensions.width,
                    height: shape.dimensions.height,
                    depth: shape.dimensions.depth
                }, scene);
                break;
            case 'sphere':
                 mesh = BABYLON.MeshBuilder.CreateSphere(`shape_${index}`, {
                    diameter: shape.dimensions.diameter || shape.dimensions.width
                }, scene);
                break;
            case 'cylinder':
                mesh = BABYLON.MeshBuilder.CreateCylinder(`shape_${index}`, {
                    height: shape.dimensions.height,
                    diameter: shape.dimensions.diameter || shape.dimensions.width
                }, scene);
                break;
            default:
                return;
        }

        if (mesh) {
            mesh.position = new BABYLON.Vector3(shape.position.x, shape.position.y, shape.position.z);
            mesh.rotation = new BABYLON.Vector3(shape.rotation.x, shape.rotation.y, shape.rotation.z);
            mesh.material = materialMap[shape.material] || materialMap.purple;
            generatedMeshes.push({ mesh, originalY: shape.position.y, shapeType: shape.type });
        }
    });
    
    // Add animations for the generated model
    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += 0.01;
        generatedMeshes.forEach(({ mesh, originalY, shapeType }, index) => {
            if (mesh.material === materialMap.glass) {
                // Pulsating glow effect
                const baseColor = materialMap.glass.emissiveColor;
                // **UPDATED:** More pronounced pulsation. Oscillates between 0.5 and 1.2 for a stronger effect.
                const glow = (Math.sin(time * 0.8 + index * 0.5) + 1) / 2 * 0.7 + 0.5; 
                mesh.material.emissiveColor = new BABYLON.Color3(baseColor.r * glow, baseColor.g * glow, baseColor.b * glow);
            }

            if (shapeType === 'sphere') {
                 // Gentle bobbing motion
                mesh.position.y = originalY + Math.sin(time * 0.8 + index) * 0.2;
            } else {
                // Slow rotation
                mesh.rotation.y += 0.001 * (index % 2 === 0 ? 1 : -1);
            }
        });
    });

    console.log("DreamStruct AI Model loaded!");
};

export const useBabylonScene = (canvasRef, modelData) => {
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1);
      
      const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 40, new BABYLON.Vector3(0, 5, 0), scene);
      camera.attachControl(canvasRef.current, true);
      camera.lowerRadiusLimit = 10;
      camera.upperRadiusLimit = 150;
      camera.wheelPrecision = 50;

      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.5;
      
      const light2 = new BABYLON.PointLight("pointlight", new BABYLON.Vector3(-15, 15, -15), scene);
      light2.intensity = 0.9;
      light2.diffuse = new BABYLON.Color3(0.8, 0.5, 1); // Purple tint

      // Materials
      const purpleMaterial = new BABYLON.StandardMaterial("purpleMat", scene);
      purpleMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.8);
      purpleMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      purpleMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.4);

      const tealMaterial = new BABYLON.StandardMaterial("tealMat", scene);
      tealMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.7);
      tealMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      tealMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.35);

      const glassMaterial = new BABYLON.StandardMaterial("glassMat", scene);
      glassMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.8, 1.0);
      glassMaterial.alpha = 0.2;
      glassMaterial.specularPower = 128;
      glassMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.6, 1);
      glassMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
      // **UPDATED:** Increased Fresnel power for a stronger, more visible shimmer effect on edges.
      glassMaterial.reflectionFresnelParameters.power = 4;
      glassMaterial.reflectionFresnelParameters.bias = 0.1;
      
      const materialMap = { purple: purpleMaterial, teal: tealMaterial, glass: glassMaterial };

      if (modelData && modelData.shapes) {
        createModelScene(scene, modelData, materialMap);
      } else {
        createDefaultScene(scene, materialMap);
      }
      return scene;
    };

    const scene = createScene();
    engine.runRenderLoop(() => scene.render());
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [canvasRef, modelData]);
};