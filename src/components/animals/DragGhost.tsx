"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type Props = {
  x: number;
  y: number;
  children: ReactNode;
  className?: string;
};

/** Fantasma de drag al <body> per evitar offsets en tablets (fixed dins overflow). */
export default function DragGhost({ x, y, children, className = "" }: Props) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`animal-chip drag-ghost animal-ghost ${className}`.trim()}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%) scale(1.06)",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
