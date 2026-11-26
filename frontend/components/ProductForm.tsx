"use client";

import { useState, FormEvent } from "react";
import { Product, ProductInput } from "@/types/product";

interface Props {
  // Si viene un producto, el formulario funciona en modo "editar".
  // Si viene null, el formulario funciona en modo "agregar".
  productoInicial: Product | null;
  onGuardar: (producto: ProductInput) => Promise<void>;
  onCancelar: () => void;
}

const CATEGORIAS = ["Papelería", "Alimentos", "Limpieza", "Electrónica", "Otros"];

export default function ProductForm({ productoInicial, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState(productoInicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(productoInicial?.descripcion ?? "");
  const [categoria, setCategoria] = useState(productoInicial?.categoria ?? CATEGORIAS[0]);
  const [precio, setPrecio] = useState(productoInicial?.precio?.toString() ?? "");
  const [stock, setStock] = useState(productoInicial?.stock?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validaciones mínimas en el frontend (el backend también valida).
    if (nombre.trim() === "") {
      setError("El nombre es obligatorio");
      return;
    }
    const precioNumero = Number(precio);
    const stockNumero = Number(stock);
    if (isNaN(precioNumero) || precioNumero < 0) {
      setError("El precio debe ser un número mayor o igual a 0");
      return;
    }
    if (isNaN(stockNumero) || stockNumero < 0 || !Number.isInteger(stockNumero)) {
      setError("El stock debe ser un número entero mayor o igual a 0");
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria,
        precio: precioNumero,
        stock: stockNumero,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="overlay">
      <form className="formulario" onSubmit={manejarEnvio}>
        <h2>{productoInicial ? "Editar producto" : "Agregar producto"}</h2>

        {error && <p className="mensaje-error">{error}</p>}

        <label>
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Cuaderno profesional"
          />
        </label>

        <label>
          Descripción
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Cuaderno de 100 hojas"
          />
        </label>

        <label>
          Categoría
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <div className="fila-doble">
          <label>
            Precio
            <input
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0.00"
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              step="1"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
            />
          </label>
        </div>

        <div className="botones-formulario">
          <button type="button" className="boton-secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
