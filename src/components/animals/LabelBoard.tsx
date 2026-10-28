"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DragGhost from "@/components/animals/DragGhost";
import type { LabelPart } from "@/data/animals-tema2";
import { usePointerDrag } from "@/hooks/usePointerDrag";

type Placement = {
  partId: string;
  correct: boolean;
};

type DragPayload = {
  partId: string;
  label: string;
  fromZoneId: string | null;
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
      <ellipse cx="200" cy="70" rx="70" ry="36" fill="#b8e4ff" stroke="#3aa0e8" strokeWidth="3" />
      <ellipse cx="255" cy="95" rx="55" ry="28" fill="#d4f0ff" stroke="#3aa0e8" strokeWidth="3" />
      <ellipse cx="95" cy="140" rx="38" ry="32" fill="#6ee0b0" stroke="#2f9e62" strokeWidth="3" />
      <ellipse cx="165" cy="140" rx="36" ry="34" fill="#ffe066" stroke="#e6b422" strokeWidth="3" />
      <ellipse cx="250" cy="140" rx="55" ry="30" fill="#ff7a59" stroke="#d64545" strokeWidth="3" />
      <path d="M70 120 Q40 70 55 40" fill="none" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <path d="M90 118 Q100 70 120 42" fill="none" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <circle cx="55" cy="40" r="6" fill="#243447" />
      <circle cx="120" cy="42" r="6" fill="#243447" />
      <path d="M145 170 L120 230" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <path d="M165 172 L165 235" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <path d="M185 170 L210 230" stroke="#243447" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="132" r="7" fill="#243447" />
    </svg>
  );
}

export default function LabelBoard({ parts, onScore, resetKey }: Props) {
  const [bankOrder, setBankOrder] = useState(() => shuffle(parts.map((p) => p.id)));
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);
  const placementsRef = useRef(placements);

  const partsById = useMemo(() => {
    const m = new Map<string, LabelPart>();
    for (const p of parts) m.set(p.id, p);
    return m;
  }, [parts]);

  useEffect(() => {
    placementsRef.current = placements;
  }, [placements]);

  useEffect(() => {
    setBankOrder(shuffle(parts.map((p) => p.id)));
    setPlacements({});
  }, [parts, resetKey]);

  const placedIds = useMemo(
    () => new Set(Object.values(placements).map((p) => p.partId)),
    [placements],
  );

  const bankParts = bankOrder
    .filter((id) => !placedIds.has(id))
    .map((id) => partsById.get(id)!)
    .filter(Boolean);

  const handleDrop = useCallback(
    (payload: DragPayload, clientX: number, clientY: number) => {
      const el = document.elementFromPoint(clientX, clientY);
      const zoneEl = el?.closest("[data-zone-id]") as HTMLElement | null;
      const zoneId = zoneEl?.dataset.zoneId ?? null;

      if (!zoneId) {
        setPlacements((prev) => {
          const next = { ...prev };
          if (payload.fromZoneId && next[payload.fromZoneId]?.partId === payload.partId) {
            delete next[payload.fromZoneId];
          }
          return next;
        });
        return;
      }

      if (placementsRef.current[zoneId]?.correct) return;

      const ok = payload.partId === zoneId;
      setPlacements((prev) => {
        const next = { ...prev };
        if (payload.fromZoneId && next[payload.fromZoneId]?.partId === payload.partId) {
          delete next[payload.fromZoneId];
        }
        if (next[zoneId] && !next[zoneId].correct) delete next[zoneId];
        next[zoneId] = { partId: payload.partId, correct: ok };
        return next;
      });
      onScore(ok ? 1 : -1);
      setFlash(ok ? "ok" : "ko");
      window.setTimeout(() => setFlash(null), 400);
    },
    [onScore],
  );

  const { drag, startDrag } = usePointerDrag<DragPayload>(handleDrop);

  const correctCount = Object.values(placements).filter((p) => p.correct).length;

  return (
    <div className={`animal-label ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      <div className="animal-bank">
        <h3>
          Paraules · {correctCount}/{parts.length}
        </h3>
        <div className="animal-bank-chips">
          {bankParts.map((p) => {
            const isDragging = drag?.payload.partId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`word-chip ${isDragging ? "dragging-source" : ""}`}
                style={{ touchAction: "none" }}
                onPointerDown={(e) =>
                  startDrag(e, { partId: p.id, label: p.label, fromZoneId: null })
                }
              >
                {p.label}
              </button>
            );
          })}
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
          const isDragging =
            !!drag &&
            drag.payload.fromZoneId === part.id &&
            drag.payload.partId === placement?.partId;

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
              {placed && !isDragging && (
                <button
                  type="button"
                  className="zone-chip"
                  style={{ touchAction: "none" }}
                  disabled={placement?.correct}
                  onPointerDown={(e) => {
                    if (placement?.correct) return;
                    startDrag(e, {
                      partId: placed.id,
                      label: placed.label,
                      fromZoneId: part.id,
                    });
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
        <DragGhost x={drag.x} y={drag.y} className="word-ghost">
          {drag.payload.label}
        </DragGhost>
      )}
    </div>
  );
}
