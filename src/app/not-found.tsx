import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
      <h1 className="font-display text-4xl font-bold">Página no encontrada</h1>
      <p className="mt-3 text-ink-soft">
        La página que buscás no existe o cambió de dirección.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 font-display font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
