import Link from "next/link";
import { ASSIGNATURES } from "@/data/assignatures";

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-card">
        <span className="badge">Per a xiquets i xiquetes</span>
        <h1>Estudi en joc</h1>
        <p className="tagline">Tria una assignatura i aprén jugant, en valencià.</p>
        <div className="tema-grid">
          {ASSIGNATURES.map((assignatura) =>
            assignatura.available ? (
              <Link
                key={assignatura.id}
                href={`/assignatura/${assignatura.id}`}
                className={`tema-card available accent-${assignatura.accent}`}
              >
                <div>
                  <h2>{assignatura.title}</h2>
                  <p>{assignatura.subtitle}</p>
                </div>
                <span className="cta">Entrar →</span>
              </Link>
            ) : (
              <div
                key={assignatura.id}
                className={`tema-card locked accent-${assignatura.accent}`}
                aria-disabled
              >
                <div>
                  <h2>{assignatura.title}</h2>
                  <p>{assignatura.subtitle}</p>
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
