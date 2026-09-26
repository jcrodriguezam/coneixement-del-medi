# Coneixement del medi

App educativa en valencià per a aprendre les parts del cos arrossegant paraules fins al seu lloc.

## Desenvolupament

```bash
npm install
npm run dev
```

Obri [http://localhost:3000](http://localhost:3000).

## Desplegament a Vercel

1. Puja el repositori a GitHub
2. Importa’l a [Vercel](https://vercel.com)
3. Framework: **Next.js** (detecció automàtica)
4. Deploy

## Estructura

- `src/data/temes.ts` — temes, capítols i coordenades dels buits
- `src/components/TemaGame.tsx` — joc (arrossegar i soltar)
- `public/media/` — imatges dels capítols
