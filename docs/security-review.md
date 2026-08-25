# Security Review — uruguay-data

- **Date:** 2026-08-25
- **Scope:** Full codebase on disk (`scripts/`, `src/`, config, dependencies). No git diff available; the entire codebase was treated as the change under review.
- **Method:** Semgrep static analysis (5 registry rulesets) + manual security review following the security-review methodology (context research → data-flow tracing → vulnerability assessment), plus `npm audit`.
- **Reviewed by:** Claude Code security audit (automated + manual)

---

## 1. Executive summary

**Overall risk posture: LOW.** For a public-facing, nationally used data portal, this codebase has an unusually small attack surface, and no exploitable vulnerability was found in first-party code.

Key structural facts that drive this assessment:

- The site is a **read-only, fully static Next.js app**: there are no API routes, no route handlers, no server actions, no middleware, no database, no authentication, no cookies, and no `process.env` usage anywhere in `src/`. All displayed data is compiled in from static TypeScript modules under `src/data/`.
- The only "untrusted input" the running site ever sees is the URL (dynamic `[slug]` segments and `?a=&b=&nivel=` search params). All of these are used exclusively as **lookup keys against static in-memory data**, with `notFound()` on miss — never interpolated into HTML, queries, files, or commands.
- No `dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML`, or child-process usage exists anywhere in `src/` or `scripts/`. React/JSX auto-escaping covers all rendering. All external links use `rel="noopener noreferrer"`.
- The riskier code lives in the **build-time ingestion scripts** (`scripts/ingest/*.mjs`), which download and parse data from hardcoded official government/World Bank URLs. These were reviewed closely for zip-slip, code-generation injection, SSRF, and deserialization issues; the implementations are defensive (single zip entry extracted to a fixed temp path, `JSON.stringify`/`Number()` coercion in all generated code). Residual risk is limited to a compromise of the upstream official sources, and only at build time on a maintainer machine — not on the public site.
- The real findings are in the **dependency tree**: one critical-severity advisory chain hangs off an *unused* dev dependency (`osmtogeojson` → `@xmldom/xmldom`), and Next.js currently bundles a `postcss` version with open advisories. Both are build-time exposures, both have straightforward remediations.

Priority actions: remove the unused ingestion dev dependencies (`osmtogeojson`, `shapefile`, `proj4`), track a Next.js release that bumps its bundled `postcss`, and add standard security response headers before national-scale deployment.

---

## 2. Findings (ranked by severity)

No High or Critical findings in first-party code. Semgrep reported 0 findings across all rulesets.

### M1 — Critical-severity advisories in unused dev dependency chain (`osmtogeojson` → `@xmldom/xmldom` 0.8.3)

- **Severity:** Medium (critical advisory, but the package is unused and dev-only)
- **Category:** vulnerable_dependency
- **Location:** `package.json:27` (`"osmtogeojson": "^3.0.0-beta.5"`); installed at `node_modules/@xmldom/xmldom` 0.8.3
- **Description:** `npm audit` flags `@xmldom/xmldom` <= 0.8.12 with **1 critical** (GHSA-crh6-fp67-6883 — multiple root nodes in a DOM) and **5 high** advisories (XML injection via CDATA/comment/processing-instruction/DocumentType serialization, uncontrolled recursion). It is pulled in solely by `osmtogeojson`, which is declared in `devDependencies` but **imported nowhere** — `scripts/ingest/fetch-geo.mjs` no longer uses OSM data (its own comments at lines 175–179 explain the OSM path was abandoned). `shapefile` (`package.json:29`) and `proj4` (`package.json:28`) are likewise declared but never imported.
- **Exploit scenario:** Currently none at runtime (the site never parses XML). The exposure is latent: if a future contributor wires `osmtogeojson` into an ingest script to parse Overpass/OSM XML, attacker-influenced XML (e.g., a tampered mirror or MITM'd endpoint) could exploit the xmldom parsing/serialization flaws to smuggle injected markup into the ingestion pipeline. Meanwhile the package inflates supply-chain surface for `npm install` on maintainer machines and CI.
- **Recommendation:** Remove `osmtogeojson`, `shapefile`, and `proj4` from `devDependencies` (`npm uninstall osmtogeojson shapefile proj4`). If OSM ingestion returns later, re-add `osmtogeojson` at a version whose `@xmldom/xmldom` is >= 0.9.x, or use the JSON (non-XML) Overpass output.

### M2 — Next.js 15.5.24 bundles vulnerable `postcss` (arbitrary file read advisories)

- **Severity:** Medium (build-time only; no attacker-controlled CSS in this project)
- **Category:** vulnerable_dependency
- **Location:** `package.json:14` (`"next": "^15.3.3"`, resolves to 15.5.24); flagged path `node_modules/next/node_modules/postcss` (<= 8.5.22). The top-level `postcss` 8.5.26 is patched; only Next's vendored copy is affected.
- **Description:** Open advisories against `postcss` <= 8.5.22: GHSA-6g55-p6wh-862q and GHSA-r28c-9q8g-f849 (**high** — arbitrary `.map`/file read via attacker-controlled `sourceMappingURL` comments), GHSA-fxqj-rqcc-2cmp (incomplete fix), GHSA-qx2v-qp2m-jg93 (XSS via unescaped `</style>` in stringified output). `npm audit` classifies the resulting `next` finding as moderate.
- **Exploit scenario:** Requires processing attacker-controlled CSS at build time. In this project all CSS is first-party (`src/app/globals.css` + Tailwind), so there is no concrete attack path today. The scenario becomes real if third-party CSS (e.g., a copied stylesheet containing a crafted `/*# sourceMappingURL=... */` comment) is ever added: the build could read arbitrary files from the build host and leak them into output/source maps.
- **Recommendation:** Upgrade `next` as soon as a release ships with `postcss` >= 8.5.23 (npm audit currently only offers the breaking `next@16.3.3`). Do not paste third-party CSS containing `sourceMappingURL` comments in the meantime. Re-run `npm audit` after each dependency refresh.

### L1 — Build-time ingestion implicitly trusts remote upstream content

- **Severity:** Low (build-time; hardcoded HTTPS official sources; multiple existing mitigations)
- **Category:** supply_chain / unsafe_deserialization
- **Location:** `scripts/ingest/fetch-geo.mjs:126` (GeoJSON download + `JSON.parse`), `:221` (58 MB zip download), `:226–231` (adm-zip entry extraction), `:233–234` (`node:sqlite` opens the downloaded GeoPackage), `:242` (`wkx` WKB geometry parsing); `scripts/ingest/fetch-worldbank.mjs:52–56` (World Bank API JSON).
- **Description:** The ingest scripts download data from hardcoded HTTPS URLs (`catalogodatos.gub.uy`, `www5.ine.gub.uy`, `api.worldbank.org`) and parse it with `JSON.parse`, adm-zip, `node:sqlite` (native SQLite over an untrusted `.gpkg` file), and `wkx` (binary WKB parser). Both scripts then **generate TypeScript source files** (`src/data/observations/municipios.ts`, `series-banco-mundial.ts`) from the fetched data. There is no checksum/signature pinning of the downloads. Positives worth noting: URLs are constants (no SSRF — no user input reaches `fetch`); TLS certificate validation is Node's default; every remote-derived string embedded in generated code goes through `JSON.stringify` and every number through `Number(...)`, so code injection into the generated `.ts` files is effectively neutralized; downloads are cached and re-runs are manual.
- **Exploit scenario:** An attacker who compromises one of the official endpoints (or its CDN) could serve tampered data. Worst realistic outcomes: (a) falsified national statistics published on the portal — an integrity/misinformation problem for a civic data site, partially caught by the built-in sanity checks (population-sum checks at `fetch-geo.mjs:250–254` and `scripts/validate-data.mjs:57–73`); (b) exploitation of a memory-safety bug in the native SQLite engine or a flaw in `wkx`/adm-zip parsing via a malicious `.gpkg`/zip — this would execute on the maintainer's machine at ingest time, not on the server or visitors.
- **Recommendation:** Pin an expected SHA-256 for each downloaded artifact (the INE geopackage is versioned and stable) and fail ingest on mismatch; run ingestion in CI/container rather than on developer machines; keep `npm run validate:data` as a mandatory gate before publishing (it already validates referential integrity, period formats, `sourceUrl` scheme, and population sums). Note the zip handling is already zip-slip-safe: only a single entry matched by name is read (`getEntries().find(...endsWith("ccz_mvd_23_pg.gpkg"))`) and written to a fixed filename inside a fresh `mkdtemp` directory (`fetch-geo.mjs:229–231`) — `extractAllTo`/entry-controlled paths are never used.

### L2 — Plain-object lookups keyed by remote data can be confused by prototype keys

- **Severity:** Low (data-integrity robustness, not prototype pollution — reads only, no writes)
- **Category:** prototype_confusion
- **Location:** `scripts/ingest/fetch-geo.mjs:110` (`DEPARTMENT_IDS[normalize(properties[k])]` inside `findNameProperty`) and `:151` (`DEPARTMENT_IDS[normalize(name)]`)
- **Description:** `DEPARTMENT_IDS` is a plain object literal. If the fetched GeoJSON contained a property value like `"__proto__"` or `"constructor"`, the bracket lookup returns an inherited object (truthy) instead of `undefined`, so `findNameProperty` could pick the wrong key, and line 151 could assign a non-string object as `territoryId` in the generated output. Since only reads occur, `Object.prototype` is never mutated — this is a correctness/robustness issue in the face of hostile upstream data, and downstream validation (`validate-data.mjs:38`, territory-ID membership check) would flag the corrupted output before publication.
- **Exploit scenario:** Requires a compromised upstream (see L1); result is a failed/garbled ingest run rather than code execution.
- **Recommendation:** Use `Object.hasOwn(DEPARTMENT_IDS, key)` before lookup, or store the mapping in a `Map`/`Object.create(null)`.

### L3 — No security response headers configured (hardening for national-scale deployment)

- **Severity:** Low (defense-in-depth; no concrete vulnerability today)
- **Category:** missing_hardening
- **Location:** `next.config.ts:3` (empty config — no `headers()`); no `middleware.ts`
- **Description:** The app sets no `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `frame-ancestors`/`X-Frame-Options`, and HSTS is left to whatever fronts the deployment. Today the app loads no third-party scripts and has no injection sinks, so the practical XSS risk is minimal — but for a portal intended as a national reference, a strict CSP is cheap insurance against future regressions (a stray `dangerouslySetInnerHTML`, a compromised npm package emitting script at runtime) and clickjacking/embedding abuse of official-looking data.
- **Exploit scenario:** Not directly exploitable now; the exposure is that any future XSS-class bug lands with no second layer of defense, and the site can be framed inside look-alike disinformation pages.
- **Recommendation:** Add a `headers()` block in `next.config.ts` (or set at the CDN/reverse proxy): `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'` (tighten after testing Next's inline needs), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'`, and HSTS at the edge.

### Informational (no action strictly required)

- **I1 — Generated-code pipeline is injection-safe by construction.** `fetch-worldbank.mjs:67` and `fetch-geo.mjs:288–303` build TypeScript source from remote data, which is a pattern that often yields code injection; here every interpolated string is `JSON.stringify`-escaped and every numeric value is coerced with `Number(...)`/`.toFixed(...)`. Worst case from a hostile API value is a `NaN` literal in the data file (typeof `number`, so `validate-data.mjs:43` would not flag it — consider adding an `Number.isFinite` check there), not executable code.
- **I2 — Dynamic routes are closed-world.** `src/app/departamentos/[slug]/page.tsx:13–15,36–38` and `src/app/indicadores/[slug]/page.tsx:16–18,39–41` use `generateStaticParams` from static data and `notFound()` on unknown slugs; `src/app/comparar/page.tsx:16–24` uses `?a=`/`?b=` only as keys into a client-side `Object.fromEntries` map (`CompareTool.tsx:23–33`), where an attacker-supplied `__proto__` key resolves to a truthy inherited value but is then filtered by the `t?.poblacion` type guard (`CompareTool.tsx:33`) — no rendering of unvalidated input occurs.
- **I3 — No secrets in the repository.** Semgrep `p/secrets` (0 findings) and manual review agree; there is no `.env` file, `.gitignore:7` excludes `.env*`, and no code reads `process.env`.
- **I4 — adm-zip 0.6.0 is not affected by the historical zip-slip CVEs** (path-traversal issues were fixed by 0.5.2; CVE-2018-1002204 by 0.4.11), and the usage pattern (single named entry → fixed output path) would be safe even on a vulnerable version.
- **I5 — Browser `User-Agent` spoofing in `fetch-geo.mjs:27–30`** to bypass the AGESIC WAF is an operational choice, not a vulnerability; documenting it (as the comment does) is appropriate.
- **I6 — `src/lib/utils.ts` imports `clsx`/`tailwind-merge` and `src/components/cult/*` import `motion/react`/`class-variance-authority` without corresponding entries in `package.json`** — they currently resolve via transitive hoisting. Not a security issue, but undeclared dependencies make builds non-reproducible; declare them explicitly or remove the unused `cult` components.

---

## 3. Semgrep scan summary

- **Version:** Semgrep 1.172.0 (Community), installed during this audit via `pip install --user semgrep`.
- **Windows note:** the installed `semgrep.exe`/`pysemgrep.exe` launchers were blocked by a Windows App Control policy, and the `python -m semgrep` shim exited silently (it re-execs a binary not on PATH). The scan was run successfully by invoking the `semgrep.console_scripts.pysemgrep:main` entry point directly through Python.
- **Scans performed** (both from the project root, excluding `node_modules/` and `.next/`):
  1. `p/security-audit` + `p/owasp-top-ten` + `p/javascript` — **98 rules run** (693 loaded across languages) on **56 files** (42 TS, 4 JS, 6 JSON, 8 multilang), ~100% of lines parsed → **0 findings**.
  2. `p/secrets` + `p/trailofbits` — **67 rules run** on **58 files** → **0 findings**.
- **Interpretation:** consistent with the manual review — the codebase contains no injection sinks, no crypto, no secrets, and no server-side request handling for the rules to fire on. Per the semgrep skill's own caveat, a clean scan is corroborating evidence, not proof; the manual data-flow review above is the primary basis for the conclusions.

---

## 4. Dependency audit notes

`npm audit` (lockfile `package-lock.json`, 2026-08-25): **4 advisories — 1 critical, 2 high, 1 moderate.**

| Package | Installed | Direct? | Severity | Notes |
|---|---|---|---|---|
| `@xmldom/xmldom` | 0.8.3 (dev, via `osmtogeojson`) | no | **critical** + 5 high | See finding M1. Parent `osmtogeojson` 3.0.0-beta.5 is unused — remove. |
| `next` | 15.5.24 | yes | moderate | Flagged for its vendored `postcss` <= 8.5.22 (see M2). Framework itself current on the 15.x line. |
| `postcss` (under `next`) | <= 8.5.22 (nested) | no | high | Arbitrary-file-read / stringify advisories; build-time only. Top-level `postcss` is 8.5.26 (patched). |
| `osmtogeojson` | 3.0.0-beta.5 (dev) | yes | high (transitively) | Unused; remove together with unused `shapefile` 0.6.6 and `proj4` 2.x. |

Other direct dependencies checked individually:

- **`adm-zip` 0.6.0** (dev) — clear of known advisories (zip-slip CVEs affect < 0.5.2 / < 0.4.11); usage is safe regardless (see I4).
- **`react` 19.2.8 / `react-dom`** — current, no advisories.
- **`recharts` 2.15.4**, **`d3-geo` 3.x**, **`topojson-{client,server,simplify}`**, **`wkx` 0.5.0**, **`tailwindcss` 4.1.x**, **`typescript` 5.8.x** — no open advisories at audit time. `wkx` is unmaintained (last release 2018) and parses binary data from downloaded files; acceptable for build-time use against official sources (see L1), but prefer `@ngageoint/geopackage` or GDAL tooling if ingestion grows.
- **Runtime vs. build split is favorable:** every flagged package is a `devDependency` or build-time-vendored; the shipped site's runtime dependency surface is only `next`/`react`/`react-dom`/`recharts`/`d3-geo`.

Recommended remediation order:
1. `npm uninstall osmtogeojson shapefile proj4` (clears the critical chain immediately).
2. Track and apply a `next` 15.x patch release with `postcss` >= 8.5.23; avoid `npm audit fix --force` (it would jump to Next 16, a breaking change).
3. Add `npm audit --omit=dev` (runtime surface) and full `npm audit` to CI.
