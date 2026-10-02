import Link from "next/link";
import InstagramLink from "@/components/layout/InstagramLink";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-lg font-bold text-primary">
            realidad<span className="text-celeste-deep">.uy</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Plataforma ciudadana e independiente. Datos públicos con fuente, período y
            metodología a la vista. Sin afiliación partidaria.
          </p>
          <InstagramLink className="mt-4" />
        </div>
        <nav aria-label="Secciones">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">Explorar</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link className="text-ink-soft hover:text-primary" href="/mapa">Mapa de Uruguay</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/departamentos">Departamentos</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/municipios">Municipios de Uruguay</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/montevideo/municipios">Municipios de Montevideo</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/elecciones">Elecciones</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/comparar">Comparador</Link></li>
          </ul>
        </nav>
        <nav aria-label="Transparencia">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">Transparencia</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link className="text-ink-soft hover:text-primary" href="/fuentes">Fuentes y metodología</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/datos">Descargar datos (CSV)</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/indicadores">Diccionario de indicadores</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/terminos">Términos y condiciones</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/privacidad">Política de privacidad</Link></li>
          </ul>
          <p className="mt-4 text-xs text-ink-faint">
            Límites territoriales: IDE/Servicio Geográfico Militar, DINOT/MVOT (municipios)
            e INE (cartografía censal 2023), publicados como datos abiertos.
          </p>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink-faint md:px-6">
          © 2026 realidad.uy · Plataforma cívica independiente, sin afiliación estatal ni
          partidaria · Sin cuentas, sin cookies, sin rastreadores.
        </p>
      </div>
    </footer>
  );
}
