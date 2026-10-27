"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SequenceStep } from "@/data/animals-tema2";

type DragState = {
  stepId: string;
  fromIndex: number | null;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  steps: SequenceStep[];
  onScore: (delta: number) => void;
  resetKey: number;
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SequenceBoard({ steps, onScore, resetKey }: Props) {
  const sorted = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );
  const [slots, setSlots] = useState<(string | null)[]>(() =>
    Array(steps.length).fill(null),
  );
  const [bankOrder, setBankOrder] = useState(() => shuffle(steps.map((s) => s.id)));
  const [locked, setLocked] = useState<boolean[]>(() => Array(steps.length).fill(false));
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const byId = useMemo(() => {
    const m = new Map<string, SequenceStep>();
    for (const s of steps) m.set(s.id, s);
    return m;
  }, [steps]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    setSlots(Array(steps.length).fill(null));
    setBankOrder(shuffle(steps.map((s) => s.id)));
    setLocked(Array(steps.length).fill(false));
    setMessage(null);
    setDrag(null);
  }, [steps, resetKey]);

  const placed = new Set(slots.filter(Boolean) as string[]);
  const bank = bankOrder.filter((id) => !placed.has(id)).map((id) => byId.get(id)!);

  const allDone = locked.every(Boolean) && locked.length === steps.length;

  const startDrag = (e: React.PointerEvent, stepId: string, fromIndex: number | null) => {
    if (dragRef.current) return;
    if (fromIndex !== null && locked[fromIndex]) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const next: DragState = {
      stepId,
      fromIndex,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    dragRef.current = next;
    setDrag(next);
  };

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : null));
    };

    const onUp = (e: PointerEvent) => {
      const current = dragRef.current;
      setDrag(null);
      dragRef.current = null;
      if (!current) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el?.closest("[data-slot-index]") as HTMLElement | null;
      const slotIndex =
        slotEl?.dataset.slotIndex !== undefined
          ? Number(slotEl.dataset.slotIndex)
          : null;

      if (slotIndex === null || Number.isNaN(slotIndex)) {
        // return to bank: clear from slot if came from one
        if (current.fromIndex !== null) {
          setSlots((prev) => {
            const next = [...prev];
            if (next[current.fromIndex!] === current.stepId) next[current.fromIndex!] = null;
            return next;
          });
        }
        return;
      }

      if (locked[slotIndex]) return;

      const expected = sorted[slotIndex];
      const ok = current.stepId === expected.id;

      setSlots((prev) => {
        const next = [...prev];
        if (current.fromIndex !== null && next[current.fromIndex] === current.stepId) {
          next[current.fromIndex] = null;
        }
        // kick previous occupant back to bank
        next[slotIndex] = current.stepId;
        return next;
      });

      if (ok) {
        setLocked((prev) => {
          const next = [...prev];
          next[slotIndex] = true;
          return next;
        });
        onScore(1);
        setFlash("ok");
        setMessage(`Pas ${slotIndex + 1}: ${expected.label}`);
      } else {
        onScore(-1);
        setFlash("ko");
        setMessage("Encara no. Mira l’ordre de la metamorfosi.");
        // leave wrong placement so they can move again
      }
      window.setTimeout(() => setFlash(null), 400);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, locked, onScore, sorted]);

  const ghost = drag ? byId.get(drag.stepId) : null;

  return (
    <div className={`animal-sequence ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      <div className="animal-bank">
        <h3>Etapes</h3>
        <div className="animal-bank-chips">
          {bank.map((s) => (
            <button
              key={s.id}
              type="button"
              className="animal-chip"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => startDrag(e, s.id, null)}
            >
              <span className="animal-emoji">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sequence-track">
        {sorted.map((step, index) => {
          const id = slots[index];
          const placedStep = id ? byId.get(id) : null;
          const isLocked = locked[index];
          const hiding =
            drag && drag.fromIndex === index && drag.stepId === id;

          return (
            <div key={step.id} className="sequence-step-wrap">
              <span className="sequence-num">{index + 1}</span>
              <div
                data-slot-index={index}
                className={`sequence-slot ${isLocked ? "correct" : placedStep ? "wrong" : "empty"}`}
              >
                {placedStep && !hiding && (
                  <button
                    type="button"
                    className="animal-chip in-group"
                    style={{ touchAction: "none" }}
                    disabled={isLocked}
                    onPointerDown={(e) => startDrag(e, placedStep.id, index)}
                  >
                    <span className="animal-emoji">{placedStep.emoji}</span>
                    <span>{placedStep.label}</span>
                  </button>
                )}
                {!placedStep && <span className="sequence-placeholder">?</span>}
              </div>
              {index < sorted.length - 1 && <span className="sequence-arrow">→</span>}
            </div>
          );
        })}
      </div>

      {allDone && (
        <p className="math-message">Metamorfosi completa! De l’ou a la papallona 🦋</p>
      )}
      {message && !allDone && <p className="math-message">{message}</p>}

      {ghost && drag && (
        <div
          className="animal-chip drag-ghost animal-ghost"
          style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
        >
          <span className="animal-emoji">{ghost.emoji}</span>
          <span>{ghost.label}</span>
        </div>
      )}
    </div>
  );
}
