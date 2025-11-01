
import { useEffect } from 'react';
import type React from 'react';
import { ModelData, Shape } from '../types';

// Make Babylon.js available from the window object (from CDN)
declare const BABYLON: any;

const createDefaultScene = (scene: any, materialMap: {[key: string]: any}) => {
    // Magical Floating Treehouse Hotel
    const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {height: 20, diameter: 2, tessellation: 24}, scene);
    trunk.material = materialMap.purple;
    trunk.position.y = 0;

    const platforms: any[] = [];
    const numPlatforms = 4;
    for (let i = 0; i < numPlatforms; i++) {
        const platform = BABYLON.MeshBuilder.CreateCylinder(`platform${i}`, {height: 0.3, diameter: 6 + i * 1.5}, scene);
        platform.material = materialMap.teal;
        platform.position.y = 2 + i * 4;
        platform.rotation.y = Math.random() * Math.PI * 2;
        platforms.push(platform);
    }

    const lanterns: any[] = [];
    const numLanterns = 6;
    for (let i = 0; i < numLanterns; i++) {
        const lantern = BABYLON.MeshBuilder.CreateSphere(`lantern${i}`, {diameter: 0.8}, scene);
        const lanternMat = new BABYLON.StandardMaterial(`lanternMat${i}`, scene);
        lanternMat.emissiveColor = new BABYLON.Color3(0.8, 0.5, 1); // Glowing purple
        lantern.material = lanternMat;
        lantern.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 12,
            Math.random() * 15 + 2,
            (Math.random() - 0.5) * 12
        );
        lanterns.push(lantern);
    }
    
    console.log("DreamStruct AI Interactive Demo loaded!");

    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += 0.01;
        platforms.forEach((platform, i) => {
            platform.rotation.y += 0.003 * (i % 2 === 0 ? 1 : -1);
        });
        lanterns.forEach((lantern, i) => {
            lantern.position.y += Math.sin(time * 2 + i) * 0.01;
            // Pulsating glow
            const glow = (Math.sin(time * 1.5 + i * 0.5) + 1) / 2 * 0.7 + 0.3; // Varies between 0.3 and 1.0
            lantern.material.emissiveColor = new BABYLON.Color3(0.8 * glow, 0.5 * glow, 1 * glow);
        });
    });
};

const createModelScene = (scene: any, modelData: ModelData, materialMap: {[key: string]: any}) => {
    const generatedMeshes: {mesh: any, originalY: number, shapeType: Shape['type']}[] = [];

    modelData.shapes.forEach((shape: Shape, index: number) => {
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
            if (mesh.material.name === "glassMat") {
                // Create a shimmering, refractive effect
                mesh.material.reflectionFresnelParameters.power = 2.5 + Math.cos(time * 0.5 + index) * 1.5;
            }

            // Add subtle movements
            if (shapeType === 'sphere') {
                 // Gentle bobbing motion
                mesh.position.y = originalY + Math.sin(time + index) * 0.2;
            } else {
                // Slow rotation
                mesh.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1);
                mesh.rotation.x += 0.0005;
            }
        });
    });

    console.log("DreamStruct AI Modernized Blueprint loaded!");
};

export const useBabylonScene = (canvasRef: React.RefObject<HTMLCanvasElement>, modelData: ModelData | null, userShapes: Shape[]) => {
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const engine = new BABYLON.Engine(canvasRef.current, true);

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1);
      
      const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 30, new BABYLON.Vector3(0, 5, 0), scene);
      camera.attachControl(canvasRef.current, true);
      camera.lowerRadiusLimit = 5;
      camera.upperRadiusLimit = 100;

      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.8;
      
      const light2 = new BABYLON.PointLight("pointlight", new BABYLON.Vector3(-10, 10, -10), scene);
      light2.intensity = 0.6;
      light2.diffuse = new BABYLON.Color3(0.8, 0.5, 1); // Purple tint

      // --- Centralized Materials ---
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
      glassMaterial.indexOfRefraction = 1.5;
      glassMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
      glassMaterial.reflectionFresnelParameters.power = 2;
      glassMaterial.reflectionFresnelParameters.bias = 0.1;
      
      const materialMap = {
          purple: purpleMaterial,
          teal: tealMaterial,
          glass: glassMaterial
      };

      if (modelData) {
        createModelScene(scene, modelData, materialMap);
      } else {
        createDefaultScene(scene, materialMap);
      }

      // Add user-created shapes
      if (userShapes && userShapes.length > 0) {
        userShapes.forEach((shape: Shape, index: number) => {
            if (shape.type === 'box') {
                const floor = BABYLON.MeshBuilder.CreateBox(`user_floor_${index}`, {
                    width: shape.dimensions.width,
                    height: shape.dimensions.height,
                    depth: shape.dimensions.depth
                }, scene);
                floor.position = new BABYLON.Vector3(shape.position.x, shape.position.y, shape.position.z);
                floor.rotation = new BABYLON.Vector3(shape.rotation.x, shape.rotation.y, shape.rotation.z);
                floor.material = materialMap[shape.material] || tealMaterial;
            }
        });
      }

      return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [canvasRef, modelData, userShapes]);
};
