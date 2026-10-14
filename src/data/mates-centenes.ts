/** Tema 1 de Matemàtiques: passar de centena en sumes i restes. */

export type MathChapterId =
  | "comptaquilometres"
  | "fins-centena"
  | "sumes"
  | "restes"
  | "repte";

export type MathChapter = {
  id: MathChapterId;
  title: string;
  blurb: string;
};

export const MATH_CHAPTERS: MathChapter[] = [
  {
    id: "comptaquilometres",
    title: "Comptaquilòmetres",
    blurb: "Mou els números i mira com passen de 99 a 100, de 199 a 200…",
  },
  {
    id: "fins-centena",
    title: "Fins a la centena",
    blurb: "Quants falten per arribar a la propera centena?",
  },
  {
    id: "sumes",
    title: "Sumes amb salt",
    blurb: "Primer arribem a la centena, després sumem la resta.",
  },
  {
    id: "restes",
    title: "Restes amb salt",
    blurb: "Primer baixem a la centena, després restem la resta.",
  },
  {
    id: "repte",
    title: "Repte final",
    blurb: "Sumes i restes barrejades. Tu pots!",
  },
];

export const ODOMETER_MISSIONS = [
  { id: "m1", start: 97, target: 100, title: "Puja de 97 a 100" },
  { id: "m2", start: 98, target: 100, title: "Puja de 98 a 100" },
  { id: "m3", start: 195, target: 200, title: "Puja de 195 a 200" },
  { id: "m4", start: 199, target: 200, title: "Puja de 199 a 200" },
  { id: "m5", start: 298, target: 300, title: "Puja de 298 a 300" },
  { id: "m6", start: 103, target: 100, title: "Baixa de 103 a 100" },
  { id: "m7", start: 205, target: 200, title: "Baixa de 205 a 200" },
  { id: "m8", start: 310, target: 300, title: "Baixa de 310 a 300" },
];

export type ReachExercise = {
  kind: "reach";
  id: string;
  from: number;
  target: number;
  answer: number;
  options: number[];
};

export type BridgeAddExercise = {
  kind: "bridge-add";
  id: string;
  a: number;
  b: number;
  toHundred: number;
  rest: number;
  result: number;
  step1Options: number[];
  step2Options: number[];
};

export type BridgeSubExercise = {
  kind: "bridge-sub";
  id: string;
  a: number;
  b: number;
  toHundred: number;
  rest: number;
  hundred: number;
  result: number;
  step1Options: number[];
  step2Options: number[];
};

export type ChallengeExercise = {
  kind: "challenge";
  id: string;
  op: "add" | "sub";
  a: number;
  b: number;
  result: number;
  options: number[];
  hint: string;
};

export type MathExercise =
  | ReachExercise
  | BridgeAddExercise
  | BridgeSubExercise
  | ChallengeExercise;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function uniqueOptions(correct: number, distractors: number[]): number[] {
  const extras: number[] = [];
  for (const n of distractors) {
    if (n > 0 && n !== correct && !extras.includes(n)) extras.push(n);
    if (extras.length >= 3) break;
  }
  const fallbacks = [
    correct + 5,
    correct + 10,
    Math.max(1, correct - 5),
    Math.max(1, correct - 10),
    correct + 15,
    Math.max(1, correct - 15),
    correct + 20,
    10,
    20,
    50,
  ];
  for (const n of fallbacks) {
    if (extras.length >= 3) break;
    if (n > 0 && n !== correct && !extras.includes(n)) extras.push(n);
  }
  return shuffle([correct, ...extras.slice(0, 3)]);
}

export function nextHundred(n: number) {
  if (n % 100 === 0) return n + 100;
  return Math.ceil(n / 100) * 100;
}

export function prevHundred(n: number) {
  if (n % 100 === 0) return n - 100;
  return Math.floor(n / 100) * 100;
}

function makeReach(from: number): ReachExercise {
  const target = nextHundred(from);
  const answer = target - from;
  return {
    kind: "reach",
    id: `reach-${from}`,
    from,
    target,
    answer,
    options: uniqueOptions(answer, [answer + 10, answer - 5, 100 - (from % 100 || 100), 5, 20, 50]),
  };
}

function makeBridgeAdd(a: number, b: number): BridgeAddExercise {
  const hundred = nextHundred(a);
  const toHundred = hundred - a;
  const rest = b - toHundred;
  const result = a + b;
  return {
    kind: "bridge-add",
    id: `add-${a}-${b}`,
    a,
    b,
    toHundred,
    rest,
    result,
    step1Options: uniqueOptions(toHundred, [b, rest, toHundred + 5, 10, 20]),
    step2Options: uniqueOptions(result, [hundred, a + b - 10, hundred + b, result + 10]),
  };
}

function makeBridgeSub(a: number, b: number): BridgeSubExercise {
  const hundred = prevHundred(a);
  const toHundred = a - hundred;
  const rest = b - toHundred;
  const result = a - b;
  return {
    kind: "bridge-sub",
    id: `sub-${a}-${b}`,
    a,
    b,
    toHundred,
    rest,
    hundred,
    result,
    step1Options: uniqueOptions(toHundred, [b, rest, toHundred + 5, 10, 20]),
    step2Options: uniqueOptions(result, [hundred, a - b + 10, hundred - b, result - 10]),
  };
}

function makeChallenge(op: "add" | "sub", a: number, b: number): ChallengeExercise {
  const result = op === "add" ? a + b : a - b;
  const hundred = op === "add" ? nextHundred(a) : prevHundred(a);
  return {
    kind: "challenge",
    id: `chal-${op}-${a}-${b}`,
    op,
    a,
    b,
    result,
    options: uniqueOptions(result, [hundred, result + 10, result - 10, a + (op === "add" ? b - 10 : -(b - 10))]),
    hint:
      op === "add"
        ? `Recorda: primer suma fins a ${hundred}, després la resta.`
        : `Recorda: primer resta fins a ${hundred}, després la resta.`,
  };
}

export const EXERCISES: Record<MathChapterId, MathExercise[]> = {
  comptaquilometres: [],
  "fins-centena": [
    makeReach(90),
    makeReach(80),
    makeReach(70),
    makeReach(95),
    makeReach(60),
    makeReach(270),
    makeReach(250),
    makeReach(185),
    makeReach(340),
    makeReach(410),
  ],
  sumes: [
    makeBridgeAdd(90, 15),
    makeBridgeAdd(80, 25),
    makeBridgeAdd(95, 10),
    makeBridgeAdd(70, 40),
    makeBridgeAdd(85, 20),
    makeBridgeAdd(270, 50),
    makeBridgeAdd(250, 60),
    makeBridgeAdd(185, 30),
    makeBridgeAdd(340, 80),
    makeBridgeAdd(190, 25),
  ],
  restes: [
    makeBridgeSub(105, 15),
    makeBridgeSub(120, 35),
    makeBridgeSub(110, 20),
    makeBridgeSub(130, 45),
    makeBridgeSub(215, 30),
    makeBridgeSub(320, 50),
    makeBridgeSub(305, 25),
    makeBridgeSub(410, 60),
    makeBridgeSub(250, 70),
    makeBridgeSub(180, 95),
  ],
  repte: [
    makeChallenge("add", 90, 15),
    makeChallenge("sub", 105, 15),
    makeChallenge("add", 270, 50),
    makeChallenge("sub", 320, 50),
    makeChallenge("add", 85, 25),
    makeChallenge("sub", 215, 40),
    makeChallenge("add", 190, 20),
    makeChallenge("sub", 410, 30),
    makeChallenge("add", 250, 70),
    makeChallenge("sub", 130, 45),
  ],
};
