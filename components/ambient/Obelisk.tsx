
/**
 * @file components/ambient/Obelisk.tsx
 * @description Renders the "Obelisk of Eternity," now utilizing a true 3D mesh 
 * via React Three Fiber to represent lifetime value spend.
 * Enhanced with golden pulse manifestation on Boon delivery.
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../../contexts/AuthContext';

interface ObeliskProps {
  lifetimeBurn: number;
  triggerBoonPulse?: boolean; // Signal to trigger the soft golden pulse
}

const Monolith: React.FC<{ color: string; isPulsing: boolean }> = ({ color, isPulsing }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
        if (lightRef.current && isPulsing) {
          lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 1.5;
        }
    });

    // Custom geometry for a tapered obelisk
    const geometry = useMemo(() => {
        return new THREE.CylinderGeometry(0.1, 0.8, 3.5, 4); 
    }, []);

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            {/* @ts-ignore */}
            <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
                <MeshTransmissionMaterial 
                    backside
                    backsideThickness={0.1}
                    thickness={0.5}
                    chromaticAberration={0.1}
                    anisotropy={0.3}
                    distortion={0.4}
                    distortionScale={0.3}
                    temporalDistortion={0.2}
                    color={isPulsing ? '#FFD700' : color}
                    roughness={0.2}
                    metalness={0.1}
                />
            {/* @ts-ignore */}
            </mesh>
            {/* Inner Core Glow */}
            {/* @ts-ignore */}
            <pointLight ref={lightRef} position={[0, 0, 0]} intensity={isPulsing ? 5 : 2} color={isPulsing ? '#FFD700' : color} distance={4} />
        </Float>
    );
};

const Obelisk: React.FC<ObeliskProps> = ({ lifetimeBurn, triggerBoonPulse = false }) => {
  const { currentUser } = useAuth();
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (triggerBoonPulse) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [triggerBoonPulse]);

  // Determine growth/color stage
  const stage = lifetimeBurn < 10000 ? 0 : lifetimeBurn < 100000 ? 1 : lifetimeBurn < 1000000 ? 2 : 3;
  const color = stage === 3 ? '#FFD700' : stage === 2 ? '#6A0DAD' : stage === 1 ? '#20B2AA' : '#3EB991';

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-visible">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
              {/* @ts-ignore */}
              <ambientLight intensity={0.5} />
              {/* @ts-ignore */}
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <Monolith color={color} isPulsing={isPulsing} />
          </Canvas>
      </div>

      {/* Manifestation Flare */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.4, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="absolute w-64 h-64 bg-gilded-accent/20 blur-[80px] rounded-full z-0"
          />
        )}
      </AnimatePresence>

      {/* Base Pedestal Information (HTML Overlay) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-10 text-center w-64 z-20 pointer-events-none"
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-2" />
        <h3 className="text-[10px] font-bold font-mono tracking-[0.4em] text-text-secondary uppercase mb-1">
          {currentUser?.ageOfAscension ? "Potential Archive" : "Obelisk of Genesis"}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl font-bold font-comfortaa" style={{ color: isPulsing ? '#FFD700' : color }}>
            {currentUser?.ageOfAscension ? currentUser.phiBalance.toLocaleString() : lifetimeBurn.toLocaleString()}
          </span>
          <span className="text-xs text-white/50">{currentUser?.ageOfAscension ? "Φ" : "Ξ"}</span>
        </div>
        {isPulsing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] font-bold text-gilded-accent uppercase mt-2 animate-pulse"
          >
            Boon Manifested
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Obelisk;
