'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Salon3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Gold Materials
    const polishedGoldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F5BA42'),
      metalness: 0.92,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });

    const chromeGoldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFE79A'),
      metalness: 0.98,
      roughness: 0.08,
    });

    // 1. 3D Model of Golden Barber Shears (Scissors)
    const shearsGroup = new THREE.Group();

    // Blade 1
    const blade1Shape = new THREE.Shape();
    blade1Shape.moveTo(0, 0);
    blade1Shape.lineTo(0.12, 1.8);
    blade1Shape.lineTo(0.04, 2.6);
    blade1Shape.lineTo(0, 2.7);
    blade1Shape.lineTo(-0.06, 2.5);
    blade1Shape.lineTo(-0.1, 1.6);
    blade1Shape.lineTo(-0.16, 0.2);
    blade1Shape.closePath();

    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const blade1Geo = new THREE.ExtrudeGeometry(blade1Shape, extrudeSettings);
    const blade1Mesh = new THREE.Mesh(blade1Geo, polishedGoldMaterial);

    // Finger Ring 1
    const ring1Geo = new THREE.TorusGeometry(0.38, 0.07, 16, 40);
    const ring1Mesh = new THREE.Mesh(ring1Geo, polishedGoldMaterial);
    ring1Mesh.position.set(-0.25, -0.9, 0);
    ring1Mesh.rotation.z = 0.3;

    // Handle Shank 1
    const shank1Geo = new THREE.CylinderGeometry(0.06, 0.08, 1.0, 16);
    const shank1Mesh = new THREE.Mesh(shank1Geo, polishedGoldMaterial);
    shank1Mesh.position.set(-0.14, -0.45, 0);
    shank1Mesh.rotation.z = 0.25;

    const arm1 = new THREE.Group();
    arm1.add(blade1Mesh);
    arm1.add(ring1Mesh);
    arm1.add(shank1Mesh);
    arm1.rotation.z = 0.25;

    // Blade 2
    const blade2Mesh = blade1Mesh.clone();
    blade2Mesh.scale.x = -1;

    const ring2Mesh = new THREE.Mesh(ring1Geo, polishedGoldMaterial);
    ring2Mesh.position.set(0.25, -0.9, 0);
    ring2Mesh.rotation.z = -0.3;

    const shank2Mesh = new THREE.Mesh(shank1Geo, polishedGoldMaterial);
    shank2Mesh.position.set(0.14, -0.45, 0);
    shank2Mesh.rotation.z = -0.25;

    const arm2 = new THREE.Group();
    arm2.add(blade2Mesh);
    arm2.add(ring2Mesh);
    arm2.add(shank2Mesh);
    arm2.rotation.z = -0.25;

    // Pivot Screw (Center gemstone / golden rivet)
    const pivotGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.16, 24);
    const pivotMesh = new THREE.Mesh(pivotGeo, chromeGoldMaterial);
    pivotMesh.rotation.x = Math.PI / 2;

    shearsGroup.add(arm1);
    shearsGroup.add(arm2);
    shearsGroup.add(pivotMesh);

    // Initial orientation & position of shears
    shearsGroup.scale.set(0.85, 0.85, 0.85);
    shearsGroup.position.set(2.4, 0.1, 0);
    shearsGroup.rotation.z = -0.3;
    mainGroup.add(shearsGroup);

    // 2. Flowing 3D Golden Hair Ribbon / Wave Helix
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -2.2, -0.8),
      new THREE.Vector3(-0.8, -0.5, 0.6),
      new THREE.Vector3(0.5, 1.2, -0.4),
      new THREE.Vector3(2.0, 0.5, 0.8),
      new THREE.Vector3(3.2, -1.0, -0.5),
    ]);

    const ribbonGeo = new THREE.TubeGeometry(curve, 64, 0.04, 12, false);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.7,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMaterial);
    ribbonMesh.position.set(1.2, 0, -0.5);
    mainGroup.add(ribbonMesh);

    // 3. Golden Dust Particles System (400 floating sparkles)
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 235, 150, 1)');
      gradient.addColorStop(0.35, 'rgba(245, 186, 66, 0.85)');
      gradient.addColorStop(1, 'rgba(245, 186, 66, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xffe79a, 2.5);
    goldKeyLight.position.set(4, 4, 5);
    scene.add(goldKeyLight);

    const warmFillLight = new THREE.PointLight(0xf5ba42, 2.0, 15);
    warmFillLight.position.set(2, -2, 3);
    scene.add(warmFillLight);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX = (event.clientX - halfX) * 0.0006;
      mouseY = (event.clientY - halfY) * 0.0006;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      if (width < 800) {
        shearsGroup.position.set(0, 0.3, -1.5);
        shearsGroup.scale.set(0.65, 0.65, 0.65);
        ribbonMesh.position.set(0, 0.3, -1.8);
      } else {
        shearsGroup.position.set(2.4, 0.1, 0);
        shearsGroup.scale.set(0.85, 0.85, 0.85);
        ribbonMesh.position.set(1.2, 0, -0.5);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);
    onResize();

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth Parallax
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;

      mainGroup.rotation.y = targetX * 1.8;
      mainGroup.rotation.x = targetY * 1.8;

      // Shears gentle floating & precision cutting motion
      const cutAngle = Math.sin(elapsed * 2.2) * 0.18 + 0.22;
      arm1.rotation.z = cutAngle;
      arm2.rotation.z = -cutAngle;

      shearsGroup.rotation.y = Math.sin(elapsed * 0.7) * 0.35 - 0.2;
      shearsGroup.rotation.x = Math.cos(elapsed * 0.5) * 0.2;
      shearsGroup.position.y = Math.sin(elapsed * 1.2) * 0.12 + 0.1;

      // Ribbon rotation
      ribbonMesh.rotation.y = elapsed * 0.2;
      ribbonMesh.rotation.x = Math.sin(elapsed * 0.3) * 0.15;

      // Particles floating
      particles.rotation.y = elapsed * 0.025;
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      polishedGoldMaterial.dispose();
      chromeGoldMaterial.dispose();
      blade1Geo.dispose();
      ring1Geo.dispose();
      shank1Geo.dispose();
      pivotGeo.dispose();
      ribbonGeo.dispose();
      ribbonMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
