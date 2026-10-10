import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSara } from '../../context/SaraContext';
import { EmotionState } from '../../types';
import { getAvatarMeta } from './avatarAssets';
import { Sparkles, Eye, Rotate3d, Heart } from 'lucide-react';

interface RealHuman3DAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' | 'compact';
  className?: string;
  avatarId?: string;
  showStatusBadge?: boolean;
  interactive?: boolean;
}

export const RealHuman3DAvatar: React.FC<RealHuman3DAvatarProps> = ({
  size = 'lg',
  className = '',
  avatarId,
  showStatusBadge = false,
  interactive = true,
}) => {
  const {
    assistantState,
    currentEmotion,
    isSpeaking,
    audioFrequencyData,
    activeAvatarId,
    userProfile,
  } = useSara();

  const selectedId = avatarId || activeAvatarId;
  const meta = getAvatarMeta(selectedId);

  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteracted, setIsInteracted] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const mouthMeshRef = useRef<THREE.Mesh | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const rimLightRef = useRef<THREE.PointLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Mouse / Pointer Parallax target
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Blinking cycle state
  const blinkState = useRef({ isBlinking: false, progress: 0 });

  // Size styling map
  const dimensionMap = {
    sm: 'w-24 h-28',
    md: 'w-44 h-52',
    compact: 'w-full h-44 max-w-[260px]',
    lg: 'w-72 h-84',
    xl: 'w-96 h-112',
    fullscreen: 'w-full h-full min-h-[380px]',
  };

  // Blinking loop
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      blinkState.current.isBlinking = true;
      blinkState.current.progress = 0;
      setTimeout(() => {
        blinkState.current.isBlinking = false;
        // 20% chance of double blink
        if (Math.random() < 0.2) {
          setTimeout(() => {
            blinkState.current.isBlinking = true;
            setTimeout(() => {
              blinkState.current.isBlinking = false;
              scheduleNext();
            }, 120);
          }, 100);
        } else {
          scheduleNext();
        }
      }, 150);
    };

    const scheduleNext = () => {
      const delay = 2200 + Math.random() * 3000;
      blinkTimeout = setTimeout(triggerBlink, delay);
    };

    scheduleNext();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Three.js Scene Setup & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 3.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig (High-end Studio & Companion Neon Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(1.5, 2, 2.5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.2);
    fillLight.position.set(-2, 1, 1.5);
    scene.add(fillLight);

    // Rim / Backlight for vibrant companion glow
    const rimLight = new THREE.PointLight(
      userProfile.loveMode ? 0xff2e93 : 0x00f2fe,
      3.5,
      10
    );
    rimLight.position.set(0, -0.2, -1.8);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 5. Head & Character Root Group
    const headGroup = new THREE.Group();
    scene.add(headGroup);
    headGroupRef.current = headGroup;

    // 6. Photorealistic Human Face Mesh
    const textureLoader = new THREE.TextureLoader();
    const faceTexture = textureLoader.load(meta.imageUrl, () => {
      renderer.render(scene, camera);
    });
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.minFilter = THREE.LinearMipmapLinearFilter;
    faceTexture.magFilter = THREE.LinearFilter;

    // Curved human head front geometry with anatomical depth
    const headGeometry = new THREE.SphereGeometry(1.22, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.72);
    // Flatten and sculpt front to realistic human facial contour
    const pos = headGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const x = pos.getX(i);
      // Slight oval elongation for natural human facial proportion
      pos.setY(i, y * 1.12);
      // Gentle cheekbone and chin contour
      if (z > 0.4) {
        pos.setZ(i, z * 1.08 - Math.abs(x) * 0.15);
      }
    }
    headGeometry.computeVertexNormals();

    const headMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.52,
      metalness: 0.04,
      bumpScale: 0.02,
      envMapIntensity: 0.8,
    });

    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.set(0, -0.05, 0);
    headGroup.add(headMesh);

    // 7. 3D Animated Eyelids (for realistic blinking)
    const eyelidGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16);
    eyelidGeo.rotateX(Math.PI / 2);
    const eyelidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(meta.skinTone),
      roughness: 0.6,
      transparent: true,
      opacity: 0.95,
    });

    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.position.set(-0.35, 0.28, 1.08);
    leftEyelid.scale.set(1.1, 0.05, 1);
    headGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;

    const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat.clone());
    rightEyelid.position.set(0.35, 0.28, 1.08);
    rightEyelid.scale.set(1.1, 0.05, 1);
    headGroup.add(rightEyelid);
    rightEyelidRef.current = rightEyelid;

    // 8. 3D Lip-Sync Dynamic Mouth Rig
    const mouthGeo = new THREE.RingGeometry(0.04, 0.22, 24);
    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0x671328,
      roughness: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0, // Blended with face texture, revealed when speaking
    });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, -0.32, 1.15);
    mouthMesh.scale.set(1.2, 0.2, 1);
    headGroup.add(mouthMesh);
    mouthMeshRef.current = mouthMesh;

    // 9. Floating 3D Sparkle / Hologram Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.6 + Math.random() * 1.2;
      particlePos[i] = Math.cos(angle) * radius;
      particlePos[i + 1] = (Math.random() - 0.5) * 3;
      particlePos[i + 2] = Math.sin(angle) * radius * 0.7;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: userProfile.loveMode ? 0xff4d8d : 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth Mouse Tracking with Damping
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.08;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.08;

      if (headGroupRef.current) {
        // Natural 3D Breathing (gentle sinusoidal vertical displacement and pitch)
        const breathY = Math.sin(elapsed * 1.6) * 0.035;
        const breathPitch = Math.sin(elapsed * 1.6) * 0.015;

        // Base Emotion Head Pose
        let emotionTiltZ = 0;
        let emotionPitchX = 0;
        let emotionYawY = 0;

        if (currentEmotion === 'romantic') {
          emotionTiltZ = -0.06; // Soft head tilt
          emotionPitchX = 0.02;
        } else if (currentEmotion === 'playful') {
          emotionTiltZ = 0.08 * Math.sin(elapsed * 2);
        } else if (currentEmotion === 'thinking') {
          emotionYawY = 0.12;
          emotionPitchX = -0.08; // Looking up
        } else if (assistantState === 'LISTENING') {
          emotionPitchX = 0.04; // Attentive forward nod
        }

        // Apply interactive parallax + natural life motion
        headGroupRef.current.position.y = breathY;
        headGroupRef.current.rotation.y = mouseCurrent.current.x * 0.55 + emotionYawY;
        headGroupRef.current.rotation.x = -mouseCurrent.current.y * 0.4 + breathPitch + emotionPitchX;
        headGroupRef.current.rotation.z = -mouseCurrent.current.x * 0.15 + emotionTiltZ;
      }

      // 3D Blinking Animation
      if (leftEyelidRef.current && rightEyelidRef.current) {
        const isBlinking = blinkState.current.isBlinking;
        const targetScaleY = isBlinking ? 1.0 : 0.02;
        const currentScaleY = leftEyelidRef.current.scale.y;
        const newScaleY = currentScaleY + (targetScaleY - currentScaleY) * 0.35;

        leftEyelidRef.current.scale.y = newScaleY;
        rightEyelidRef.current.scale.y = newScaleY;
        (leftEyelidRef.current.material as THREE.MeshStandardMaterial).opacity = isBlinking ? 0.95 : 0.0;
        (rightEyelidRef.current.material as THREE.MeshStandardMaterial).opacity = isBlinking ? 0.95 : 0.0;
      }

      // 3D Real-time Lip Synchronization with Speech Frequency
      if (mouthMeshRef.current) {
        const avgFreq =
          audioFrequencyData.reduce((acc, v) => acc + v, 0) / (audioFrequencyData.length || 1);
        const speechAmp = isSpeaking ? Math.min(1.2, (avgFreq / 60)) : 0.05;

        const targetMouthOpen = isSpeaking ? 0.15 + speechAmp * 0.6 : 0.05;
        const targetMouthWidth = isSpeaking ? 1.0 + speechAmp * 0.35 : 1.0;
        const targetOpacity = isSpeaking ? Math.min(0.85, speechAmp * 1.2) : 0.0;

        mouthMeshRef.current.scale.y += (targetMouthOpen - mouthMeshRef.current.scale.y) * 0.3;
        mouthMeshRef.current.scale.x += (targetMouthWidth - mouthMeshRef.current.scale.x) * 0.3;
        (mouthMeshRef.current.material as THREE.MeshStandardMaterial).opacity +=
          (targetOpacity - (mouthMeshRef.current.material as THREE.MeshStandardMaterial).opacity) * 0.25;
      }

      // Orbiting Sparkle Particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsed * 0.25;
      }

      // Dynamic companion rim lighting
      if (rimLightRef.current) {
        const pulse = 2.5 + Math.sin(elapsed * 3) * 1.0;
        rimLightRef.current.intensity = pulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [selectedId, meta.imageUrl, userProfile.loveMode]);

  // Pointer Movement Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseTarget.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-0.8, Math.min(0.8, y)) };
  };

  const handlePointerLeave = () => {
    mouseTarget.current = { x: 0, y: 0 };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleTouchTap = () => {
    setIsInteracted(true);
    setTimeout(() => setIsInteracted(false), 2000);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleTouchTap}
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${dimensionMap[size]} ${className}`}
    >
      {/* 3D Glowing Ambient Halo */}
      <div
        className={`absolute inset-4 rounded-full blur-3xl opacity-60 transition-all duration-700 pointer-events-none ${
          assistantState === 'SPEAKING'
            ? 'bg-pink-600/50 scale-110'
            : assistantState === 'LISTENING'
            ? 'bg-cyan-500/50 scale-105'
            : assistantState === 'THINKING'
            ? 'bg-purple-600/50 animate-pulse'
            : userProfile.loveMode
            ? 'bg-pink-500/40'
            : 'bg-indigo-600/30'
        }`}
      />

      {/* Love Burst Effect on Tap */}
      {isInteracted && (
        <div className="absolute top-2 pointer-events-none animate-ping text-pink-400 text-4xl z-30 flex items-center gap-1">
          <Heart className="w-8 h-8 fill-pink-500 text-pink-400 drop-shadow-[0_0_15px_#ff2e93]" />
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full relative z-10 flex items-center justify-center overflow-hidden rounded-3xl"
      />

      {/* 3D Real Human Companion Badge */}
      {showStatusBadge && (
        <div className="absolute bottom-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-pink-500/40 text-[10px] font-bold text-pink-300 shadow-[0_0_12px_rgba(255,46,147,0.4)]">
          <Rotate3d className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>3D REAL HUMAN • {meta.bengaliName}</span>
        </div>
      )}
    </div>
  );
};
