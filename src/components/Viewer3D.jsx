import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createRealisticMaterial } from '../utils/materials';
import { 
  RotateCcw, 
  Camera, 
  Maximize2, 
  Compass, 
  MousePointer,
  Hand
} from 'lucide-react';

export default function Viewer3D({ 
  currentDetail, 
  materialPreset = 'steel_hot_rolled',
  showEdges = true,
  showGrid = true,
  autoRotate = false
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const currentModelGroupRef = useRef(null);
  const edgesGroupRef = useRef(null);
  const gridHelperRef = useRef(null);
  const shadowPlaneRef = useRef(null);
  const reqAnimRef = useRef(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTurntable, setIsTurntable] = useState(autoRotate);
  const [controlMode, setControlMode] = useState('orbit');

  // Initialize Three.js White Studio with High-Radiance IBL Environment
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene: Clean Architectural White Studio
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 500);
    camera.position.set(3.8, 2.6, 3.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 80;
    controls.minDistance = 0.15;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    // 5. Studio Environment Map (PMREMGenerator) - Soft specular reflections on flanges
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xf1f5f9);

    // Studio softbox lights in environment for authentic specular highlights
    const envTop = new THREE.DirectionalLight(0xffffff, 1.2);
    envTop.position.set(0, 15, 0);
    envScene.add(envTop);

    const envFront = new THREE.DirectionalLight(0xffffff, 1.0);
    envFront.position.set(0, 4, 12);
    envScene.add(envFront);

    const envBack = new THREE.DirectionalLight(0xe2e8f0, 0.8);
    envBack.position.set(0, 4, -12);
    envScene.add(envBack);

    const envLeft = new THREE.DirectionalLight(0xffffff, 0.9);
    envLeft.position.set(-12, 4, 0);
    envScene.add(envLeft);

    const envRight = new THREE.DirectionalLight(0xffffff, 0.9);
    envRight.position.set(12, 4, 0);
    envScene.add(envRight);

    const envMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();

    // 6. Direct Scene Lighting (Calibrated for dark structural steel)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    // Main Sunlight
    const sunLight = new THREE.DirectionalLight(0xfffdfa, 1.15);
    sunLight.position.set(8, 14, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.bias = -0.0001;
    const d = 4.5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xf8fafc, 0.65);
    fillLight.position.set(-8, 7, -6);
    scene.add(fillLight);

    // Upward ground bounce light to illuminate under flanges
    const bounceLight = new THREE.DirectionalLight(0xffffff, 0.35);
    bounceLight.position.set(0, -6, 4);
    scene.add(bounceLight);

    // 7. Subtle Floor Grid
    const grid = new THREE.GridHelper(16, 32, 0xd1d5db, 0xe5e7eb);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    // 8. Soft Floor Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(35, 35);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;

    // 9. Model & Edge Groups
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    currentModelGroupRef.current = modelGroup;

    const edgesGroup = new THREE.Group();
    scene.add(edgesGroup);
    edgesGroupRef.current = edgesGroup;

    // 10. Animation Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      reqAnimRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isTurntable;
        controlsRef.current.autoRotateSpeed = 1.6;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 11. Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      cancelAnimationFrame(reqAnimRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Turntable
  useEffect(() => {
    setIsTurntable(autoRotate);
  }, [autoRotate]);

  // Update Grid
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Update Controls Mode (Orbit vs Pan)
  useEffect(() => {
    if (!controlsRef.current) return;
    if (controlMode === 'pan') {
      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
      };
    } else {
      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
    }
  }, [controlMode]);

  // Apply Materials & Clean CAD Outlines
  const applyMaterialsAndEdges = useCallback((group, preset, withEdges, detailId) => {
    if (!group) return;

    if (edgesGroupRef.current) {
      while (edgesGroupRef.current.children.length > 0) {
        const obj = edgesGroupRef.current.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        edgesGroupRef.current.remove(obj);
      }
    }

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      linewidth: 1,
      transparent: true,
      opacity: 0.55
    });

    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        // Preserve original material if textured model, otherwise apply realistic materials
        if (currentDetail?.isTexturedModel && child.userData.originalMaterial && preset !== 'wireframe') {
          child.material = child.userData.originalMaterial;
        } else {
          child.material = createRealisticMaterial(preset, child.name, detailId);
        }

        // Technical Outline Edges
        if (withEdges && preset !== 'wireframe') {
          const edgesGeo = new THREE.EdgesGeometry(child.geometry, 30);
          const line = new THREE.LineSegments(edgesGeo, edgeLineMat);
          line.position.copy(child.position);
          line.rotation.copy(child.rotation);
          line.scale.copy(child.scale);
          line.userData.targetMesh = child;
          if (edgesGroupRef.current) {
            edgesGroupRef.current.add(line);
          }
        }
      }
    });
  }, []);

  // Update materials when preset or edge toggle changes
  useEffect(() => {
    if (currentModelGroupRef.current) {
      applyMaterialsAndEdges(currentModelGroupRef.current, materialPreset, showEdges, currentDetail?.id);
    }
  }, [materialPreset, showEdges, applyMaterialsAndEdges, currentDetail?.id]);

  // Load Model
  useEffect(() => {
    if (!currentDetail || !sceneRef.current) return;

    setIsLoading(true);
    setLoadingProgress(15);

    const baseUrl = import.meta.env.BASE_URL || '/';
    const modelUrl = `${baseUrl}${currentDetail.modelFile.replace(/^\//, '')}`;

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const modelGroup = currentModelGroupRef.current;
        while (modelGroup.children.length > 0) {
          const obj = modelGroup.children[0];
          obj.traverse((child) => {
            if (child.isMesh && child.geometry) {
              child.geometry.dispose();
            }
          });
          modelGroup.remove(obj);
        }

        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.userData.originalMaterial = child.material;
          }
        });
        modelGroup.add(model);

        // Apply realistic materials
        applyMaterialsAndEdges(modelGroup, materialPreset, showEdges, currentDetail.id);

        // Fit camera
        fitCameraToObject(model);

        setIsLoading(false);
        setLoadingProgress(100);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.error('Error loading model:', err);
        setIsLoading(false);
      }
    );
  }, [currentDetail, applyMaterialsAndEdges]);

  const fitCameraToObject = (object) => {
    if (!controlsRef.current || !cameraRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.75;

    camera.position.set(center.x + cameraZ * 0.85, center.y + cameraZ * 0.65, center.z + cameraZ * 0.85);
    camera.near = maxDim / 100;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.maxDistance = maxDim * 8;
    controls.minDistance = maxDim * 0.1;
    controls.update();
  };

  const setCameraView = (viewType) => {
    if (!controlsRef.current || !cameraRef.current || !currentModelGroupRef.current) return;
    const box = new THREE.Box3().setFromObject(currentModelGroupRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 1.2);
    const dist = maxDim * 2.2;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (viewType) {
      case 'iso':
        camera.position.set(center.x + dist * 0.7, center.y + dist * 0.6, center.z + dist * 0.7);
        break;
      case 'top':
        camera.position.set(center.x, center.y + dist * 1.5, center.z + 0.0001);
        break;
      case 'front':
        camera.position.set(center.x, center.y + dist * 0.2, center.z + dist * 1.4);
        break;
      case 'side':
        camera.position.set(center.x + dist * 1.4, center.y + dist * 0.2, center.z);
        break;
    }
    controls.target.copy(center);
    controls.update();
  };

  const takeScreenshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ETSIE_${currentDetail?.id || 'detalle'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#f8fafc] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" />

      {/* Loading Bar */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-30">
          <div className="w-48 bg-slate-200 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-200"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="mt-2 text-[11px] font-mono text-slate-500">
            Cargando modelo ({loadingProgress}%)
          </span>
        </div>
      )}

      {/* Top Center: Minimalist Camera View Pills */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-slate-200/80 z-20">
        <button
          onClick={() => setCameraView('iso')}
          className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          Isométrica
        </button>
        <button
          onClick={() => setCameraView('front')}
          className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          Alzado
        </button>
        <button
          onClick={() => setCameraView('top')}
          className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          Planta
        </button>
        <button
          onClick={() => setCameraView('side')}
          className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          Perfil
        </button>
        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
        <button
          onClick={() => {
            if (currentModelGroupRef.current) fitCameraToObject(currentModelGroupRef.current);
          }}
          className="p-1 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          title="Centrar"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Bottom Pill Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200 z-20">
        <button
          onClick={() => setControlMode('orbit')}
          className={`p-2 rounded-full transition-colors ${
            controlMode === 'orbit' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Modo Órbita"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setControlMode('pan')}
          className={`p-2 rounded-full transition-colors ${
            controlMode === 'pan' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Modo Paneo (Mano)"
        >
          <Hand className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsTurntable(!isTurntable)}
          className={`p-2 rounded-full transition-colors ${
            isTurntable ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Rotación Continua 360°"
        >
          <Compass className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <button
          onClick={takeScreenshot}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          title="Captura de Pantalla HD"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          title="Pantalla Completa"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
