package com.inventario.database

import com.inventario.models.Products
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

// Este objeto se encarga de "encender" la base de datos cuando arranca
// el servidor: se conecta al archivo .db y crea la tabla si no existe.
object DatabaseFactory {

    fun init() {
        // Nos conectamos a un archivo local llamado inventario.db.
        // Si el archivo no existe, SQLite lo crea automáticamente.
        Database.connect(
            url = "jdbc:sqlite:inventario.db",
            driver = "org.sqlite.JDBC"
        )

        // Creamos la tabla "products" si todavía no existe.
        transaction {
            SchemaUtils.create(Products)
        }
    }
}
