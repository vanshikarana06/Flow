"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, Check, ShieldAlert } from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";

interface SlideToConfirmProps {
  onConfirm: () => void;
  label?: string;
  confirmedLabel?: string;
  className?: string;
}

export function SlideToConfirm({
  onConfirm,
  label = "Slide to Authorize & Execute",
  confirmedLabel = "Authorized & Minted",
  className = "",
}: SlideToConfirmProps) {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    if (isConfirmed) return;
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    if (isConfirmed) return;
    setIsDragging(true);
  };

  const updatePosition = (clientX: number) => {
    if (!isDragging || isConfirmed || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const maxDrag = rect.width - 44; // Button width is 40px + 4px margin
    const currentDrag = Math.max(0, Math.min(clientX - rect.left - 20, maxDrag));
    const percentage = currentDrag / maxDrag;

    setSliderPosition(percentage);

    if (percentage >= 0.96) {
      setIsConfirmed(true);
      setIsDragging(false);
      triggerConfetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#F28C38", "#C65D20", "#477A58"],
      });
      onConfirm();
    }
  };

  const handleMouseUp = () => {
    if (!isConfirmed) {
      setIsDragging(false);
      setSliderPosition(0);
    }
  };

  return (
    <div
      ref={trackRef}
      onMouseMove={(e) => updatePosition(e.clientX)}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
      onTouchEnd={handleMouseUp}
      className={`relative flex h-10 w-full items-center select-none overflow-hidden rounded-lg border border-[#F5C2BC] bg-[#FDEDEB] p-1 transition-all ${className}`}
    >
      {/* Background Fill Progress */}
      <div
        className="absolute inset-y-0 left-0 bg-[#F28C38]/20 transition-all duration-75"
        style={{ width: `${sliderPosition * 100}%` }}
      />

      {/* Label Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-semibold text-[#C65345] gap-1.5">
        {isConfirmed ? (
          <>
            <Check size={14} className="text-[#477A58]" />
            <span className="text-[#477A58]">{confirmedLabel}</span>
          </>
        ) : (
          <>
            <ShieldAlert size={14} />
            <span>{label}</span>
          </>
        )}
      </div>

      {/* Slider Thumb Handle */}
      {!isConfirmed && (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative z-10 flex h-8 w-8 cursor-grab active:cursor-grabbing items-center justify-center rounded-md bg-[#C65345] text-white shadow-md transition-transform"
          style={{
            transform: `translateX(${sliderPosition * (trackRef.current ? trackRef.current.clientWidth - 44 : 200)}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <ArrowRight size={14} />
        </div>
      )}
    </div>
  );
}

