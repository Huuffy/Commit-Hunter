// ButterflyBackground — fixed overlay with a 3D butterfly that flies
// along a spline path driven by page scroll, using R3F + Bloom glow.

import React, { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Cache the glTF model before mount to avoid pop-in
useGLTF.preload("/butterfly/butterfly.glb");

// Returns a ref (not state) tracking scroll progress 0–1,
// so the rAF render loop can read it without causing re-renders.
const useScrollProgressRef = () => {
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight -  window.innerHeight;
      const currentScroll = window.scrollY;
      scrollProgress.current = totalScroll > 0 ? currentScroll / totalScroll : 0;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // set initial value
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollProgress;
};

// Butterfly — loads the glTF model, configures materials for glow +
// transparency, builds a scroll-driven CatmullRom flight path, and
// moves/orients the mesh each frame with inertia smoothing.
const Butterfly = () => {
  const group = useRef();
  const { scene, animations } = useGLTF("/butterfly/butterfly.glb");
  const { actions } = useAnimations(animations, group);
  
  // Set up emissive glow and alpha-map transparency on all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Reset prior shader overrides
        child.material.onBeforeCompile = () => {};
        child.material.blending = THREE.NormalBlending;
        child.material.depthWrite = true;
        
        // Bright cyan emissive; toneMapped off so Bloom can pick it up
        child.material.emissive = new THREE.Color('#55ffff');
        child.material.emissiveIntensity = 2.5;
        child.material.toneMapped = false;
        
        // Use diffuse texture as alpha map — dark pixels become transparent
        if (child.material.map) {
          child.material.alphaMap = child.material.map;
          child.material.transparent = true;
          child.material.alphaTest = 0.1;
        } else {
          child.material.transparent = false;
        }
        
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);
  
  const scrollProgress = useScrollProgressRef();
  const currentProgress = useRef(0);   // Smoothed scroll value (inertia)
  const actionRef = useRef(null);      // Active animation action
  const smoothRotation = useRef({ x: Math.PI * 0.25, z: 0 }); // Damped rotation

  // Responsive scale — narrower horizontal range on mobile
  const { viewport } = useThree();
  const xFactor = viewport.width < 5 ? 0.4 : 1.0;
  const yFactor = viewport.width < 5 ? 1.5 : 1.0;

  // Flight path — butterfly enters, exits, re-enters, creating a looping trajectory
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5 * xFactor, 5 * yFactor, 0),   // Entrance: top-left
      new THREE.Vector3(5 * xFactor, 4 * yFactor, 0),    // Right exit
      new THREE.Vector3(10 * xFactor, -2 * yFactor, 0),   // Re-entry right
      new THREE.Vector3(-18 * xFactor, -4 * yFactor, 0),  // Left exit
      new THREE.Vector3(-4 * xFactor, -6 * yFactor, 0),  // Re-entry left
      new THREE.Vector3(0 * xFactor, -8 * yFactor, 0),   // Finale: centre
    ]);
  }, [xFactor, yFactor]);

  // Play the first animation clip (wing flap) on mount
  useEffect(() => {
    if (actions) {
      const actionNames = Object.keys(actions);
      if (actionNames.length > 0) {
        const action = actions[actionNames[0]];
        action.reset().fadeIn(0.5).play();
        action.timeScale = 1.0;
        actionRef.current = action;
      }
    }
  }, [actions]);

  // Per-frame loop — move along spline, orient, adjust wing speed
  useFrame((state, delta) => {
    if (!group.current) return;

    const targetProgress = Math.min(1, Math.max(0, scrollProgress.current));

    // Lerp toward target scroll position (0.05 = inertia factor)
    currentProgress.current = THREE.MathUtils.lerp(
      currentProgress.current,
      targetProgress,
      0.05
    );

    const t = currentProgress.current;

    // Position on spline
    const position = curve.getPointAt(t);
    group.current.position.copy(position);

    // Face direction of travel
    const lookAtT = Math.min(1, t + 0.01);
    const lookAtPos = curve.getPointAt(lookAtT);
    group.current.lookAt(lookAtPos);

    const speed = Math.abs(targetProgress - currentProgress.current);
    const tangent = curve.getTangentAt(t);

    // Bank into turns so wing surface stays visible
    const targetBankZ = THREE.MathUtils.clamp(tangent.x * -0.4, -0.5, 0.5);

    // Pitch adapts to speed (20°–60° range)
    const tiltFactor = THREE.MathUtils.clamp(speed * 15, 0, 1);
    const targetTiltX = THREE.MathUtils.lerp(
      THREE.MathUtils.degToRad(35),
      THREE.MathUtils.degToRad(55),
      tiltFactor
    );
    const clampedTiltX = THREE.MathUtils.clamp(
      targetTiltX,
      THREE.MathUtils.degToRad(20),
      THREE.MathUtils.degToRad(60)
    );

    // Smooth rotation to prevent snapping
    smoothRotation.current.x = THREE.MathUtils.lerp(smoothRotation.current.x, clampedTiltX, 0.08);
    smoothRotation.current.z = THREE.MathUtils.lerp(smoothRotation.current.z, targetBankZ, 0.08);

    group.current.rotation.x = smoothRotation.current.x;
    group.current.rotation.z = smoothRotation.current.z;

    // Fast flap while moving, slow flap when idle
    if (actionRef.current) {
      actionRef.current.timeScale = speed > 0.01 ? 2.0 : 0.5;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1.5} />
    </group>
  );
};

// Full-screen fixed overlay — transparent canvas with Bloom post-processing.
// pointerEvents: none so it never blocks page interaction.
const ButterflyBackground = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <Canvas gl={{ alpha: true }} camera={{ position: [10, 10, 12], fov: 50 }}>
        <ambientLight intensity={2} />
        <pointLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, 5]} intensity={1} />
        {/* Bloom makes the emissive butterfly glow */}
        <EffectComposer>
          <Bloom
            intensity={2.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
        <Suspense fallback={null}>
            <Butterfly />
        </Suspense>
      </Canvas>
    </div>
  );
};
export default ButterflyBackground;

