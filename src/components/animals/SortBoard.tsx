"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DragGhost from "@/components/animals/DragGhost";
import type { SortChapterData, SortItem } from "@/data/animals-tema2";
import { usePointerDrag } from "@/hooks/usePointerDrag";

type Placement = {
  itemId: string;
  correct: boolean;
};

type DragPayload = {
  itemId: string;
  fromGroupId: string | null;
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
  const [quizDone, setQuizDone] = useState(false);
  const [quizMsg, setQuizMsg] = useState<string | null>(null);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);

  const itemsById = useMemo(() => {
    const m = new Map<string, SortItem>();
    for (const it of data.items) m.set(it.id, it);
    return m;
  }, [data.items]);

  useEffect(() => {
    setBankOrder(shuffle(data.items.map((i) => i.id)));
    setPlacements({});
    setQuizDone(false);
    setQuizMsg(null);
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

  const handleDrop = useCallback(
    (payload: DragPayload, clientX: number, clientY: number) => {
      const item = itemsById.get(payload.itemId);
      if (!item) return;

      const el = document.elementFromPoint(clientX, clientY);
      const zone = el?.closest("[data-group-id]") as HTMLElement | null;
      const groupId = zone?.dataset.groupId ?? null;

      setPlacements((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key].itemId === payload.itemId) delete next[key];
        }
        if (!groupId) return next;
        const key = `${groupId}::${item.id}`;
        next[key] = { itemId: item.id, correct: item.groupId === groupId };
        return next;
      });

      if (!groupId) return;
      const isCorrect = item.groupId === groupId;
      onScore(isCorrect ? 1 : -1);
      setFlash(isCorrect ? "ok" : "ko");
      window.setTimeout(() => setFlash(null), 400);
    },
    [itemsById, onScore],
  );

  const { drag, startDrag } = usePointerDrag<DragPayload>(handleDrop);

  const itemsInGroup = (groupId: string) =>
    Object.entries(placements)
      .filter(([key]) => key.startsWith(`${groupId}::`))
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

  const draggedItem = drag ? itemsById.get(drag.payload.itemId) : null;

  return (
    <div className={`animal-sort ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      <div className="animal-bank">
        <h3>Animals</h3>
        <div className="animal-bank-chips">
          {bankItems.map((item) => {
            const isDragging = drag?.payload.itemId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`animal-chip ${isDragging ? "dragging-source" : ""}`}
                style={{ touchAction: "none" }}
                onPointerDown={(e) =>
                  startDrag(e, { itemId: item.id, fromGroupId: null })
                }
              >
                <span className="animal-emoji">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          {bankItems.length === 0 && (
            <p className="animal-empty">
              {sortingComplete ? "Tots classificats! 🎉" : "Continua…"}
            </p>
          )}
        </div>
      </div>

      <div className="animal-groups">
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
                const isDragging = drag?.payload.itemId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`animal-chip in-group ${correct ? "correct" : "wrong"} ${isDragging ? "dragging-source" : ""}`}
                    style={{ touchAction: "none" }}
                    disabled={correct}
                    onPointerDown={(e) => {
                      if (correct) return;
                      startDrag(e, { itemId: item.id, fromGroupId: g.id });
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
        <DragGhost x={drag.x} y={drag.y}>
          <span className="animal-emoji">{draggedItem.emoji}</span>
          <span>{draggedItem.label}</span>
        </DragGhost>
      )}
    </div>
  );
}
