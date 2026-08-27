// Exportar tarjetas de gráficos como imagen PNG, del lado del cliente.
// Estrategia: se clona la tarjeta fuera de pantalla (la página no parpadea),
// se le quita lo interactivo ([data-no-export]), se revela el contenido solo
// de exportación ([data-export-only] + hidden) y se agrega un pie de marca
// con la URL del sitio. La imagen siempre viaja con título y fuente porque
// la tarjeta ya los contiene (un gráfico nunca se publica suelto).

export interface CapturedImage {
  dataUrl: string;
  blob: Blob;
}

export const SITE_HOST = "uruguaydata.vercel.app";

/** Fondo efectivo del nodo: sube por los ancestros hasta un color opaco. */
function effectiveBackground(node: HTMLElement): string {
  let el: HTMLElement | null = node;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") return bg;
    el = el.parentElement;
  }
  return "#ffffff";
}

/** data:URL → Blob sin fetch (fetch a data: está bloqueado por la CSP). */
function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(head)?.[1] ?? "image/png";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Pie de marca que solo existe en la imagen exportada (estilos en línea). */
function buildBrandFooter(): HTMLElement {
  const footer = document.createElement("div");
  footer.style.cssText =
    "display:flex;align-items:baseline;justify-content:space-between;gap:12px;" +
    "margin-top:14px;padding-top:10px;border-top:1px solid #e0e5e9;";
  const brand = document.createElement("span");
  brand.style.cssText =
    "font-family:var(--font-display),system-ui,sans-serif;font-weight:800;" +
    "font-size:15px;letter-spacing:-0.01em;color:#1e3a5f;";
  brand.textContent = "realidad";
  const tld = document.createElement("span");
  tld.style.color = "#4a75a0";
  tld.textContent = ".uy";
  brand.appendChild(tld);
  const url = document.createElement("span");
  url.style.cssText =
    "font-family:var(--font-body),system-ui,sans-serif;font-size:12px;color:#64707c;";
  url.textContent = `Datos con fuente · ${SITE_HOST}`;
  footer.append(brand, url);
  return footer;
}

// El escaneo de @font-face sobre todas las hojas de estilo es lo más caro de
// la captura (~3 s la primera vez): se hace una sola vez por sesión.
let fontCssPromise: Promise<string> | null = null;

/**
 * Captura una tarjeta como PNG a 2× de resolución.
 * El clon se monta fijo fuera del viewport para que las hojas de estilo le
 * apliquen igual que al original, sin tocar ni mover la página real.
 */
export async function captureCard(card: HTMLElement): Promise<CapturedImage> {
  const { toSvg, getFontEmbedCSS } = await import("html-to-image");

  const clone = card.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-no-export]").forEach((n) => n.remove());
  clone.querySelectorAll("[data-export-only]").forEach((n) => n.removeAttribute("hidden"));
  // Padding parejo en la imagen aunque la tarjeta no lo tenga (p. ej. el mapa).
  if (!clone.style.padding && getComputedStyle(card).padding === "0px") {
    clone.style.padding = "16px";
  }
  clone.appendChild(buildBrandFooter());

  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    `position:fixed;top:0;left:-200vw;width:${card.offsetWidth}px;` +
    "z-index:-1;pointer-events:none;";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    if (!fontCssPromise) fontCssPromise = getFontEmbedCSS(clone);
    const width = clone.offsetWidth;
    const height = clone.offsetHeight;
    const svgUrl = await toSvg(clone, {
      width,
      height,
      fontEmbedCSS: await fontCssPromise,
    });

    // Rasterizado propio (decode + canvas) en lugar del toPng de la librería:
    // toPng espera un requestAnimationFrame, que en una pestaña en segundo
    // plano no llega nunca y dejaría la captura colgada.
    const img = new Image();
    img.src = svgUrl;
    await img.decode();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible");
    ctx.fillStyle = effectiveBackground(card);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Safari a veces dibuja el primer intento sin las fuentes: repasar.
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      await new Promise((r) => setTimeout(r, 150));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    const dataUrl = canvas.toDataURL("image/png");
    return { dataUrl, blob: dataUrlToBlob(dataUrl) };
  } finally {
    holder.remove();
  }
}

export function downloadImage(image: CapturedImage, filename: string): void {
  const a = document.createElement("a");
  a.href = image.dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function canCopyImage(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard) &&
    typeof ClipboardItem !== "undefined"
  );
}

export async function copyImage(image: CapturedImage): Promise<boolean> {
  if (!canCopyImage()) return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": image.blob })]);
    return true;
  } catch {
    return false;
  }
}

function asFile(image: CapturedImage, filename: string): File {
  return new File([image.blob], `${filename}.png`, { type: "image/png" });
}

export function canShareImage(image: CapturedImage, filename: string): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [asFile(image, filename)] });
  } catch {
    return false;
  }
}

export async function shareImage(
  image: CapturedImage,
  filename: string,
  title: string
): Promise<boolean> {
  try {
    await navigator.share({ files: [asFile(image, filename)], title });
    return true;
  } catch {
    // El usuario canceló la hoja de compartir o el navegador no la soporta.
    return false;
  }
}
