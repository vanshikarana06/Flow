"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Flow3DCoreProps {
  size?: number;
  className?: string;
  intensity?: number;
  interactive?: boolean;
}

export function Flow3DCore({
  size = 120,
  className = "",
  intensity = 1,
  interactive = true,
}: Flow3DCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user accessibility preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || prefersReducedMotion) return;

    let animationFrameId: number;
    let isVisible = true;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Geometry: Core Icosahedron Wireframe + Particle Shell
    const coreGeometry = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xf28c38,
      wireframe: true,
      transparent: true,
      opacity: 0.65 * intensity,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Outer orbiting particle ring
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0xf28c38); // Terracotta
    const c2 = new THREE.Color(0xc65d20); // Dark Orange
    const c3 = new THREE.Color(0xfdeee5); // Warm cream highlight

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.4 + Math.random() * 0.4;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const chosenColor = Math.random() > 0.6 ? c1 : Math.random() > 0.3 ? c2 : c3;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85 * intensity,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xf28c38,
      transparent: true,
      opacity: 0.18 * intensity,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Mouse interactive target
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.5;
      targetY = y * 1.5;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // IntersectionObserver to pause rendering when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      // Organic rotation + breathing scale
      const breath = 1 + Math.sin(elapsedTime * 2.2) * 0.04;
      coreMesh.scale.set(breath, breath, breath);
      particles.scale.set(breath, breath, breath);

      coreMesh.rotation.x = elapsedTime * 0.35 + currentY;
      coreMesh.rotation.y = elapsedTime * 0.45 + currentX;

      particles.rotation.x = -elapsedTime * 0.2 + currentY * 0.5;
      particles.rotation.y = -elapsedTime * 0.25 + currentX * 0.5;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
    };
  }, [size, intensity, interactive, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full bg-[#FCEEE5] border border-[#F7D2BC] ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40" />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center select-none overflow-visible pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="FLOW 3D Living Agentic Core"
    />
  );
}

