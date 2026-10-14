import { TEMES, type Tema } from "@/data/temes";

export type Assignatura = {
  id: string;
  title: string;
  subtitle: string;
  available: boolean;
  accent: "medi" | "mates";
  temes: Tema[];
};

export const ASSIGNATURES: Assignatura[] = [
  {
    id: "coneixement-del-medi",
    title: "Coneixement del medi",
    subtitle: "El cos humà i la natura",
    available: true,
    accent: "medi",
    temes: TEMES,
  },
  {
    id: "matematiques",
    title: "Matemàtiques",
    subtitle: "Números, càlcul i problemes",
    available: true,
    accent: "mates",
    temes: [
      {
        id: "tema-1",
        title: "Tema 1",
        subtitle: "Passar de centena",
        available: true,
        gameType: "centenes",
        chapters: [],
      },
      {
        id: "tema-2",
        title: "Tema 2",
        subtitle: "Pronte…",
        available: false,
        chapters: [],
      },
    ],
  },
];

export function getAssignatura(id: string) {
  return ASSIGNATURES.find((a) => a.id === id);
}

export function getTema(assignaturaId: string, temaId: string) {
  return getAssignatura(assignaturaId)?.temes.find((t) => t.id === temaId);
}
