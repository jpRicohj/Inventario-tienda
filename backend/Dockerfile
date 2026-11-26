# ---- Etapa 1: build ----
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copiamos primero el wrapper y los archivos de configuración para
# aprovechar la cache de capas de Docker cuando no cambian.
COPY gradlew gradlew.bat ./
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

# Ahora copiamos el código fuente y generamos el fat jar.
COPY src ./src
RUN ./gradlew --no-daemon buildFatJar

# ---- Etapa 2: runtime ----
FROM eclipse-temurin:17-jre-jammy AS runtime

# Copiamos únicamente el jar ya construido, no el JDK completo ni Gradle.
COPY --from=build /app/build/libs/inventario-backend-all.jar /app/app.jar

# DatabaseFactory.kt usa una ruta relativa ("jdbc:sqlite:inventario.db"),
# así que el archivo .db se crea donde sea el directorio de trabajo actual.
# Usamos /app/data como WORKDIR para que caiga dentro del volumen montado.
WORKDIR /app/data

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]