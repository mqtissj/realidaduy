import type { NextConfig } from "next";

// Cabeceras de seguridad (docs/security-review.md, hallazgo L3).
// El sitio es estático y no consume orígenes externos: todo es 'self'.
// 'unsafe-inline' en script/style es necesario para la hidratación de Next
// y los estilos en línea de los gráficos; no se permite ningún host externo.
const baseCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

function headersFor({ embeddable }: { embeddable: boolean }) {
  return [
    {
      key: "Content-Security-Policy",
      // Las piezas /embed/… existen para vivir dentro del iframe de un medio:
      // son las únicas que se pueden enmarcar. El resto del sitio, nunca.
      value: [...baseCsp, `frame-ancestors ${embeddable ? "*" : "'none'"}`].join("; "),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // X-Frame-Options no tiene equivalente a "cualquier origen": se omite en
    // los embeds y manda frame-ancestors, que sí lo permite.
    ...(embeddable ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
  ];
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/embed/:path*", headers: headersFor({ embeddable: true }) },
      // Todo lo que no sea /embed/… conserva las cabeceras estrictas.
      { source: "/((?!embed/).*)", headers: headersFor({ embeddable: false }) },
    ];
  },
};

export default nextConfig;
