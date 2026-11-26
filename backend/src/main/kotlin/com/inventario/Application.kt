package com.inventario

import com.inventario.database.DatabaseFactory
import com.inventario.routes.ErrorResponse
import com.inventario.routes.productRoutes
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

fun main() {
    // Arrancamos el servidor Netty en el puerto 8080.
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {

    // 1) Conectamos y preparamos la base de datos SQLite.
    DatabaseFactory.init()

    // 2) Registramos logs sencillos de cada petición HTTP en la consola.
    install(CallLogging)

    // 3) Le decimos al servidor que hable JSON: convierte automáticamente
    //    los objetos Kotlin a JSON y el JSON recibido a objetos Kotlin.
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            ignoreUnknownKeys = true
        })
    }

    // 4) Habilitamos CORS para que el frontend (Next.js en el puerto 3000)
    //    pueda hacer peticiones a este backend (puerto 8080).
    install(CORS) {
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHost("localhost:3000")
        allowHost("127.0.0.1:3000")
    }

    // 5) Si algo falla de forma inesperada, respondemos con un JSON
    //    de error en lugar de una pantalla blanca o un HTML de error.
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Error interno: ${cause.message}"))
        }
    }

    // 6) Registramos las rutas del CRUD de productos.
    routing {
        get("/") {
            call.respond(mapOf("mensaje" to "API de Inventario funcionando correctamente"))
        }
        productRoutes()
    }
}
