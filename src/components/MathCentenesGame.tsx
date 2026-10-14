"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OdometerView from "@/components/OdometerView";
import {
  EXERCISES,
  MATH_CHAPTERS,
  ODOMETER_MISSIONS,
  type BridgeAddExercise,
  type BridgeSubExercise,
  type ChallengeExercise,
  type MathChapterId,
  type MathExercise,
  type ReachExercise,
} from "@/data/mates-centenes";

type Props = {
  assignaturaId: string;
  assignaturaTitle: string;
  temaTitle: string;
};

type ChapterProgress = {
  index: number;
  score: number;
  done: number;
};

function emptyProgress(): Record<MathChapterId, ChapterProgress> {
  return {
    comptaquilometres: { index: 0, score: 0, done: 0 },
    "fins-centena": { index: 0, score: 0, done: 0 },
    sumes: { index: 0, score: 0, done: 0 },
    restes: { index: 0, score: 0, done: 0 },
    repte: { index: 0, score: 0, done: 0 },
  };
}

function OptionButtons({
  options,
  disabled,
  onPick,
  flash,
}: {
  options: number[];
  disabled?: boolean;
  onPick: (n: number) => void;
  flash: "ok" | "ko" | null;
}) {
  return (
    <div className={`math-options ${flash === "ok" ? "flash-ok" : ""} ${flash === "ko" ? "flash-ko" : ""}`}>
      {options.map((n) => (
        <button
          key={n}
          type="button"
          className="math-option"
          disabled={disabled}
          onClick={() => onPick(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function NumberRoad({
  points,
  highlight,
}: {
  points: number[];
  highlight?: number;
}) {
  return (
    <div className="math-road" aria-hidden>
      {points.map((p, i) => (
        <div key={`${p}-${i}`} className="math-road-item">
          <span className={`math-road-num ${highlight === p ? "active" : ""}`}>{p}</span>
          {i < points.length - 1 && <span className="math-road-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}

export default function MathCentenesGame({
  assignaturaId,
  assignaturaTitle,
  temaTitle,
}: Props) {
  const [activeId, setActiveId] = useState<MathChapterId>("comptaquilometres");
  const [progress, setProgress] = useState(emptyProgress);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [flash, setFlash] = useState<"ok" | "ko" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isOdometer = activeId === "comptaquilometres";
  const chapter = MATH_CHAPTERS.find((c) => c.id === activeId)!;
  const exercises = EXERCISES[activeId];
  const chapterState = progress[activeId];
  const exercise: MathExercise | undefined = exercises[chapterState.index];
  const finished = isOdometer
    ? chapterState.index >= ODOMETER_MISSIONS.length
    : chapterState.index >= exercises.length;

  const temaScore = useMemo(
    () => Object.values(progress).reduce((s, p) => s + p.score, 0),
    [progress],
  );

  const bump = (correct: boolean) => {
    setProgress((prev) => {
      const cur = prev[activeId];
      return {
        ...prev,
        [activeId]: {
          ...cur,
          score: Math.max(0, cur.score + (correct ? 1 : -1)),
        },
      };
    });
    setFlash(correct ? "ok" : "ko");
    window.setTimeout(() => setFlash(null), 450);
  };

  const advanceExercise = () => {
    setProgress((prev) => {
      const cur = prev[activeId];
      return {
        ...prev,
        [activeId]: {
          ...cur,
          index: cur.index + 1,
          done: cur.done + 1,
        },
      };
    });
    setStep(1);
    setShowHint(false);
    setMessage(null);
  };

  const switchChapter = (id: MathChapterId) => {
    setActiveId(id);
    setStep(1);
    setShowHint(false);
    setMessage(null);
    setFlash(null);
  };

  const resetChapter = () => {
    setProgress((prev) => ({
      ...prev,
      [activeId]: { index: 0, score: 0, done: 0 },
    }));
    setStep(1);
    setShowHint(false);
    setMessage(null);
  };

  const handleReach = (ex: ReachExercise, pick: number) => {
    const ok = pick === ex.answer;
    bump(ok);
    if (ok) {
      setMessage(`Genial! ${ex.from} + ${ex.answer} = ${ex.target}`);
      window.setTimeout(advanceExercise, 900);
    } else {
      setMessage("Quasi! Mira quants falten per a la centena.");
    }
  };

  const handleBridgeAdd = (ex: BridgeAddExercise, pick: number) => {
    if (step === 1) {
      const ok = pick === ex.toHundred;
      bump(ok);
      if (ok) {
        setMessage(`Bé! ${ex.a} + ${ex.toHundred} = ${ex.a + ex.toHundred}. Ara la resta.`);
        setStep(2);
      } else {
        setMessage(`Pensa: de ${ex.a} a ${ex.a + ex.toHundred}, quants falten?`);
      }
      return;
    }
    const ok = pick === ex.result;
    bump(ok);
    if (ok) {
      setMessage(`Fantàstic! ${ex.a} + ${ex.b} = ${ex.result}`);
      window.setTimeout(advanceExercise, 900);
    } else {
      setMessage(`Ara suma el que queda: ${ex.a + ex.toHundred} + ${ex.rest}`);
    }
  };

  const handleBridgeSub = (ex: BridgeSubExercise, pick: number) => {
    if (step === 1) {
      const ok = pick === ex.toHundred;
      bump(ok);
      if (ok) {
        setMessage(`Bé! ${ex.a} − ${ex.toHundred} = ${ex.hundred}. Ara la resta.`);
        setStep(2);
      } else {
        setMessage(`Pensa: de ${ex.a} baixem a ${ex.hundred}. Quants restem?`);
      }
      return;
    }
    const ok = pick === ex.result;
    bump(ok);
    if (ok) {
      setMessage(`Fantàstic! ${ex.a} − ${ex.b} = ${ex.result}`);
      window.setTimeout(advanceExercise, 900);
    } else {
      setMessage(`Ara resta el que queda: ${ex.hundred} − ${ex.rest}`);
    }
  };

  const handleChallenge = (ex: ChallengeExercise, pick: number) => {
    const ok = pick === ex.result;
    bump(ok);
    if (ok) {
      const sign = ex.op === "add" ? "+" : "−";
      setMessage(`Molt bé! ${ex.a} ${sign} ${ex.b} = ${ex.result}`);
      window.setTimeout(advanceExercise, 900);
    } else {
      setShowHint(true);
      setMessage("Torna-ho a provar. Usa el truc de la centena.");
    }
  };

  const renderExercise = () => {
    if (isOdometer) {
      return (
        <OdometerView
          missions={ODOMETER_MISSIONS}
          missionIndex={chapterState.index}
          onScore={bump}
          onMissionDone={advanceExercise}
        />
      );
    }

    if (!exercise || finished) {
      return (
        <div className="math-done">
          <h2>Capítol completat! 🎉</h2>
          <p>
            Has fet {chapterState.done} exercicis · {chapterState.score} punts en aquest
            capítol.
          </p>
          <button type="button" className="math-primary" onClick={resetChapter}>
            Tornar a jugar
          </button>
        </div>
      );
    }

    if (exercise.kind === "reach") {
      return (
        <div className="math-card">
          <p className="math-step-label">Pas únic</p>
          <h2>
            De <strong>{exercise.from}</strong>, quants falten per a{" "}
            <strong>{exercise.target}</strong>?
          </h2>
          <NumberRoad points={[exercise.from, exercise.target]} highlight={exercise.target} />
          <OptionButtons
            options={exercise.options}
            onPick={(n) => handleReach(exercise, n)}
            flash={flash}
          />
        </div>
      );
    }

    if (exercise.kind === "bridge-add") {
      return (
        <div className="math-card">
          <p className="math-problem">
            {exercise.a} + {exercise.b} = ?
          </p>
          <NumberRoad
            points={
              step === 1
                ? [exercise.a, exercise.a + exercise.toHundred]
                : [exercise.a, exercise.a + exercise.toHundred, exercise.result]
            }
            highlight={
              step === 1 ? exercise.a + exercise.toHundred : exercise.result
            }
          />
          {step === 1 ? (
            <>
              <p className="math-step-label">Pas 1 de 2</p>
              <h2>
                Primer arribem a la centena. Quants sumem a {exercise.a} per arribar a{" "}
                {exercise.a + exercise.toHundred}?
              </h2>
              <OptionButtons
                options={exercise.step1Options}
                onPick={(n) => handleBridgeAdd(exercise, n)}
                flash={flash}
              />
            </>
          ) : (
            <>
              <p className="math-step-label">Pas 2 de 2</p>
              <h2>
                Ens queden <strong>{exercise.rest}</strong>. Quant és{" "}
                {exercise.a + exercise.toHundred} + {exercise.rest}?
              </h2>
              <OptionButtons
                options={exercise.step2Options}
                onPick={(n) => handleBridgeAdd(exercise, n)}
                flash={flash}
              />
            </>
          )}
        </div>
      );
    }

    if (exercise.kind === "bridge-sub") {
      return (
        <div className="math-card">
          <p className="math-problem">
            {exercise.a} − {exercise.b} = ?
          </p>
          <NumberRoad
            points={
              step === 1
                ? [exercise.a, exercise.hundred]
                : [exercise.a, exercise.hundred, exercise.result]
            }
            highlight={step === 1 ? exercise.hundred : exercise.result}
          />
          {step === 1 ? (
            <>
              <p className="math-step-label">Pas 1 de 2</p>
              <h2>
                Primer baixem a la centena. Quants restem de {exercise.a} per arribar a{" "}
                {exercise.hundred}?
              </h2>
              <OptionButtons
                options={exercise.step1Options}
                onPick={(n) => handleBridgeSub(exercise, n)}
                flash={flash}
              />
            </>
          ) : (
            <>
              <p className="math-step-label">Pas 2 de 2</p>
              <h2>
                Ens queden <strong>{exercise.rest}</strong>. Quant és {exercise.hundred} −{" "}
                {exercise.rest}?
              </h2>
              <OptionButtons
                options={exercise.step2Options}
                onPick={(n) => handleBridgeSub(exercise, n)}
                flash={flash}
              />
            </>
          )}
        </div>
      );
    }

    // challenge
    return (
      <div className="math-card">
        <p className="math-step-label">Repte</p>
        <p className="math-problem">
          {exercise.a} {exercise.op === "add" ? "+" : "−"} {exercise.b} = ?
        </p>
        <NumberRoad
          points={
            exercise.op === "add"
              ? [exercise.a, exercise.result]
              : [exercise.a, exercise.result]
          }
        />
        {showHint && <p className="math-hint">{exercise.hint}</p>}
        <OptionButtons
          options={exercise.options}
          onPick={(n) => handleChallenge(exercise, n)}
          flash={flash}
        />
      </div>
    );
  };

  return (
    <div className="game-shell math-shell">
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
              {MATH_CHAPTERS.map((c, index) => {
                const p = progress[c.id];
                const total =
                  c.id === "comptaquilometres"
                    ? ODOMETER_MISSIONS.length
                    : EXERCISES[c.id].length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`chapter-btn ${c.id === activeId ? "active" : ""}`}
                    onClick={() => switchChapter(c.id)}
                  >
                    <span className="chapter-num">{index + 1}</span>
                    <span className="chapter-meta">
                      <strong>{c.title}</strong>
                      <small>
                        {Math.min(p.done, total)}/{total} · {p.score} pts
                      </small>
                    </span>
                  </button>
                );
              })}
            </nav>
          </section>

          <section className="bank-section">
            <div className="bank-header">
              <h2>Truc</h2>
            </div>
            <p className="math-tip">{chapter.blurb}</p>
            {!finished && !isOdometer && exercise && (
              <p className="math-progress">
                Exercici {chapterState.index + 1} de {exercises.length}
              </p>
            )}
            {isOdometer && !finished && (
              <p className="math-progress">
                Missió {chapterState.index + 1} de {ODOMETER_MISSIONS.length}
              </p>
            )}
          </section>

          <button type="button" className="reset-btn" onClick={resetChapter}>
            Reinicia el capítol
          </button>
        </aside>

        <main className="board-wrap math-board">
          {renderExercise()}
          {message && !isOdometer && <p className="math-message">{message}</p>}
        </main>
      </div>
    </div>
  );
}
