"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BodyPart, Chapter } from "@/data/temes";

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

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type ChapterState = {
  placements: Record<string, Placement>;
  score: number;
  bankOrder: string[];
};

function createChapterState(chapter: Chapter): ChapterState {
  return {
    placements: {},
    score: 0,
    bankOrder: shuffle(chapter.parts.map((p) => p.id)),
  };
}

type Props = {
  chapters: Chapter[];
  temaTitle: string;
  assignaturaId: string;
  assignaturaTitle: string;
};

export default function TemaGame({
  chapters,
  temaTitle,
  assignaturaId,
  assignaturaTitle,
}: Props) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [states, setStates] = useState<Record<string, ChapterState>>(() =>
    Object.fromEntries(chapters.map((c) => [c.id, createChapterState(c)])),
  );
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const chapterIdRef = useRef(activeId);
  const statesRef = useRef(states);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    chapterIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    statesRef.current = states;
  }, [states]);

  const chapter = chapters.find((c) => c.id === activeId) ?? chapters[0];
  const state = states[chapter.id] ?? createChapterState(chapter);

  const partsById = useMemo(() => {
    const map = new Map<string, BodyPart>();
    for (const p of chapter.parts) map.set(p.id, p);
    return map;
  }, [chapter]);

  const temaScore = useMemo(
    () => Object.values(states).reduce((sum, s) => sum + s.score, 0),
    [states],
  );

  const placedPartIds = useMemo(
    () => new Set(Object.values(state.placements).map((p) => p.partId)),
    [state.placements],
  );

  const bankParts = state.bankOrder
    .filter((id) => !placedPartIds.has(id))
    .map((id) => partsById.get(id)!)
    .filter(Boolean);

  const correctCount = Object.values(state.placements).filter((p) => p.correct).length;
  const totalParts = chapter.parts.length;

  const applyDrop = useCallback((zoneId: string | null) => {
    const current = dragRef.current;
    const chapterId = chapterIdRef.current;
    if (!current) return;

    const ch = statesRef.current[chapterId];
    if (!ch) return;

    const nextPlacements = { ...ch.placements };

    if (current.fromZoneId && nextPlacements[current.fromZoneId]?.partId === current.partId) {
      delete nextPlacements[current.fromZoneId];
    }

    if (!zoneId) {
      setStates((prev) => ({
        ...prev,
        [chapterId]: { ...ch, placements: nextPlacements },
      }));
      return;
    }

    const existing = nextPlacements[zoneId];
    if (existing?.correct) {
      setStates((prev) => ({
        ...prev,
        [chapterId]: { ...ch, placements: nextPlacements },
      }));
      return;
    }

    if (existing && !existing.correct) {
      delete nextPlacements[zoneId];
    }

    const isCorrect = current.partId === zoneId;
    nextPlacements[zoneId] = { partId: current.partId, correct: isCorrect };

    const scoreDelta = isCorrect ? 1 : -1;
    setStates((prev) => {
      const latest = prev[chapterId] ?? ch;
      return {
        ...prev,
        [chapterId]: {
          ...latest,
          placements: nextPlacements,
          score: Math.max(0, latest.score + scoreDelta),
        },
      };
    });

    setFlash(isCorrect ? "ok" : "ko");
    window.setTimeout(() => setFlash(null), 450);
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : null));
    };

    const onUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const zoneEl = el?.closest("[data-zone-id]") as HTMLElement | null;
      const zoneId = zoneEl?.dataset.zoneId ?? null;
      setDrag(null);
      applyDrop(zoneId);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, applyDrop]);

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

  const resetChapter = () => {
    setStates((prev) => ({
      ...prev,
      [chapter.id]: createChapterState(chapter),
    }));
  };

  return (
    <div className="game-shell">
      <header className="game-header">
        <Link
          href={`/assignatura/${assignaturaId}`}
          className="back-link"
          aria-label="Tornar als temes"
        >
          ← Temes
        </Link>
        <div className="header-titles">
          <p className="brand-mini">{assignaturaTitle}</p>
          <h1>{temaTitle}</h1>
        </div>
        <div className="scores">
          <div className="score-pill chapter">
            <span>Capítol</span>
            <strong>{state.score}</strong>
          </div>
          <div className="score-pill tema">
            <span>Tema</span>
            <strong>{temaScore}</strong>
          </div>
        </div>
      </header>

      <div className="game-body">
        <aside className="sidebar">
          <section>
            <h2>Capítols</h2>
            <nav className="chapter-list">
              {chapters.map((c, index) => {
                const done = Object.values(states[c.id]?.placements ?? {}).filter(
                  (p) => p.correct,
                ).length;
                const total = c.parts.length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`chapter-btn ${c.id === chapter.id ? "active" : ""}`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <span className="chapter-num">{index + 1}</span>
                    <span className="chapter-meta">
                      <strong>{c.title}</strong>
                      <small>
                        {done}/{total} · {states[c.id]?.score ?? 0} pts
                      </small>
                    </span>
                  </button>
                );
              })}
            </nav>
          </section>

          <section className="bank-section">
            <div className="bank-header">
              <h2>Paraules</h2>
              <span>
                {correctCount}/{totalParts}
              </span>
            </div>
            <div className="word-bank">
              {bankParts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  className="word-chip"
                  style={{ touchAction: "none" }}
                  onPointerDown={(e) => startDrag(e, part.id, part.label, null)}
                >
                  {part.label}
                </button>
              ))}
              {bankParts.length === 0 && (
                <p className="bank-empty">
                  {correctCount === totalParts
                    ? "Molt bé! Ho has completat 🎉"
                    : "Col·loca les paraules als buits"}
                </p>
              )}
            </div>
          </section>

          <button type="button" className="reset-btn" onClick={resetChapter}>
            Reinicia el capítol
          </button>
        </aside>

        <main className="board-wrap">
          <div
            className={`board ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={chapter.image}
              alt={chapter.title}
              className="board-image"
              draggable={false}
            />
            {chapter.parts.map((part) => {
              const placement = state.placements[part.id];
              const placed = placement ? partsById.get(placement.partId) : null;
              const isDraggingThis =
                !!drag &&
                drag.fromZoneId === part.id &&
                drag.partId === placement?.partId;

              return (
                <div
                  key={part.id}
                  data-zone-id={part.id}
                  className={`drop-zone ${placement ? (placement.correct ? "correct" : "wrong") : "empty"}`}
                  style={{
                    left: `${part.zone.left}%`,
                    top: `${part.zone.top}%`,
                    width: `${part.zone.width}%`,
                    height: `${part.zone.height}%`,
                  }}
                >
                  {placed && !isDraggingThis && (
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
        </main>
      </div>

      {drag && (
        <div
          className="drag-ghost"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
          }}
        >
          {drag.label}
        </div>
      )}
    </div>
  );
}
