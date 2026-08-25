# 🇺🇾 Uruguay Data

**Entendé Uruguay, territorio por territorio.** Plataforma ciudadana e independiente que
convierte datos públicos de Uruguay en mapas, indicadores y comparaciones — siempre con
fuente, período y metodología a la vista.

> Estado: **MVP en desarrollo**. Los valores marcados "Pendiente de validación" provienen
> de investigación verificada (prensa que cita al organismo oficial) y deben cotejarse
> contra el boletín original antes de salir a producción. **Nunca se inventan datos.**

## Comandos

```bash
npm run dev            # servidor de desarrollo
npm run build          # build de producción (41 páginas estáticas)
npm run start          # servir el build
npm run fetch:geo      # ingesta de geometrías (IDE + cartografía censal INE)
npm run validate:data  # validación de datos (integridad, sumas, outliers)
```

## Stack

Next.js 15 (App Router, SSG) · TypeScript · Tailwind CSS v4 · Recharts · d3-geo (SVG
choropleth accesible). Sin backend: los datos viven tipados en `src/data/` con provenance
completo por observación (fuente, período, estado, URL, notas metodológicas).

## Documentación

Todo el paquete de planificación está en [`docs/`](docs/00-resumen.md): arquitectura,
sitemap y flujos, design system, modelo de datos, Data Dictionary, estrategia de fuentes y
roadmap.

## Principios no negociables

1. **Neutralidad política** — sin colores partidarios como identidad, sin lenguaje valorativo.
2. **Nunca inventar datos** — lo que no existe se declara ("No hay datos públicos disponibles
   para este nivel territorial").
3. **Provenance total** — cada observación conserva fuente, período, unidad, estado
   (OFFICIAL/CALCULATED/SECONDARY/…) y URL del dato original.
4. **Legibilidad y accesibilidad** — WCAG 2.2 AA como meta: mapa navegable por teclado,
   "Ver datos" en cada gráfico, nunca solo color para comunicar.

## Datos y licencias

- Indicadores: INE, BCU, MTSS, Corte Electoral (ver `/fuentes` en la app).
- Series históricas comparables: Banco Mundial (fuente secundaria, siempre etiquetada).
- Límites departamentales: IDE / Servicio Geográfico Militar vía catalogodatos.gub.uy
  (Licencia de Datos Abiertos Uruguay).
- Municipios de Montevideo: derivados de la cartografía censal INE 2023 (CCZ) según la
  correspondencia oficial de la Intendencia de Montevideo.
