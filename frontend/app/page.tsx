"use client";

import { useEffect, useState } from "react";
import { Product, ProductInput } from "@/types/product";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "@/services/api";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";

export default function PaginaPrincipal() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Controla si el formulario está abierto y en qué modo (agregar/editar).
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);

  // Controla el producto que se está a punto de eliminar (para el diálogo de confirmación).
  const [productoAEliminar, setProductoAEliminar] = useState<Product | null>(null);

  async function cargarProductos() {
    setCargando(true);
    setErrorCarga(null);
    try {
      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (err) {
      setErrorCarga("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function abrirFormularioAgregar() {
    setProductoEditando(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(producto: Product) {
    setProductoEditando(producto);
    setMostrarFormulario(true);
  }

  async function guardarProducto(datos: ProductInput) {
    if (productoEditando) {
      await actualizarProducto(productoEditando.id, datos);
    } else {
      await crearProducto(datos);
    }
    setMostrarFormulario(false);
    await cargarProductos();
  }

  async function confirmarEliminacion() {
    if (!productoAEliminar) return;
    await eliminarProducto(productoAEliminar.id);
    setProductoAEliminar(null);
    await cargarProductos();
  }

  const totalProductos = productos.length;
  const totalUnidades = productos.reduce((suma, p) => suma + p.stock, 0);

  return (
    <main className="contenedor">
      <header className="encabezado">
        <h1>Inventario de Tienda</h1>
      </header>

      <section className="resumen">
        <div className="tarjeta-resumen">
          <span className="numero-resumen">{totalProductos}</span>
          <span>Total de productos</span>
        </div>
        <div className="tarjeta-resumen">
          <span className="numero-resumen">{totalUnidades}</span>
          <span>Unidades en inventario</span>
        </div>
        <button className="boton-primario" onClick={abrirFormularioAgregar}>
          + Agregar producto
        </button>
      </section>

      {cargando && <p>Cargando productos...</p>}
      {errorCarga && <p className="mensaje-error">{errorCarga}</p>}

      {!cargando && !errorCarga && (
        <ProductList
          productos={productos}
          onEditar={abrirFormularioEditar}
          onEliminar={(producto) => setProductoAEliminar(producto)}
        />
      )}

      {mostrarFormulario && (
        <ProductForm
          productoInicial={productoEditando}
          onGuardar={guardarProducto}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {productoAEliminar && (
        <div className="overlay">
          <div className="dialogo-confirmacion">
            <p>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{productoAEliminar.nombre}</strong>?
            </p>
            <div className="botones-formulario">
              <button
                className="boton-secundario"
                onClick={() => setProductoAEliminar(null)}
              >
                Cancelar
              </button>
              <button className="boton-eliminar" onClick={confirmarEliminacion}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
