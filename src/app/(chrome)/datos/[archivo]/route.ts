import { downloads, getDownload } from "@/lib/downloads";

// Los CSV se generan durante el build (uno por archivo del catálogo) y se
// sirven como estáticos: la URL es estable y no hay ejecución en producción.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return downloads.map((d) => ({ archivo: d.file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;
  const download = getDownload(archivo);
  if (!download) return new Response("Archivo no encontrado", { status: 404 });

  return new Response(download.build(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${download.file}"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
