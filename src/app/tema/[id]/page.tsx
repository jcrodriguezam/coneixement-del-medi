import { notFound } from "next/navigation";
import TemaGame from "@/components/TemaGame";
import { getTema, TEMES } from "@/data/temes";

export function generateStaticParams() {
  return TEMES.filter((t) => t.available).map((t) => ({ id: t.id }));
}

export default async function TemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tema = getTema(id);
  if (!tema || !tema.available) notFound();

  return <TemaGame chapters={tema.chapters} temaTitle={`${tema.title} · ${tema.subtitle}`} />;
}
