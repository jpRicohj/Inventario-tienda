"use client";

import { Product } from "@/types/product";

interface Props {
  productos: Product[];
  onEditar: (producto: Product) => void;
  onEliminar: (producto: Product) => void;
}

export default function ProductList({ productos, onEditar, onEliminar }: Props) {
  if (productos.length === 0) {
    return <p className="mensaje-vacio">Todavía no hay productos. Agrega el primero.</p>;
  }

  return (
    <table className="tabla-productos">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id}>
            <td>{producto.nombre}</td>
            <td>{producto.categoria}</td>
            <td>${producto.precio.toFixed(2)}</td>
            <td>{producto.stock}</td>
            <td className="celda-acciones">
              <button className="boton-editar" onClick={() => onEditar(producto)}>
                Editar
              </button>
              <button className="boton-eliminar" onClick={() => onEliminar(producto)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
