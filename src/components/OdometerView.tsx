"use client";

import { useEffect, useRef, useState } from "react";

export type OdometerMission = {
  id: string;
  start: number;
  target: number;
  title: string;
};

type Props = {
  missions: OdometerMission[];
  missionIndex: number;
  onMissionDone: () => void;
  onScore: (correct: boolean) => void;
};

function DigitWheel({ value, pulse }: { value: number; pulse: boolean }) {
  return (
    <div className={`odo-wheel ${pulse ? "pulse" : ""}`}>
      <span key={value} className="odo-digit">
        {value}
      </span>
    </div>
  );
}

function splitDigits(n: number) {
  const clamped = Math.max(0, Math.min(999, n));
  return {
    c: Math.floor(clamped / 100),
    d: Math.floor((clamped % 100) / 10),
    u: clamped % 10,
  };
}

export default function OdometerView({
  missions,
  missionIndex,
  onMissionDone,
  onScore,
}: Props) {
  const mission = missions[missionIndex];
  const finished = missionIndex >= missions.length;
  const [value, setValue] = useState(mission?.start ?? 0);
  const [pulse, setPulse] = useState({ c: false, d: false, u: false });
  const [crossed, setCrossed] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (!mission) return;
    setValue(mission.start);
    prevRef.current = mission.start;
    setCrossed(false);
    setMsg(`Missió: arriba a ${mission.target}`);
    setPulse({ c: false, d: false, u: false });
  }, [mission]);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    const a = splitDigits(prev);
    const b = splitDigits(value);
    setPulse({
      c: a.c !== b.c,
      d: a.d !== b.d,
      u: a.u !== b.u,
    });
    const crossedUp = Math.floor(prev / 100) !== Math.floor(value / 100) && value > prev;
    const crossedDown = Math.floor(prev / 100) !== Math.floor(value / 100) && value < prev;
    if (crossedUp || crossedDown) {
      setCrossed(true);
      setMsg(
        crossedUp
          ? `Has passat de centena! ${prev} → ${value}`
          : `Has baixat de centena! ${prev} → ${value}`,
      );
    }
    prevRef.current = value;
    const t = window.setTimeout(() => setPulse({ c: false, d: false, u: false }), 500);
    const t2 = window.setTimeout(() => setCrossed(false), 1200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [value]);

  const digits = splitDigits(value);

  const nudge = (delta: number) => {
    if (finished || !mission) return;
    setValue((v) => Math.max(0, Math.min(999, v + delta)));
  };

  const checkMission = () => {
    if (!mission) return;
    if (value === mission.target) {
      onScore(true);
      setMsg(`Genial! Has arribat a ${mission.target}`);
      window.setTimeout(onMissionDone, 900);
    } else {
      onScore(false);
      setMsg(`Encara no. Necessites ${mission.target}. Ara tens ${value}.`);
    }
  };

  if (finished) {
    return (
      <div className="math-done">
        <h2>Comptaquilòmetres completat! 🎉</h2>
        <p>Has vist com es passa de centena moltes vegades.</p>
      </div>
    );
  }

  return (
    <div className="math-card odo-card">
      <p className="math-step-label">
        Missió {missionIndex + 1} de {missions.length}
      </p>
      <h2>{mission.title}</h2>

      <div className={`odo-frame ${crossed ? "crossed" : ""}`}>
        <div className="odo-labels">
          <span>centenes</span>
          <span>desenes</span>
          <span>unitats</span>
        </div>
        <div className="odo-wheels">
          <DigitWheel value={digits.c} pulse={pulse.c} />
          <DigitWheel value={digits.d} pulse={pulse.d} />
          <DigitWheel value={digits.u} pulse={pulse.u} />
        </div>
        <p className="odo-value">{value}</p>
      </div>

      <div className="odo-controls">
        <button type="button" className="odo-btn down" onClick={() => nudge(-10)}>
          −10
        </button>
        <button type="button" className="odo-btn down" onClick={() => nudge(-1)}>
          −1
        </button>
        <button type="button" className="odo-btn up" onClick={() => nudge(1)}>
          +1
        </button>
        <button type="button" className="odo-btn up" onClick={() => nudge(10)}>
          +10
        </button>
      </div>

      <button type="button" className="math-primary" onClick={checkMission}>
        Ja hi soc!
      </button>

      {msg && <p className="math-message odo-msg">{msg}</p>}
    </div>
  );
}
