"use client";

import React, { useState, useEffect, useRef } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  characters?: string;
  className?: string;
  animateOnHover?: boolean;
}

export function DecryptedText({
  text,
  speed = 35,
  maxIterations = 8,
  sequential = true,
  characters = "0123456789abcdef",
  className = "",
  animateOnHover = true,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const isAnimatingRef = useRef(false);

  const startAnimation = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "-" || char === ":") return char;
            if (sequential && index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      iteration += 1 / (maxIterations / text.length);

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
        isAnimatingRef.current = false;
      }
    }, speed);
  };

  useEffect(() => {
    startAnimation();
  }, [text]);

  const handleMouseEnter = () => {
    if (animateOnHover) {
      setIsHovered(true);
      startAnimation();
    }
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={`font-mono transition-colors ${className}`}
      title={text}
    >
      {displayText}
    </span>
  );
}
