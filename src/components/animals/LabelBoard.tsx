"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LabelPart } from "@/data/animals-tema2";

type Placement = {
  partId: string;
  correct: boolean;
};

type DragState = {
  partId: string;
  label: string;
  fromZoneId: string | null;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  parts: LabelPart[];
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

function InsectDiagram() {
  return (
    <svg className="insect-svg" viewBox="0 0 400 280" aria-hidden>
      {/* ales */}
      <ellipse cx="200" cy="70" rx="70" ry="36" fill="#b8e4ff" stroke="#3aa0e8" strokeWidth="3" />
      <ellipse cx="255" cy="95" rx="55" ry="28" fill="#d4f0ff" stroke="#3aa0e8" strokeWidth="3" />
      {/* cos */}
      <ellipse cx="95" cy="140" rx="38" ry="32" fill="#6ee0b0" stroke="#2f9e62" strokeWidth="3" />
      <ellipse cx="165" cy="140" rx="36" ry="34" fill="#ffe066" stroke="#e6b422" strokeWidth="3" />
      <ellipse cx="250" cy="140" rx="55" ry="30" fill="#ff7a59" stroke="#d64545" strokeWidth="3" />
      {/* antenes */}
      <path d="M70 120 Q40 70 55 40" fill="none" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <path d="M90 118 Q100 70 120 42" fill="none" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <circle cx="55" cy="40" r="6" fill="#243447" />
      <circle cx="120" cy="42" r="6" fill="#243447" />
      {/* potes */}
      <path d="M145 170 L120 230" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <path d="M165 172 L165 235" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <path d="M185 170 L210 230" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      {/* ull */}
      <circle cx="80" cy="132" r="7" fill="#243447" />
    </svg>
  );
}

export default function LabelBoard({ parts, onScore, resetKey }: Props) {
  const [bankOrder, setBankOrder] = useState(() => shuffle(parts.map((p) => p.id)));
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const partsById = useMemo(() => {
    const m = new Map<string, LabelPart>();
    for (const p of parts) m.set(p.id, p);
    return m;
  }, [parts]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    setBankOrder(shuffle(parts.map((p) => p.id)));
    setPlacements({});
    setDrag(null);
  }, [parts, resetKey]);

  const placedIds = useMemo(
    () => new Set(Object.values(placements).map((p) => p.partId)),
    [placements],
  );

  const bankParts = bankOrder
    .filter((id) => !placedIds.has(id))
    .map((id) => partsById.get(id)!)
    .filter(Boolean);

  const startDrag = (
    e: React.PointerEvent,
    partId: string,
    label: string,
    fromZoneId: string | null,
  ) => {
    if (dragRef.current) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const next: DragState = {
      partId,
      label,
      fromZoneId,
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
      const zoneEl = el?.closest("[data-zone-id]") as HTMLElement | null;
      const zoneId = zoneEl?.dataset.zoneId ?? null;

      setPlacements((prev) => {
        const next = { ...prev };
        if (current.fromZoneId && next[current.fromZoneId]?.partId === current.partId) {
          delete next[current.fromZoneId];
        }
        if (!zoneId) return next;
        const existing = next[zoneId];
        if (existing?.correct) return next;
        if (existing && !existing.correct) delete next[zoneId];
        next[zoneId] = {
          partId: current.partId,
          correct: current.partId === zoneId,
        };
        return next;
      });

      if (!zoneId) return;
      const locked = placements[zoneId]?.correct;
      if (locked) return;
      const ok = current.partId === zoneId;
      onScore(ok ? 1 : -1);
      setFlash(ok ? "ok" : "ko");
      window.setTimeout(() => setFlash(null), 400);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, onScore, placements]);

  const correctCount = Object.values(placements).filter((p) => p.correct).length;

  return (
    <div className={`animal-label ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      <div className="animal-bank">
        <h3>
          Paraules · {correctCount}/{parts.length}
        </h3>
        <div className="animal-bank-chips">
          {bankParts.map((p) => (
            <button
              key={p.id}
              type="button"
              className="word-chip"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => startDrag(e, p.id, p.label, null)}
            >
              {p.label}
            </button>
          ))}
          {bankParts.length === 0 && correctCount === parts.length && (
            <p className="animal-empty">Insecte etiquetat! 🎉</p>
          )}
        </div>
      </div>

      <div className="insect-board">
        <InsectDiagram />
        {parts.map((part) => {
          const placement = placements[part.id];
          const placed = placement ? partsById.get(placement.partId) : null;
          const hiding =
            !!drag &&
            drag.fromZoneId === part.id &&
            drag.partId === placement?.partId;

          return (
            <div
              key={part.id}
              data-zone-id={part.id}
              className={`drop-zone insect-zone ${placement ? (placement.correct ? "correct" : "wrong") : "empty"}`}
              style={{
                left: `${part.left}%`,
                top: `${part.top}%`,
                width: `${part.width}%`,
                height: `${part.height}%`,
              }}
            >
              {placed && !hiding && (
                <button
                  type="button"
                  className="zone-chip"
                  style={{ touchAction: "none" }}
                  disabled={placement?.correct}
                  onPointerDown={(e) => {
                    if (placement?.correct) return;
                    startDrag(e, placed.id, placed.label, part.id);
                  }}
                >
                  {placed.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {drag && (
        <div
          className="drag-ghost"
          style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
        >
          {drag.label}
        </div>
      )}
    </div>
  );
}
