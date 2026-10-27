"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import LabelBoard from "@/components/animals/LabelBoard";
import SequenceBoard from "@/components/animals/SequenceBoard";
import SortBoard from "@/components/animals/SortBoard";
import {
  ANIMAL_CHAPTERS,
  INSECT_PARTS,
  METAMORFOSI_STEPS,
  SORT_DATA,
  type AnimalChapterId,
  type SortDataMap,
} from "@/data/animals-tema2";

type Props = {
  assignaturaId: string;
  assignaturaTitle: string;
  temaTitle: string;
};

type ChapterProgress = {
  score: number;
};

function emptyProgress(): Record<AnimalChapterId, ChapterProgress> {
  return Object.fromEntries(
    ANIMAL_CHAPTERS.map((c) => [c.id, { score: 0 }]),
  ) as Record<AnimalChapterId, ChapterProgress>;
}

export default function AnimalsTemaGame({
  assignaturaId,
  assignaturaTitle,
  temaTitle,
}: Props) {
  const [activeId, setActiveId] = useState<AnimalChapterId>(ANIMAL_CHAPTERS[0].id);
  const [progress, setProgress] = useState(emptyProgress);
  const [resetKey, setResetKey] = useState(0);

  const chapter = ANIMAL_CHAPTERS.find((c) => c.id === activeId)!;
  const chapterState = progress[activeId];

  const temaScore = useMemo(
    () => Object.values(progress).reduce((s, p) => s + p.score, 0),
    [progress],
  );

  const onScore = useCallback(
    (delta: number) => {
      setProgress((prev) => {
        const cur = prev[activeId];
        return {
          ...prev,
          [activeId]: {
            score: Math.max(0, cur.score + delta),
          },
        };
      });
    },
    [activeId],
  );

  const resetChapter = () => {
    setProgress((prev) => ({
      ...prev,
      [activeId]: { score: 0 },
    }));
    setResetKey((k) => k + 1);
  };

  const switchChapter = (id: AnimalChapterId) => {
    setActiveId(id);
  };

  const renderBoard = () => {
    if (chapter.mode === "sort") {
      const data = SORT_DATA[activeId as keyof SortDataMap];
      return (
        <SortBoard
          key={`${activeId}-${resetKey}`}
          data={data}
          onScore={onScore}
          resetKey={resetKey}
        />
      );
    }
    if (chapter.mode === "label") {
      return (
        <LabelBoard
          key={`label-${resetKey}`}
          parts={INSECT_PARTS}
          onScore={onScore}
          resetKey={resetKey}
        />
      );
    }
    return (
      <SequenceBoard
        key={`seq-${resetKey}`}
        steps={METAMORFOSI_STEPS}
        onScore={onScore}
        resetKey={resetKey}
      />
    );
  };

  return (
    <div className="game-shell math-shell animal-shell">
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
            <strong>{chapterState.score}</strong>
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
              {ANIMAL_CHAPTERS.map((c, index) => (
                <button
                  key={c.id}
                  type="button"
                  className={`chapter-btn ${c.id === activeId ? "active" : ""}`}
                  onClick={() => switchChapter(c.id)}
                >
                  <span className="chapter-num">{index + 1}</span>
                  <span className="chapter-meta">
                    <strong>{c.title}</strong>
                    <small>{progress[c.id].score} pts</small>
                  </span>
                </button>
              ))}
            </nav>
          </section>

          <section className="bank-section">
            <div className="bank-header">
              <h2>Com jugar</h2>
            </div>
            <p className="math-tip">{chapter.blurb}</p>
          </section>

          <button type="button" className="reset-btn" onClick={resetChapter}>
            Reinicia el capítol
          </button>
        </aside>

        <main className="board-wrap math-board animal-board">{renderBoard()}</main>
      </div>
    </div>
  );
}
