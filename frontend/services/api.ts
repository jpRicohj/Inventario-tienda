import { Product, ProductInput } from "@/types/product";

// Dirección donde corre el backend Ktor.
const API_URL = "http://localhost:8080/products";

// Función interna para manejar errores de forma consistente.
async function manejarRespuesta(res: Response) {
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(cuerpo.error ?? `Error HTTP ${res.status}`);
  }
  return res;
}

// GET /products -> obtiene todos los productos
export async function obtenerProductos(): Promise<Product[]> {
  const res = await fetch(API_URL, { cache: "no-store" });
  await manejarRespuesta(res);
  return res.json();
}

// POST /products -> crea un producto nuevo
export async function crearProducto(producto: ProductInput): Promise<Product> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  await manejarRespuesta(res);
  return res.json();
}

// PUT /products/{id} -> actualiza un producto existente
export async function actualizarProducto(id: number, producto: ProductInput): Promise<Product> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  await manejarRespuesta(res);
  return res.json();
}

// DELETE /products/{id} -> elimina un producto
export async function eliminarProducto(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  await manejarRespuesta(res);
}
