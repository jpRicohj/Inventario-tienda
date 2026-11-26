// Esta interfaz describe la forma de un producto en el frontend.
// Debe coincidir con el JSON que envía y recibe el backend Ktor.
export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
}

// Cuando creamos un producto todavía no tiene id (lo genera la base de datos).
export type ProductInput = Omit<Product, "id">;
