import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-lg font-bold text-primary">Uruguay Data</p>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Plataforma ciudadana e independiente. Datos públicos con fuente, período y
            metodología a la vista. Sin afiliación partidaria.
          </p>
        </div>
        <nav aria-label="Secciones">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">Explorar</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link className="text-ink-soft hover:text-primary" href="/mapa">Mapa de Uruguay</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/departamentos">Departamentos</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/montevideo/municipios">Municipios de Montevideo</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/elecciones">Elecciones</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/comparar">Comparador</Link></li>
          </ul>
        </nav>
        <nav aria-label="Transparencia">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">Transparencia</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link className="text-ink-soft hover:text-primary" href="/fuentes">Fuentes y metodología</Link></li>
            <li><Link className="text-ink-soft hover:text-primary" href="/indicadores">Diccionario de indicadores</Link></li>
          </ul>
          <p className="mt-4 text-xs text-ink-faint">
            Límites territoriales: IDE/Servicio Geográfico Militar e INE (cartografía censal
            2023), publicados bajo la Licencia de Datos Abiertos Uruguay.
          </p>
        </nav>
      </div>
    </footer>
  );
}
