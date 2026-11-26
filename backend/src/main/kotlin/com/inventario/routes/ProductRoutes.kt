package com.inventario.routes

import com.inventario.models.Product
import com.inventario.models.Products
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

// Estructura simple para devolver mensajes de error en JSON,
// por ejemplo: { "error": "El nombre es obligatorio" }
@Serializable
data class ErrorResponse(val error: String)

// Convierte una fila de la base de datos (ResultRow) en un objeto Product.
fun rowToProduct(row: ResultRow): Product = Product(
    id = row[Products.id],
    nombre = row[Products.nombre],
    descripcion = row[Products.descripcion],
    categoria = row[Products.categoria],
    precio = row[Products.precio],
    stock = row[Products.stock]
)

// Valida los datos de un producto. Devuelve un mensaje de error,
// o null si todo está correcto.
fun validarProducto(producto: Product): String? {
    if (producto.nombre.isBlank()) return "El nombre es obligatorio"
    if (producto.categoria.isBlank()) return "La categoría es obligatoria"
    if (producto.precio < 0) return "El precio debe ser mayor o igual a 0"
    if (producto.stock < 0) return "El stock debe ser mayor o igual a 0"
    return null
}

fun Route.productRoutes() {

    route("/products") {

        // GET /products -> devuelve la lista completa de productos
        get {
            val productos = newSuspendedTransaction(Dispatchers.IO) {
                Products.selectAll().map(::rowToProduct)
            }
            call.respond(productos)
        }

        // GET /products/{id} -> devuelve un solo producto por su id
        get("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("El id debe ser un número"))
                return@get
            }

            val producto = newSuspendedTransaction(Dispatchers.IO) {
                Products.select { Products.id eq id }
                    .map(::rowToProduct)
                    .singleOrNull()
            }

            if (producto == null) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Producto no encontrado"))
            } else {
                call.respond(producto)
            }
        }

        // POST /products -> crea un nuevo producto
        post {
            val nuevoProducto = call.receive<Product>()

            val error = validarProducto(nuevoProducto)
            if (error != null) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(error))
                return@post
            }

            val idGenerado = newSuspendedTransaction(Dispatchers.IO) {
                Products.insert {
                    it[nombre] = nuevoProducto.nombre
                    it[descripcion] = nuevoProducto.descripcion
                    it[categoria] = nuevoProducto.categoria
                    it[precio] = nuevoProducto.precio
                    it[stock] = nuevoProducto.stock
                } get Products.id
            }

            call.respond(HttpStatusCode.Created, nuevoProducto.copy(id = idGenerado))
        }

        // PUT /products/{id} -> actualiza un producto existente
        put("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("El id debe ser un número"))
                return@put
            }

            val productoActualizado = call.receive<Product>()

            val error = validarProducto(productoActualizado)
            if (error != null) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(error))
                return@put
            }

            val filasActualizadas = newSuspendedTransaction(Dispatchers.IO) {
                Products.update({ Products.id eq id }) {
                    it[nombre] = productoActualizado.nombre
                    it[descripcion] = productoActualizado.descripcion
                    it[categoria] = productoActualizado.categoria
                    it[precio] = productoActualizado.precio
                    it[stock] = productoActualizado.stock
                }
            }

            if (filasActualizadas == 0) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Producto no encontrado"))
            } else {
                call.respond(productoActualizado.copy(id = id))
            }
        }

        // DELETE /products/{id} -> elimina un producto
        delete("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("El id debe ser un número"))
                return@delete
            }

            val filasEliminadas = newSuspendedTransaction(Dispatchers.IO) {
                Products.deleteWhere { eb -> with(eb) { Products.id eq id } }
            }

            if (filasEliminadas == 0) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Producto no encontrado"))
            } else {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}
