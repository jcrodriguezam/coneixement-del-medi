import Link from "next/link";
import { notFound } from "next/navigation";
import { ASSIGNATURES, getAssignatura } from "@/data/assignatures";

export function generateStaticParams() {
  return ASSIGNATURES.filter((a) => a.available).map((a) => ({ id: a.id }));
}

export default async function AssignaturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignatura = getAssignatura(id);
  if (!assignatura || !assignatura.available) notFound();

  return (
    <main className="home">
      <div className="home-card">
        <Link href="/" className="back-link home-back">
          ← Assignatures
        </Link>
        <span className="badge">Assignatura</span>
        <h1>{assignatura.title}</h1>
        <p className="tagline">{assignatura.subtitle}. Tria un tema per començar.</p>
        <div className="tema-grid">
          {assignatura.temes.map((tema) =>
            tema.available ? (
              <Link
                key={tema.id}
                href={`/assignatura/${assignatura.id}/tema/${tema.id}`}
                className={`tema-card available accent-${assignatura.accent}`}
              >
                <div>
                  <h2>{tema.title}</h2>
                  <p>{tema.subtitle}</p>
                </div>
                <span className="cta">Jugar →</span>
              </Link>
            ) : (
              <div
                key={tema.id}
                className={`tema-card locked accent-${assignatura.accent}`}
                aria-disabled
              >
                <div>
                  <h2>{tema.title}</h2>
                  <p>{tema.subtitle}</p>
                </div>
                <span className="cta">Aviat</span>
              </div>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
