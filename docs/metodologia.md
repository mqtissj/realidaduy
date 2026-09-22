# Metodología de realidad.uy

> Documento de referencia para revisión externa. Describe de dónde sale cada número
> que publica la plataforma, qué controles atraviesa antes de ser visible y qué cosas
> la plataforma declara que **no** sabe.
>
> Última revisión: 2026-09. Versión viva: se actualiza con cada cambio metodológico.

---

## 1. Qué es y qué no es esta plataforma

**realidad.uy es una capa de presentación sobre estadística pública uruguaya.** No produce
datos propios, no hace relevamientos, no modela ni proyecta. Toma lo que publican los
organismos oficiales y lo reorganiza por territorio para que se pueda leer y comparar.

Esto define el alcance de la responsabilidad metodológica:

| La plataforma responde por | La plataforma NO responde por |
| --- | --- |
| Que el número mostrado sea idéntico al de la fuente | La metodología de relevamiento del organismo |
| Que la fuente, el período y la unidad estén correctamente atribuidos | Los errores de la fuente primaria |
| Que dos números no se comparen si no son comparables | La representatividad muestral de la ECH |
| Que un dato ausente se declare ausente | Los cambios de criterio del INE, BCU o M. Interior |

Cuando la fuente corrige una cifra, la plataforma la corrige. Cuando la fuente cambia de
metodología, la plataforma marca el quiebre (§7) pero no reconstruye la serie: empalmar
series con metodologías distintas es producir un dato nuevo, y eso queda fuera del alcance.

---

## 2. Principios no negociables

1. **Nunca inventar datos.** Lo que no existe se declara como ausente con texto explícito
   ("No hay datos públicos disponibles para este nivel territorial"), nunca se completa con
   una estimación silenciosa, una interpolación ni un promedio.
2. **Provenance total.** Cada observación conserva fuente, período, unidad, estado y la URL
   del documento original. Sin esos campos el proyecto no compila: es una restricción de
   tipos, no una convención de estilo.
3. **Neutralidad política.** Sin colores partidarios como identidad visual, sin lenguaje
   valorativo. Los colores de partido existen solo dentro de gráficos electorales, donde
   codifican una categoría.
4. **Trazabilidad de un clic.** Todo número publicado debe poder verificarse contra el
   boletín oficial siguiendo el enlace que acompaña al dato.
5. **Accesibilidad.** WCAG 2.2 AA como meta: mapa navegable por teclado, "Ver datos" en
   cada gráfico, nunca solo color para comunicar una diferencia.

---

## 3. La unidad mínima: la observación

Todo el sistema se apoya en una sola estructura. Un número suelto no existe en la base:
existe una **observación**, que es un valor atado a su contexto completo.

```ts
interface Observation {
  indicatorId: string;    // qué se mide           → "pobreza-personas"
  territoryId: string;    // dónde                 → "UY-SA" (ISO 3166-2)
  period: string;         // cuándo                → "2025" | "2026-Q1" | "2026-07"
  periodLabel: string;    // cómo se lee           → "Año 2025"
  value: number | null;   // cuánto (null solo si UNAVAILABLE)
  status: DataStatus;     // qué tipo de dato es   → §5
  demo: boolean;          // ¿verificado a mano?   → §6
  sourceUrl: string;      // URL del dato concreto, no del organismo
  retrievedAt: string;    // fecha de extracción
  notes?: string;         // advertencias metodológicas
  breakBefore?: boolean;  // quiebre de serie      → §7
}
```

Dos decisiones de diseño que importan para la revisión:

- **`sourceUrl` apunta al documento concreto**, no a la home del organismo. Un enlace a
  `gub.uy/instituto-nacional-estadistica/` no verifica nada; un enlace al informe técnico
  del IPC de agosto 2026 sí.
- **`value` admite `null`**, y solo con `status: "UNAVAILABLE"`. La ausencia es un estado
  representable del sistema, no un hueco. Esto es lo que permite cumplir el principio 1
  sin excepciones.

Cobertura actual: **1.242 observaciones**, 21 indicadores activos, 3 niveles territoriales
(país, 19 departamentos, 136 municipios).

---

## 4. Jerarquía de fuentes

Las fuentes se clasifican por tipo y se usan en ese orden de prioridad:

| Prioridad | Tipo | Fuentes | Uso |
| --- | --- | --- | --- |
| 1 | `official` | INE, BCU, Corte Electoral, M. Interior, MTSS, OPP–OTU | Dato publicado. Siempre gana. |
| 2 | `international` | Banco Mundial (WDI) | Solo series históricas largas comparables. Siempre etiquetado como secundario. |

**Regla de precedencia:** si para un mismo indicador, territorio y período existe un dato
oficial y uno secundario, la plataforma muestra el oficial y descarta el secundario en la
lectura. El secundario permanece en la base porque alimenta la serie histórica larga, donde
el oficial no tiene cobertura.

Caso concreto: población de Uruguay 2023. Existe el Censo 2023 (INE, `OFFICIAL`) y la
estimación del Banco Mundial (`SECONDARY`). Conviven a propósito en los datos; la ficha
muestra el censal.

**Por qué Banco Mundial y no solo INE:** el INE publica las series actuales con excelente
detalle, pero la serie continua y homogénea de 1960 a hoy para comparación internacional
está en los World Development Indicators. Se usa exclusivamente para el gráfico de evolución
larga y se marca en la interfaz con el distintivo "Fuente secundaria". Nunca se usa para el
dato principal de una ficha ni para un mapa.

---

## 5. Estados del dato

Cada observación declara qué tipo de número es. La interfaz muestra este estado como
distintivo visible junto al valor.

| Estado | Significado | Ejemplo |
| --- | --- | --- |
| `OFFICIAL` | Publicado tal cual por el organismo | Desempleo julio 2026 (ECH–INE) |
| `CALCULATED` | Derivado por la plataforma con fórmula declarada | Homicidios cada 100.000 hab. |
| `ESTIMATED` | Estimación de la fuente, no medición | — |
| `SECONDARY` | Fuente internacional, no primaria nacional | PIB per cápita 1960–2024 (BM) |
| `UNAVAILABLE` | No existe dato público a ese nivel | Pobreza a nivel municipal |

Distribución actual: **1.039 `OFFICIAL` · 71 `CALCULATED` · 130 `SECONDARY`**.

**Sobre los `CALCULATED`.** Son el punto que más merece escrutinio externo, porque es donde
la plataforma agrega operaciones propias. Todos son tasas por población (delitos cada 100.000
habitantes) y todos declaran su fórmula en el diccionario de indicadores. El denominador
poblacional es siempre el Censo 2023 del INE, no una proyección. Esto tiene un costo
metodológico que conviene explicitar: usar un denominador fijo de 2023 para delitos de 2025
subestima levemente la tasa en departamentos que perdieron población e introduce el sesgo
inverso donde creció. La alternativa —proyecciones intercensales— implicaría publicar un
denominador que el INE no publicó para ese corte. Se optó por el dato duro y por declarar el
límite antes que por la precisión aparente.

---

## 6. Verificación en tres capas

La pregunta "¿cómo sé que este número es el que publicó el INE?" se responde con tres
controles independientes que corren en momentos distintos.

### Capa 1 — Ingesta que falla cerrada

Los scripts de `scripts/ingest/` extraen los datos de las fuentes oficiales. La regla de
diseño es una sola y está escrita en el encabezado de cada uno:

> **Ante la duda, romper.** Si la fuente cambia la redacción, el formato o la URL, el script
> falla con error y no escribe nada. Nunca escribe un dato parcial en silencio.

Controles concretos que aplica cada script antes de escribir:

- **Rango de plausibilidad por indicador.** Si el IPC mensual parsea como 47 %, el script
  aborta: está fuera del rango admisible declarado para ese indicador.
- **No regresión de volumen.** Si el archivo resultante tiene menos observaciones que el
  anterior, aborta. Protege contra una fuente que responde parcialmente o un parseo que
  silenciosamente dejó de capturar la mitad de la serie.
- **Cobertura esperada.** Si una serie no devuelve ningún informe, aborta con el mensaje
  "¿cambió la URL del INE?" en vez de producir una serie vacía.
- **Integridad de identificadores.** Territorio desconocido, municipio duplicado o municipio
  sin votos válidos abortan la corrida.

### Capa 2 — Verificación contra escrutinio para datos electorales

Los datos electorales reciben un control más fuerte porque admiten una verdad verificable
de forma independiente. La ingesta electoral no se da por buena hasta contrastar contra
valores de referencia auditados a mano:

- Totales nacionales 2024 por partido **==** escrutinio oficial.
- Lema ganador departamental 2025 **==** ganadores verificados, en los 19 departamentos.
- Lema ganador municipal **==** verificado en los 8 municipios de Montevideo.
- Votos del FA en el Municipio F **==** valor de control exacto.

Si cualquiera de estos contrastes falla, la corrida se detiene con
`CHEQUEO FALLIDO — <etiqueta>: esperado X, obtenido Y`. Los 136 alcaldes electos 2025–2030
fueron cotejados contra actas oficiales.

### Capa 3 — Validación previa a publicación

`npm run validate:data` corre en CI y en la tarea mensual. Ningún dato llega a producción
sin pasarla. Reglas activas:

| # | Control | Tipo |
| --- | --- | --- |
| 1 | Toda observación referencia un indicador, territorio y fuente existentes | Error |
| 2 | Período con formato válido (`AAAA`, `AAAA-MM`, `AAAA-Qn`, `AAAA-MM-DD`) | Error |
| 3 | `sourceUrl` es una URL http(s) real | Error |
| 4 | `value: null` solo con `status: UNAVAILABLE` | Error |
| 5 | Sin duplicados (indicador + territorio + período + jerarquía) | Error |
| 6 | Exactamente 19 departamentos, 8 municipios de Montevideo, 136 del país | Error |
| 7 | **Suma de población departamental == total censal del país** | Error |
| 8 | Suma de población de los municipios de Montevideo dentro del 1 % del total departamental | Error |
| 9 | Suma de población municipal del país < población nacional | Error |
| 10 | Cada indicador departamental cubre los 19 departamentos, sin huecos parciales | Error |
| 11 | Exactamente un lema ganador por territorio y elección | Error |
| 12 | Outliers: \|z\| > 3 dentro de cada serie anual | Aviso |

Los controles 7 a 10 son los que detectan el error más peligroso para una plataforma de
datos territoriales: un mapa incompleto que igual se ve bien. Un mapa con 17 de 19
departamentos no parece roto —se pinta igual— pero comunica algo falso. Por eso la cobertura
parcial es error de compilación, no advertencia.

### Verificación humana: el campo `demo`

Independiente de lo anterior, cada observación registra si fue **cotejada a mano contra el
boletín oficial**. Mientras `demo: true`, la interfaz muestra el distintivo
**"Pendiente de validación"**.

Estado actual: **1.238 verificadas, 4 pendientes** (0,3 %). Las 4 pendientes son datos cuya
cifra circuló primero en prensa citando al organismo y todavía no están en el boletín
publicado: PIB variación 2026-Q1, salario mínimo 2026-07 y pobreza 2025. Se muestran
marcadas o no se muestran; no se muestran como si fueran oficiales.

---

## 7. Comparabilidad y quiebres de serie

Este es el control del que más orgulloso estoy metodológicamente y el que más quiero que
revisen.

Una observación puede declarar `breakBefore: true`. Eso significa: **hubo un cambio
metodológico respecto al período anterior y las dos cifras no son comparables.** Cuando una
observación lleva esa marca, la plataforma **no calcula ni muestra la variación** contra el
período previo. No la muestra con asterisco, no la muestra en gris: no la muestra.

El razonamiento es que una variación entre dos cifras no comparables es un número inventado
con apariencia de dato. Es exactamente el error que comete la prensa cuando titula "la pobreza
subió X puntos" sobre un cambio de metodología de medición. Un sitio que se llama realidad.uy
no puede cometerlo.

---

## 8. Cobertura territorial

| Nivel | Unidades | Fuente de límites |
| --- | --- | --- |
| País | 1 | — |
| Departamento | 19 (ISO 3166-2:UY) | IDE / Servicio Geográfico Militar vía catalogodatos.gub.uy |
| Municipio | 136 | DINOT (límites oficiales) |
| Municipios de Montevideo | 8 | Cartografía censal INE 2023 (CCZ) + correspondencia oficial IM |

**Advertencia metodológica sobre los municipios de Montevideo:** sus límites se derivan de
la cartografía censal por CCZ según la correspondencia oficial de la Intendencia. No es una
capa publicada como tal por el organismo, es una derivación. Está declarada como tal y el
control 8 verifica que la suma de población cierre dentro del 1 % del total departamental.
Es el punto más frágil de la cobertura territorial y conviene que lo mire alguien de
ordenamiento territorial.

---

## 9. Actualización

- **Automática, día 5 de cada mes** ([`actualizar-datos.yml`](../.github/workflows/actualizar-datos.yml)):
  ingesta INE (IPC, ECH, IMS) + Banco Mundial + seguridad (M. Interior) + elecciones
  (Corte Electoral, con la verificación de §6.2) → validación → build → commit.
  Si la validación falla, no commitea.
- **Revisión manual, misma fecha:** lo que no tiene script — PIB trimestral del BCU, pobreza,
  salario mínimo y algunos datos departamentales.

Toda actualización queda en el historial de git: cada cambio de un número tiene fecha, autor
y diff. El historial del repositorio es, de hecho, el registro de auditoría de la plataforma.

---

## 10. Limitaciones conocidas

Declaradas a propósito. Una plataforma de datos que no publica sus límites está haciendo
marketing, no estadística.

1. **El nivel municipal tiene cobertura desigual.** 136 municipios con población y resultados
   electorales, pero la mayoría de los indicadores socioeconómicos no existen a ese nivel
   porque la ECH no tiene representatividad municipal. Se declara `UNAVAILABLE`, no se estima.
2. **No hay nivel de localidad ni de barrio.** El Censo 2023 permitiría bajar más en varios
   indicadores; todavía no está ingestado.
3. **Denominador poblacional fijo en Censo 2023** para todas las tasas calculadas (§5).
4. **Los límites municipales de Montevideo son derivados**, no una capa oficial publicada (§8).
5. **Sin desagregación por sexo, edad ni quintil de ingreso.** Los datos se cargan en su
   versión agregada. Es probablemente la carencia más relevante para análisis de desarrollo.
6. **Sin dimensión ambiental, de vivienda ni de salud.** No hay indicadores de MVOT, MSP ni
   ambiente.
7. **Sin medidas de desigualdad.** No hay Gini ni relación entre quintiles.
8. **La serie histórica larga depende de Banco Mundial**, con el desfasaje y las diferencias
   de criterio propias de una fuente secundaria.
9. **La ingesta del INE parsea texto de informes técnicos**, no una API. Es frágil por diseño
   y falla cerrada (§6.1), pero exige mantenimiento cuando el INE cambia la redacción.

---

## 11. Cómo señalar un error

Si un número no coincide con la fuente, o una atribución metodológica está mal:

1. Abrir un issue en el repositorio indicando indicador, territorio, período y el valor
   correcto con su enlace oficial; o
2. Escribir por los canales de contacto del sitio.

Toda corrección queda registrada en el historial público del repositorio. Una corrección
señalada por un revisor externo es el mejor resultado posible de este documento.
