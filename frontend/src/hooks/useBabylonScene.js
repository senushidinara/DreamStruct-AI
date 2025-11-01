import { useEffect } from 'react';

// Make Babylon.js available from the window object (from CDN)
const BABYLON = window.BABYLON;

const createDefaultScene = (scene, materialMap) => {
    const mainPlatform = BABYLON.MeshBuilder.CreateBox("main", {width: 6, height: 0.5, depth: 6}, scene);
    mainPlatform.material = materialMap.purple;
    mainPlatform.position.y = -2;

    const floatingSphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: 2}, scene);
    floatingSphere.material = materialMap.teal;
    floatingSphere.position = new BABYLON.Vector3(0, 3, 0);

    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        time += 0.01;
        floatingSphere.position.y = 3 + Math.sin(time) * 0.5;
        floatingSphere.rotation.y += 0.01;
        mainPlatform.rotation.y += 0.001;
    });
};

const createModelScene = (scene, modelData, materialMap) => {
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
        }
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

      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.8;
      
      const light2 = new BABYLON.PointLight("pointlight", new BABYLON.Vector3(-15, 15, -15), scene);
      light2.intensity = 0.7;
      light2.diffuse = new BABYLON.Color3(0.8, 0.5, 1); // Purple tint

      // Materials
      const purpleMaterial = new BABYLON.StandardMaterial("purpleMat", scene);
      purpleMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.8);
      purpleMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.4);

      const tealMaterial = new BABYLON.StandardMaterial("tealMat", scene);
      tealMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.7);
      tealMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.35);

      const glassMaterial = new BABYLON.StandardMaterial("glassMat", scene);
      glassMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1.0);
      glassMaterial.alpha = 0.3;
      
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
