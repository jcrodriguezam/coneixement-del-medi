import { notFound } from "next/navigation";
import AnimalsTemaGame from "@/components/AnimalsTemaGame";
import MathCentenesGame from "@/components/MathCentenesGame";
import TemaGame from "@/components/TemaGame";
import { ASSIGNATURES, getAssignatura, getTema } from "@/data/assignatures";

export function generateStaticParams() {
  return ASSIGNATURES.flatMap((a) =>
    a.temes
      .filter((t) => t.available)
      .map((t) => ({ id: a.id, temaId: t.id })),
  );
}

export default async function TemaPage({
  params,
}: {
  params: Promise<{ id: string; temaId: string }>;
}) {
  const { id, temaId } = await params;
  const assignatura = getAssignatura(id);
  const tema = getTema(id, temaId);
  if (!assignatura || !tema || !tema.available) notFound();

  const temaTitle = `${tema.title} · ${tema.subtitle}`;

  if (tema.gameType === "centenes") {
    return (
      <MathCentenesGame
        assignaturaId={assignatura.id}
        assignaturaTitle={assignatura.title}
        temaTitle={temaTitle}
      />
    );
  }

  if (tema.gameType === "animals") {
    return (
      <AnimalsTemaGame
        assignaturaId={assignatura.id}
        assignaturaTitle={assignatura.title}
        temaTitle={temaTitle}
      />
    );
  }

  return (
    <TemaGame
      chapters={tema.chapters}
      temaTitle={temaTitle}
      assignaturaId={assignatura.id}
      assignaturaTitle={assignatura.title}
    />
  );
}
