"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PointerDragState<T> = {
  payload: T;
  x: number;
  y: number;
};

/**
 * Drag tàctil/ratolí: el ghost es posiciona al punt del dit (clientX/Y).
 * Usa setPointerCapture perquè el dit no “es perdi” en tablets.
 */
export function usePointerDrag<T>(onDrop: (payload: T, clientX: number, clientY: number) => void) {
  const [drag, setDrag] = useState<PointerDragState<T> | null>(null);
  const dragRef = useRef<PointerDragState<T> | null>(null);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const startDrag = useCallback((e: React.PointerEvent, payload: T) => {
    if (dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const next = { payload, x: e.clientX, y: e.clientY };
    dragRef.current = next;
    setDrag(next);
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      const next = dragRef.current
        ? { ...dragRef.current, x: e.clientX, y: e.clientY }
        : null;
      dragRef.current = next;
      setDrag(next);
    };

    const onUp = (e: PointerEvent) => {
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!current) return;
      onDropRef.current(current.payload, e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag]);

  return { drag, startDrag };
}
