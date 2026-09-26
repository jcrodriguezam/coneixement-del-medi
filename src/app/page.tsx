import Link from "next/link";
import { TEMES } from "@/data/temes";

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-card">
        <span className="badge">Per a xiquets i xiquetes</span>
        <h1>Coneixement del medi</h1>
        <p className="tagline">
          Arrossega cada paraula al seu lloc i aprén les parts del cos. Divertit i en
          valencià!
        </p>
        <div className="tema-grid">
          {TEMES.map((tema) =>
            tema.available ? (
              <Link key={tema.id} href={`/tema/${tema.id}`} className="tema-card available">
                <div>
                  <h2>{tema.title}</h2>
                  <p>{tema.subtitle}</p>
                </div>
                <span className="cta">Jugar →</span>
              </Link>
            ) : (
              <div key={tema.id} className="tema-card locked" aria-disabled>
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
