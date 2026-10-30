"use client";

import React from "react";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.25,
  className = "",
  style,
  ...props
}: FadeInProps) {
  return (
    <div
      className={`animate-in fade-in-0 duration-300 fill-mode-both ${className}`}
      style={{
        animationDelay: delay ? `${delay}s` : undefined,
        animationDuration: `${duration}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { staggerDelay?: number }) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`animate-in fade-in-0 duration-200 fill-mode-both ${className}`} {...props}>
      {children}
    </div>
  );
}
