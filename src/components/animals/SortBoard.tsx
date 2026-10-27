"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SortChapterData, SortItem } from "@/data/animals-tema2";

type Placement = {
  itemId: string;
  correct: boolean;
};

type DragState = {
  itemId: string;
  fromGroupId: string | null;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  data: SortChapterData;
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

export default function SortBoard({ data, onScore, resetKey }: Props) {
  const [bankOrder, setBankOrder] = useState(() => shuffle(data.items.map((i) => i.id)));
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [drag, setDrag] = useState<DragState | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [quizMsg, setQuizMsg] = useState<string | null>(null);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const placementsRef = useRef(placements);
  const itemsById = useMemo(() => {
    const m = new Map<string, SortItem>();
    for (const it of data.items) m.set(it.id, it);
    return m;
  }, [data.items]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    placementsRef.current = placements;
  }, [placements]);

  useEffect(() => {
    setBankOrder(shuffle(data.items.map((i) => i.id)));
    setPlacements({});
    setQuizDone(false);
    setQuizMsg(null);
    setDrag(null);
  }, [data, resetKey]);

  const placedIds = useMemo(
    () => new Set(Object.values(placements).map((p) => p.itemId)),
    [placements],
  );

  const bankItems = bankOrder
    .filter((id) => !placedIds.has(id))
    .map((id) => itemsById.get(id)!)
    .filter(Boolean);

  const correctCount = Object.values(placements).filter((p) => p.correct).length;
  const sortingComplete = correctCount === data.items.length;

  const startDrag = (
    e: React.PointerEvent,
    itemId: string,
    fromGroupId: string | null,
  ) => {
    if (dragRef.current) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const next: DragState = {
      itemId,
      fromGroupId,
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
      const zone = el?.closest("[data-group-id]") as HTMLElement | null;
      const groupId = zone?.dataset.groupId ?? null;

      const item = itemsById.get(current.itemId);
      if (!item) return;

      setPlacements((prev) => {
        const next = { ...prev };
        // remove from previous slot
        for (const key of Object.keys(next)) {
          if (next[key].itemId === current.itemId) delete next[key];
        }

        if (!groupId) return next;

        // if slot occupied by wrong item of same visual card key, replace
        // each item gets unique key per group placement: groupId::itemId
        const key = `${groupId}::${item.id}`;
        // remove any other item incorrectly occupying - we allow multiple per group
        const isCorrect = item.groupId === groupId;
        next[key] = { itemId: item.id, correct: isCorrect };
        return next;
      });

      if (!groupId) return;

      // avoid scoring when dropping on locked correct - already handled by not dragging correct
      const isCorrect = item.groupId === groupId;
      onScore(isCorrect ? 1 : -1);
      setFlash(isCorrect ? "ok" : "ko");
      window.setTimeout(() => setFlash(null), 400);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, itemsById, onScore]);

  const itemsInGroup = (groupId: string) =>
    Object.entries(placements)
      .filter(([key, p]) => key.startsWith(`${groupId}::`))
      .map(([, p]) => ({
        item: itemsById.get(p.itemId)!,
        correct: p.correct,
      }))
      .filter((x) => x.item);

  const answerQuiz = (optionId: string) => {
    if (!data.bonusQuiz || quizDone) return;
    const ok = optionId === data.bonusQuiz.answerId;
    onScore(ok ? 1 : -1);
    setQuizDone(true);
    setQuizMsg(ok ? `Correcte! ${data.bonusQuiz.explain}` : data.bonusQuiz.explain);
    setFlash(ok ? "ok" : "ko");
    window.setTimeout(() => setFlash(null), 450);
  };

  const draggedItem = drag ? itemsById.get(drag.itemId) : null;

  return (
    <div className={`animal-sort ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      <div className="animal-bank">
        <h3>Animals</h3>
        <div className="animal-bank-chips">
          {bankItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="animal-chip"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => startDrag(e, item.id, null)}
            >
              <span className="animal-emoji">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
          {bankItems.length === 0 && (
            <p className="animal-empty">
              {sortingComplete ? "Tots classificats! 🎉" : "Continua…"}
            </p>
          )}
        </div>
      </div>

      <div
        className="animal-groups"
        style={{ "--group-count": data.groups.length } as React.CSSProperties}
      >
        {data.groups.map((g) => (
          <div
            key={g.id}
            data-group-id={g.id}
            className="animal-group"
            style={{ borderColor: g.color, background: `${g.color}33` }}
          >
            <h4 style={{ background: g.color }}>{g.label}</h4>
            <div className="animal-group-drop">
              {itemsInGroup(g.id).map(({ item, correct }) => {
                const hiding =
                  drag && drag.itemId === item.id && drag.fromGroupId === g.id;
                if (hiding) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`animal-chip in-group ${correct ? "correct" : "wrong"}`}
                    style={{ touchAction: "none" }}
                    disabled={correct}
                    onPointerDown={(e) => {
                      if (correct) return;
                      startDrag(e, item.id, g.id);
                    }}
                  >
                    <span className="animal-emoji">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {sortingComplete && data.bonusQuiz && (
        <div className="animal-quiz">
          <p className="animal-quiz-q">{data.bonusQuiz.question}</p>
          <div className="animal-quiz-opts">
            {data.bonusQuiz.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="math-primary"
                disabled={quizDone}
                onClick={() => answerQuiz(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {quizMsg && <p className="math-message">{quizMsg}</p>}
        </div>
      )}

      {draggedItem && drag && (
        <div
          className="animal-chip drag-ghost animal-ghost"
          style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
        >
          <span className="animal-emoji">{draggedItem.emoji}</span>
          <span>{draggedItem.label}</span>
        </div>
      )}
    </div>
  );
}
