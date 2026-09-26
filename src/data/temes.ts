/** Coordenades Vision (origen baix-esquerra, 0–1) → CSS % (origen dalt-esquerra). */
export function zoneFromVision(
  x: number,
  y: number,
  w: number,
  h: number,
  pad = 0.012,
) {
  const left = Math.max(0, (x - pad) * 100);
  const top = Math.max(0, (1 - y - h - pad) * 100);
  const width = Math.min(100 - left, Math.max(9, (w + pad * 2) * 100));
  const height = Math.min(100 - top, Math.max(2.8, (h + pad * 2) * 100));
  return { left, top, width, height };
}

export type ZoneRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type BodyPart = {
  id: string;
  label: string;
  zone: ZoneRect;
};

export type Chapter = {
  id: string;
  title: string;
  image: string;
  parts: BodyPart[];
};

export type Tema = {
  id: string;
  title: string;
  subtitle: string;
  available: boolean;
  chapters: Chapter[];
};

export const TEMES: Tema[] = [
  {
    id: "tema-1",
    title: "Tema 1",
    subtitle: "El cos humà",
    available: true,
    chapters: [
      {
        id: "cap-1",
        title: "Parts del cos",
        image: "/media/cap1.jpg",
        parts: [
          { id: "front", label: "front", zone: zoneFromVision(0.677, 0.955, 0.086, 0.022) },
          { id: "galta", label: "galta", zone: zoneFromVision(0.187, 0.838, 0.079, 0.027) },
          { id: "barbeta", label: "barbeta", zone: zoneFromVision(0.739, 0.803, 0.127, 0.025) },
          { id: "coll", label: "coll", zone: zoneFromVision(0.246, 0.763, 0.057, 0.022) },
          { id: "brac", label: "braç", zone: zoneFromVision(0.16, 0.683, 0.072, 0.027) },
          { id: "colze", label: "colze", zone: zoneFromVision(0.134, 0.618, 0.086, 0.022) },
          { id: "avantbrac", label: "avantbraç", zone: zoneFromVision(0.138, 0.541, 0.159, 0.027) },
          { id: "canell", label: "canell", zone: zoneFromVision(0.821, 0.727, 0.098, 0.02) },
          { id: "ma", label: "mà", zone: zoneFromVision(0.213, 0.455, 0.05, 0.022, 0.018) },
          { id: "torax", label: "tòrax", zone: zoneFromVision(0.545, 0.69, 0.086, 0.023) },
          { id: "abdomen", label: "abdomen", zone: zoneFromVision(0.5, 0.594, 0.156, 0.025) },
          { id: "maluc", label: "maluc", zone: zoneFromVision(0.816, 0.532, 0.098, 0.02) },
          { id: "cuixa", label: "cuixa", zone: zoneFromVision(0.804, 0.393, 0.089, 0.022) },
          { id: "genoll", label: "genoll", zone: zoneFromVision(0.192, 0.329, 0.107, 0.03) },
          { id: "cama", label: "cama", zone: zoneFromVision(0.804, 0.251, 0.089, 0.018) },
          { id: "turmell", label: "turmell", zone: zoneFromVision(0.107, 0.203, 0.12, 0.023) },
          { id: "peu", label: "peu", zone: zoneFromVision(0.818, 0.088, 0.065, 0.022) },
        ],
      },
      {
        id: "cap-2",
        title: "Òrgans interns",
        image: "/media/cap2.jpg",
        parts: [
          { id: "boca", label: "boca", zone: zoneFromVision(0.116, 0.807, 0.093, 0.023) },
          { id: "cor", label: "cor", zone: zoneFromVision(0.13, 0.69, 0.063, 0.017) },
          { id: "pulmo", label: "pulmó", zone: zoneFromVision(0.106, 0.582, 0.122, 0.028) },
          { id: "estomac", label: "estómac", zone: zoneFromVision(0.78, 0.689, 0.162, 0.025) },
          { id: "intesti", label: "intestí", zone: zoneFromVision(0.799, 0.592, 0.127, 0.023) },
          { id: "testicle", label: "testicle", zone: zoneFromVision(0.082, 0.069, 0.143, 0.024) },
          { id: "penis", label: "penis", zone: zoneFromVision(0.353, 0.068, 0.11, 0.033) },
          { id: "ovari", label: "ovari", zone: zoneFromVision(0.606, 0.08, 0.095, 0.023) },
          { id: "vagina", label: "vagina", zone: zoneFromVision(0.817, 0.077, 0.122, 0.03) },
        ],
      },
      {
        id: "cap-3",
        title: "Òrgans de relació",
        image: "/media/cap3.jpg",
        parts: [
          { id: "ull", label: "ull", zone: zoneFromVision(0.156, 0.893, 0.06, 0.02) },
          { id: "orella", label: "orella", zone: zoneFromVision(0.708, 0.895, 0.121, 0.019) },
          { id: "nas", label: "nas", zone: zoneFromVision(0.132, 0.827, 0.08, 0.013) },
          { id: "llengua", label: "llengua", zone: zoneFromVision(0.646, 0.825, 0.163, 0.02) },
          { id: "pell", label: "pell", zone: zoneFromVision(0.746, 0.708, 0.097, 0.025) },
          { id: "cervell", label: "cervell", zone: zoneFromVision(0.108, 0.57, 0.148, 0.018) },
          { id: "nervis", label: "nervis", zone: zoneFromVision(0.676, 0.405, 0.129, 0.019) },
          { id: "ossos", label: "ossos", zone: zoneFromVision(0.116, 0.233, 0.124, 0.015) },
          { id: "musculs", label: "músculs", zone: zoneFromVision(0.68, 0.087, 0.184, 0.02) },
        ],
      },
      {
        id: "cap-4",
        title: "L’esquelet",
        image: "/media/cap4.jpg",
        parts: [
          { id: "crani", label: "crani", zone: zoneFromVision(0.255, 0.923, 0.052, 0.022) },
          { id: "costelles", label: "costelles", zone: zoneFromVision(0.182, 0.791, 0.09, 0.022) },
          { id: "humer", label: "húmer", zone: zoneFromVision(0.127, 0.7, 0.074, 0.024) },
          { id: "radi", label: "radi", zone: zoneFromVision(0.12, 0.589, 0.045, 0.023) },
          { id: "cubit", label: "cúbit", zone: zoneFromVision(0.145, 0.483, 0.057, 0.023) },
          {
            id: "columna",
            label: "columna vertebral",
            zone: zoneFromVision(0.095, 0.37, 0.1, 0.058),
          },
          { id: "femur", label: "fémur", zone: zoneFromVision(0.198, 0.286, 0.069, 0.025) },
          { id: "perone", label: "peroné", zone: zoneFromVision(0.123, 0.192, 0.08, 0.033) },
          { id: "tibia", label: "tíbia", zone: zoneFromVision(0.118, 0.079, 0.05, 0.023) },
          { id: "colze", label: "colze", zone: zoneFromVision(0.863, 0.677, 0.057, 0.023) },
          { id: "genoll", label: "genoll", zone: zoneFromVision(0.862, 0.467, 0.068, 0.027) },
        ],
      },
      {
        id: "cap-5",
        title: "Els músculs",
        image: "/media/cap5.jpg",
        parts: [
          { id: "masseter", label: "masseter", zone: zoneFromVision(0.185, 0.924, 0.085, 0.02) },
          { id: "pectoral", label: "pectoral", zone: zoneFromVision(0.154, 0.806, 0.08, 0.029) },
          { id: "biceps", label: "bíceps", zone: zoneFromVision(0.118, 0.679, 0.063, 0.028) },
          {
            id: "abdominals",
            label: "abdominals",
            zone: zoneFromVision(0.11, 0.568, 0.112, 0.024),
          },
          {
            id: "quadriceps",
            label: "quàdriceps",
            zone: zoneFromVision(0.12, 0.349, 0.11, 0.033),
          },
          { id: "tibial", label: "tibial", zone: zoneFromVision(0.148, 0.148, 0.053, 0.026) },
          { id: "trapezi", label: "trapezi", zone: zoneFromVision(0.805, 0.816, 0.065, 0.029) },
          { id: "triceps", label: "tríceps", zone: zoneFromVision(0.858, 0.712, 0.066, 0.025) },
          { id: "gluti", label: "glutí", zone: zoneFromVision(0.843, 0.393, 0.045, 0.031) },
          {
            id: "biceps-femoral",
            label: "bíceps femoral",
            zone: zoneFromVision(0.823, 0.262, 0.082, 0.059),
          },
          { id: "besso", label: "bessó", zone: zoneFromVision(0.846, 0.13, 0.056, 0.026) },
        ],
      },
    ],
  },
  {
    id: "tema-2",
    title: "Tema 2",
    subtitle: "Pronte…",
    available: false,
    chapters: [],
  },
];

export function getTema(id: string) {
  return TEMES.find((t) => t.id === id);
}
