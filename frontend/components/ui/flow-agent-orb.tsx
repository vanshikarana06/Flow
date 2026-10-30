"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FlowAgentOrbProps {
  size?: number;
  isProcessing?: boolean;
  className?: string;
  showLabels?: boolean;
  glow?: boolean;
}

export function FlowAgentOrb({
  size = 120,
  isProcessing = false,
  className = "",
  showLabels = false,
  glow = true,
}: FlowAgentOrbProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size, perspective: 800 }}
    >
      {/* Ambient background glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle, rgba(217, 119, 54, 0.18) 0%, rgba(197, 138, 50, 0.08) 50%, transparent 70%)",
            opacity: isProcessing ? 1 : 0.6,
          }}
        />
      )}

      {/* 3D Ring 1 - Outer Terracotta Orbital */}
      <motion.div
        animate={{
          rotateX: [65, 75, 65],
          rotateY: [0, 180, 360],
          rotateZ: [0, 90, 180, 270, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: isProcessing ? 6 : 14,
          ease: "linear",
        }}
        className="absolute rounded-full border border-[#D97736]/40 pointer-events-none"
        style={{
          width: size * 0.92,
          height: size * 0.92,
          transformStyle: "preserve-3d",
          borderTopColor: "#D97736",
          borderRightColor: "transparent",
        }}
      >
        {/* Orbital satellite node */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#D97736] shadow-[0_0_8px_#D97736]"
        />
      </motion.div>

      {/* 3D Ring 2 - Counter-rotating Amber Ring */}
      <motion.div
        animate={{
          rotateX: [55, 45, 55],
          rotateY: [360, 180, 0],
          rotateZ: [360, 270, 180, 90, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isProcessing ? 8 : 18,
          ease: "linear",
        }}
        className="absolute rounded-full border border-[#C58A32]/40 pointer-events-none"
        style={{
          width: size * 0.74,
          height: size * 0.74,
          transformStyle: "preserve-3d",
          borderBottomColor: "#C58A32",
          borderLeftColor: "transparent",
        }}
      >
        {/* Second satellite node */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#C58A32] shadow-[0_0_6px_#C58A32]"
        />
      </motion.div>

      {/* 3D Ring 3 - Inner Equatorial Ring */}
      <motion.div
        animate={{
          rotateX: [30, 20, 30],
          rotateY: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: isProcessing ? 10 : 22,
          ease: "linear",
        }}
        className="absolute rounded-full border border-[#E8DFD1] pointer-events-none"
        style={{
          width: size * 0.54,
          height: size * 0.54,
          transformStyle: "preserve-3d",
        }}
      />

      {/* Central Pulsing Coordination Core */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.15, 1] : [1, 1.05, 1],
          boxShadow: isProcessing
            ? [
                "0 0 12px rgba(217,119,54,0.4)",
                "0 0 24px rgba(217,119,54,0.7)",
                "0 0 12px rgba(217,119,54,0.4)",
              ]
            : [
                "0 0 8px rgba(217,119,54,0.2)",
                "0 0 14px rgba(217,119,54,0.4)",
                "0 0 8px rgba(217,119,54,0.2)",
              ],
        }}
        transition={{
          repeat: Infinity,
          duration: isProcessing ? 1.4 : 3,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D97736] via-[#E2884B] to-[#C58A32] text-white font-bold shadow-md cursor-pointer transition-transform"
        style={{
          width: size * 0.34,
          height: size * 0.34,
          fontSize: size * 0.16,
        }}
      >
        <span>F</span>
      </motion.div>

      {showLabels && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-[#777064]">
          {isProcessing ? "Synthesizing Plan..." : "Agent Core Ready"}
        </div>
      )}
    </div>
  );
}
