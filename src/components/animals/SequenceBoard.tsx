"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DragGhost from "@/components/animals/DragGhost";
import type { SequenceStep } from "@/data/animals-tema2";
import { usePointerDrag } from "@/hooks/usePointerDrag";

type DragPayload = {
  stepId: string;
  fromIndex: number | null;
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
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, SequenceStep>();
    for (const s of steps) m.set(s.id, s);
    return m;
  }, [steps]);

  useEffect(() => {
    setSlots(Array(steps.length).fill(null));
    setBankOrder(shuffle(steps.map((s) => s.id)));
    setLocked(Array(steps.length).fill(false));
    setMessage(null);
  }, [steps, resetKey]);

  const placed = new Set(slots.filter(Boolean) as string[]);
  const bank = bankOrder.filter((id) => !placed.has(id)).map((id) => byId.get(id)!);
  const allDone = locked.every(Boolean) && locked.length === steps.length;

  const handleDrop = useCallback(
    (payload: DragPayload, clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY);
      const slotEl = el?.closest("[data-slot-index]") as HTMLElement | null;
      const slotIndex =
        slotEl?.dataset.slotIndex !== undefined
          ? Number(slotEl.dataset.slotIndex)
          : null;

      if (slotIndex === null || Number.isNaN(slotIndex)) {
        if (payload.fromIndex !== null) {
          setSlots((prev) => {
            const next = [...prev];
            if (next[payload.fromIndex!] === payload.stepId) {
              next[payload.fromIndex!] = null;
            }
            return next;
          });
        }
        return;
      }

      if (locked[slotIndex]) return;

      const expected = sorted[slotIndex];
      const ok = payload.stepId === expected.id;

      setSlots((prev) => {
        const next = [...prev];
        if (payload.fromIndex !== null && next[payload.fromIndex] === payload.stepId) {
          next[payload.fromIndex] = null;
        }
        next[slotIndex] = payload.stepId;
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
      }
      window.setTimeout(() => setFlash(null), 400);
    },
    [locked, onScore, sorted],
  );

  const { drag, startDrag } = usePointerDrag<DragPayload>(handleDrop);
  const ghost = drag ? byId.get(drag.payload.stepId) : null;

  return (
    <div className={`animal-sequence ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      <div className="animal-bank">
        <h3>Etapes</h3>
        <div className="animal-bank-chips">
          {bank.map((s) => {
            const isDragging = drag?.payload.stepId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`animal-chip ${isDragging ? "dragging-source" : ""}`}
                style={{ touchAction: "none" }}
                onPointerDown={(e) =>
                  startDrag(e, { stepId: s.id, fromIndex: null })
                }
              >
                <span className="animal-emoji">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sequence-track">
        {sorted.map((step, index) => {
          const id = slots[index];
          const placedStep = id ? byId.get(id) : null;
          const isLocked = locked[index];
          const isDragging =
            drag && drag.payload.fromIndex === index && drag.payload.stepId === id;

          return (
            <div key={step.id} className="sequence-step-wrap">
              <span className="sequence-num">{index + 1}</span>
              <div
                data-slot-index={index}
                className={`sequence-slot ${isLocked ? "correct" : placedStep ? "wrong" : "empty"}`}
              >
                {placedStep && !isDragging && (
                  <button
                    type="button"
                    className="animal-chip in-group"
                    style={{ touchAction: "none" }}
                    disabled={isLocked}
                    onPointerDown={(e) =>
                      startDrag(e, { stepId: placedStep.id, fromIndex: index })
                    }
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
        <DragGhost x={drag.x} y={drag.y}>
          <span className="animal-emoji">{ghost.emoji}</span>
          <span>{ghost.label}</span>
        </DragGhost>
      )}
    </div>
  );
}
