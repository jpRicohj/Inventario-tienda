package com.inventario.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table

// Esta es la "forma" de un producto tal como viaja en formato JSON
// entre el frontend y el backend.
@Serializable
data class Product(
    val id: Int = 0,
    val nombre: String,
    val descripcion: String? = null,
    val categoria: String,
    val precio: Double,
    val stock: Int
)

// Esta es la definición de la tabla en la base de datos SQLite.
// Exposed usa este objeto para saber cómo crear la tabla "products"
// y cómo traducir filas de la base de datos a objetos Kotlin.
object Products : Table("products") {
    val id = integer("id").autoIncrement()
    val nombre = varchar("nombre", 255)
    val descripcion = text("descripcion").nullable()
    val categoria = varchar("categoria", 100)
    val precio = double("precio")
    val stock = integer("stock")

    override val primaryKey = PrimaryKey(id)
}
