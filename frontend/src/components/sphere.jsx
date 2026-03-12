import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HologramSphere = () => {
    // 1. Create a reference to the <div> where the canvas will live
    const mountRef = useRef(null);

    useEffect(() => {
        // Current reference to the DOM element
        const currentMount = mountRef.current;

        const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

        const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect - edges glow, center is dark
    float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    fresnel = pow(fresnel, 3.5);
    
    // Create the ring glow effect
    float glow = pow(fresnel, 2.0) * 1.5;
    
    // Blue to purple gradient
    vec3 blue = vec3(0.2, 0.4, 1.0);
    vec3 purple = vec3(0.6, 0.2, 1.0);
    vec3 white = vec3(1.0, 1.0, 1.0);
    
    // Mix colors based on fresnel
    vec3 color = mix(blue, purple, fresnel);
    
    // Add bright white highlights on edges
    float highlight = pow(fresnel, 4.0);
    color = mix(color, purple, highlight * 1.5);
    
    // Add some variation for the bright spots
    float spots = sin(vPosition.x * 8.0 + uTime) * sin(vPosition.y * 8.0 + uTime * 0.5);
    spots = max(0.0, spots) * pow(fresnel, 3.0) * 0.5;
    color += white * spots;
    
    // Final alpha - more transparent in center, opaque on edges
    float alpha = glow * 0.8;
    
    gl_FragColor = vec4(color * glow, alpha);
  }
`;

        // --- SETUP SCENE ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true makes background transparent

        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // --- CREATE THE HOLOGRAPHIC SPHERE ---
        const geometry = new THREE.SphereGeometry(2.0, 128, 128);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 }
            },
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // --- LIGHTING ---
        // const light = new THREE.PointLight(0xffffff, 50);
        // light.position.set(5, 5, 5);
        // scene.add(light);
        camera.position.z = 3;

        // --- RESPONSIVE POSITIONING ---
        const updateSphereForScreenSize = () => {
            const width = window.innerWidth;
            
            if (width < 640) {
                // Mobile: smaller sphere, centered
                sphere.scale.set(0.6, 0.6, 0.6);
                sphere.position.set(0, 0.8, -1);
            } else if (width < 1024) {
                // Tablet: medium sphere, slightly offset
                sphere.scale.set(0.8, 0.8, 0.8);
                sphere.position.set(1.2, 0.5, -1);
            } else {
                // Desktop: original size and position
                sphere.scale.set(1, 1, 1);
                sphere.position.set(3.0, 0, -1);
            }
        };

        // Initial positioning
        updateSphereForScreenSize();

        // --- RESIZE HANDLER ---
        const handleResize = () => {
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            updateSphereForScreenSize();
        };

        window.addEventListener('resize', handleResize);

        // --- ANIMATION LOOP ---
        let frameId;
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsedTime;
            sphere.rotation.y += 0.003;
            sphere.rotation.x += 0.001;
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        // --- CLEANUP ---
        // Very important in React! Removes the canvas when the component is unmounted
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            currentMount.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
        };
    }, []); // Empty array means this runs once on mount

    return (
        <div
            ref={mountRef}
            className="absolute inset-0 z-5 pointer-events-none"
            style={{ width: '100%', height: '100vh', background: 'transparent' }}
        />
    );
};

export default HologramSphere;