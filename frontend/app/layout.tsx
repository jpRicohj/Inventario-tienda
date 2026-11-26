import "./globals.css";

export const metadata = {
  title: "Inventario de Tienda",
  description: "Sistema simple de inventario para una pequeña tienda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
