/** Tema 2 · Els animals — dades dels minijocs. */

export type AnimalChapterId =
  | "alimentacio"
  | "respiracio"
  | "ovipars"
  | "vertebrats"
  | "invertebrats"
  | "molluscos"
  | "insecte"
  | "metamorfosi";

export type AnimalChapter = {
  id: AnimalChapterId;
  title: string;
  blurb: string;
  mode: "sort" | "label" | "sequence";
};

export const ANIMAL_CHAPTERS: AnimalChapter[] = [
  {
    id: "alimentacio",
    title: "Segons l’alimentació",
    blurb: "Arrossega cada animal al seu grup: herbívor, carnívor o omnívor.",
    mode: "sort",
  },
  {
    id: "respiracio",
    title: "Com respiren?",
    blurb: "Pulmons o brànquies? Classifica i després respon la pregunta del dofí.",
    mode: "sort",
  },
  {
    id: "ovipars",
    title: "Ovípars i vivípars",
    blurb: "Uns naixen d’un ou i altres dins de la mare. Classifica’ls!",
    mode: "sort",
  },
  {
    id: "vertebrats",
    title: "Els 5 grups",
    blurb: "Col·loca cada vertebrat al seu grup.",
    mode: "sort",
  },
  {
    id: "invertebrats",
    title: "Els invertebrats",
    blurb: "Sis grups sense columna vertebral. Troba el lloc de cadascun.",
    mode: "sort",
  },
  {
    id: "molluscos",
    title: "Els mol·luscos",
    blurb: "Bivalves, gasteròpodes o cefalòpodes?",
    mode: "sort",
  },
  {
    id: "insecte",
    title: "Parts de l’insecte",
    blurb: "Posa cada etiqueta al lloc correcte del dibuix.",
    mode: "label",
  },
  {
    id: "metamorfosi",
    title: "Metamorfosi",
    blurb: "Ordena les etapes de la papallona de la primera a l’última.",
    mode: "sequence",
  },
];

export type SortGroup = {
  id: string;
  label: string;
  color: string;
};

export type SortItem = {
  id: string;
  label: string;
  emoji: string;
  groupId: string;
};

export type SortChapterData = {
  groups: SortGroup[];
  items: SortItem[];
  /** Pregunta extra al acabar (opcional). */
  bonusQuiz?: {
    question: string;
    options: { id: string; label: string }[];
    answerId: string;
    explain: string;
  };
};

export type LabelPart = {
  id: string;
  label: string;
  /** % sobre el diagrama SVG/container */
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SequenceStep = {
  id: string;
  label: string;
  emoji: string;
  order: number;
};

export type SortDataMap = Record<
  Exclude<AnimalChapterId, "insecte" | "metamorfosi">,
  SortChapterData
>;

export const SORT_DATA: SortDataMap = {
  alimentacio: {
    groups: [
      { id: "herbivor", label: "Herbívors", color: "#7ec8f8" },
      { id: "carnivor", label: "Carnívors", color: "#ff7a59" },
      { id: "omnivor", label: "Omnívors", color: "#6ee0b0" },
    ],
    items: [
      { id: "zebra", label: "Zebra", emoji: "🦓", groupId: "herbivor" },
      { id: "vaca", label: "Vaca", emoji: "🐄", groupId: "herbivor" },
      { id: "conill", label: "Conill", emoji: "🐇", groupId: "herbivor" },
      { id: "aranya", label: "Aranya", emoji: "🕷️", groupId: "carnivor" },
      { id: "lleo", label: "Lleó", emoji: "🦁", groupId: "carnivor" },
      { id: "aguila", label: "Àguila", emoji: "🦅", groupId: "carnivor" },
      { id: "guineu", label: "Guineu", emoji: "🦊", groupId: "omnivor" },
      { id: "os", label: "Ós", emoji: "🐻", groupId: "omnivor" },
      { id: "porc", label: "Porc", emoji: "🐷", groupId: "omnivor" },
    ],
  },
  respiracio: {
    groups: [
      { id: "pulmons", label: "Pulmons", color: "#ffb4a2" },
      { id: "branquies", label: "Brànquies", color: "#7ec8f8" },
    ],
    items: [
      { id: "ratoli", label: "Ratolí", emoji: "🐭", groupId: "pulmons" },
      { id: "gos", label: "Gos", emoji: "🐶", groupId: "pulmons" },
      { id: "ocell", label: "Ocell", emoji: "🐦", groupId: "pulmons" },
      { id: "elefant", label: "Elefant", emoji: "🐘", groupId: "pulmons" },
      { id: "peix", label: "Peix", emoji: "🐟", groupId: "branquies" },
      { id: "tauro", label: "Tauró", emoji: "🦈", groupId: "branquies" },
      { id: "cranc", label: "Cranc", emoji: "🦀", groupId: "branquies" },
    ],
    bonusQuiz: {
      question: "Els dofins viuen a l’aigua. Com respiren?",
      options: [
        { id: "pulmons", label: "Amb pulmons" },
        { id: "branquies", label: "Amb brànquies" },
      ],
      answerId: "pulmons",
      explain: "Els dofins són mamífers: pugen a la superfície a respirar amb pulmons.",
    },
  },
  ovipars: {
    groups: [
      { id: "ovipar", label: "Ovípars", color: "#ffe066" },
      { id: "vivipar", label: "Vivípars", color: "#c9a7ff" },
    ],
    items: [
      { id: "gallina", label: "Gallina", emoji: "🐔", groupId: "ovipar" },
      { id: "tortuga", label: "Tortuga", emoji: "🐢", groupId: "ovipar" },
      { id: "peix-ou", label: "Peix", emoji: "🐠", groupId: "ovipar" },
      { id: "papallona", label: "Papallona", emoji: "🦋", groupId: "ovipar" },
      { id: "elefant-v", label: "Elefant", emoji: "🐘", groupId: "vivipar" },
      { id: "gat", label: "Gat", emoji: "🐱", groupId: "vivipar" },
      { id: "persona", label: "Persona", emoji: "👧", groupId: "vivipar" },
      { id: "gos-v", label: "Gos", emoji: "🐶", groupId: "vivipar" },
    ],
  },
  vertebrats: {
    groups: [
      { id: "peixos", label: "Peixos", color: "#7ec8f8" },
      { id: "amfibis", label: "Amfibis", color: "#6ee0b0" },
      { id: "reptils", label: "Rèptils", color: "#ffe066" },
      { id: "ocells", label: "Ocells", color: "#ffb4a2" },
      { id: "mamifers", label: "Mamífers", color: "#c9a7ff" },
    ],
    items: [
      { id: "truita", label: "Truita", emoji: "🐟", groupId: "peixos" },
      { id: "tauro-v", label: "Tauró", emoji: "🦈", groupId: "peixos" },
      { id: "granota", label: "Granota", emoji: "🐸", groupId: "amfibis" },
      { id: "gripau", label: "Gripau", emoji: "🐸", groupId: "amfibis" },
      { id: "sargantana", label: "Sargantana", emoji: "🦎", groupId: "reptils" },
      { id: "serp", label: "Serp", emoji: "🐍", groupId: "reptils" },
      { id: "colom", label: "Colom", emoji: "🕊️", groupId: "ocells" },
      { id: "aguila-v", label: "Àguila", emoji: "🦅", groupId: "ocells" },
      { id: "esquirol", label: "Esquirol", emoji: "🐿️", groupId: "mamifers" },
      { id: "conill-v", label: "Conill", emoji: "🐇", groupId: "mamifers" },
    ],
  },
  invertebrats: {
    groups: [
      { id: "esponges", label: "Esponges", color: "#f8a5c2" },
      { id: "meduses", label: "Meduses", color: "#7ec8f8" },
      { id: "cucs", label: "Cucs", color: "#c4a484" },
      { id: "molluscos", label: "Mol·luscos", color: "#ffe066" },
      { id: "artropodes", label: "Artròpodes", color: "#ff7a59" },
      { id: "equinoderms", label: "Equinoderms", color: "#6ee0b0" },
    ],
    items: [
      { id: "esponja", label: "Esponja", emoji: "🧽", groupId: "esponges" },
      { id: "medusa", label: "Medusa", emoji: "🪼", groupId: "meduses" },
      { id: "cuc", label: "Cuc de terra", emoji: "🪱", groupId: "cucs" },
      { id: "caragol", label: "Caragol", emoji: "🐌", groupId: "molluscos" },
      { id: "polp", label: "Polp", emoji: "🐙", groupId: "molluscos" },
      { id: "marieta", label: "Marieta", emoji: "🐞", groupId: "artropodes" },
      { id: "aranya-i", label: "Aranya", emoji: "🕷️", groupId: "artropodes" },
      { id: "estrella", label: "Estrella de mar", emoji: "⭐", groupId: "equinoderms" },
      { id: "erico", label: "Eriçó de mar", emoji: "🟣", groupId: "equinoderms" },
    ],
  },
  molluscos: {
    groups: [
      { id: "bivalves", label: "Bivalves", color: "#7ec8f8" },
      { id: "gasteropodes", label: "Gasteròpodes", color: "#6ee0b0" },
      { id: "cefalopodes", label: "Cefalòpodes", color: "#c9a7ff" },
    ],
    items: [
      { id: "clotxina", label: "Clòtxina", emoji: "🦪", groupId: "bivalves" },
      { id: "cloissa", label: "Cloïssa", emoji: "🐚", groupId: "bivalves" },
      { id: "vieira", label: "Vieira", emoji: "🐚", groupId: "bivalves" },
      { id: "caragol-m", label: "Caragol", emoji: "🐌", groupId: "gasteropodes" },
      { id: "bavosa", label: "Bavosa", emoji: "🐛", groupId: "gasteropodes" },
      { id: "calamar", label: "Calamar", emoji: "🦑", groupId: "cefalopodes" },
      { id: "sepia", label: "Sépia", emoji: "🦑", groupId: "cefalopodes" },
      { id: "polp-m", label: "Polp", emoji: "🐙", groupId: "cefalopodes" },
    ],
  },
};

/** Zones d’etiquetes sobre el diagrama de l’insecte (percentatges). */
export const INSECT_PARTS: LabelPart[] = [
  { id: "cap", label: "cap", left: 8, top: 38, width: 16, height: 10 },
  { id: "torax", label: "tòrax", left: 28, top: 36, width: 16, height: 10 },
  { id: "abdomen", label: "abdomen", left: 52, top: 34, width: 18, height: 10 },
  { id: "antenes", label: "antenes", left: 4, top: 12, width: 18, height: 10 },
  { id: "ales", label: "ales", left: 34, top: 8, width: 16, height: 10 },
  { id: "potes", label: "potes", left: 30, top: 72, width: 16, height: 10 },
];

export const METAMORFOSI_STEPS: SequenceStep[] = [
  { id: "ou", label: "Ou", emoji: "🥚", order: 1 },
  { id: "eruga", label: "Eruga (larva)", emoji: "🐛", order: 2 },
  { id: "crisalide", label: "Crisàlide", emoji: "🫙", order: 3 },
  { id: "eixint", label: "Eixint de la crisàlide", emoji: "🦋", order: 4 },
  { id: "adult", label: "Papallona adulta", emoji: "🦋", order: 5 },
];

export function getChapter(id: AnimalChapterId) {
  return ANIMAL_CHAPTERS.find((c) => c.id === id)!;
}
