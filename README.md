# Mi Balance

Aplicación de finanzas personales y proyecto de aprendizaje full-stack, Docker, Azure y DevOps.

Tras completar y estabilizar la versión web, se prevé crear una aplicación Android y publicarla en Google Play Store. La tecnología móvil se decidirá en esa etapa; el alcance está documentado en `Agents/SSD.md`.

## Integración continua

Usar Node.js 24 y ejecutar las mismas verificaciones que GitHub Actions:

```powershell
npm ci
npm run check
```

El workflow `.github/workflows/ci.yml` se ejecuta en pushes a main, feat/** y feature/**, en pull requests hacia `main` y manualmente desde Actions. Instala las dependencias del lockfile y comprueba formato, tipos, pruebas de salud y builds. Después construye y levanta los contenedores, y ejecuta pruebas de comunicación, migraciones, persistencia y recuperación. No requiere secretos ni se conecta a Neon.

El check `CI` cubre la base ejecutable. Las pruebas de autenticación y movimientos se añadirán con esas funciones. No se despliega a Azure en esta etapa.

Después de subir el workflow y completar su primera ejecución correctamente, seleccionar `CI` como required status check en la protección de `main` y activar la exigencia de ramas actualizadas. Mantener obligatorio el pull request.

El futuro CD publicará imágenes y desplegará a Azure tras integrar a `main` y superar CI. Se configurará autenticación con Azure, migraciones y verificación de salud en esa etapa.

## Configuración de Neon

El repositorio está configurado para el proyecto `Mi Balance` (`raspy-firefly-35762819`), rama `main`. Por ahora utiliza únicamente PostgreSQL: no se han creado tablas ni habilitado Auth, Functions, Storage, Data API o AI Gateway.

- `neon.ts`: política mínima declarativa mediante `defineConfig({})`.
- `package.json` y `package-lock.json`: dependencias `@neon/config` y `@neon/env`.
- `.agents/skills/` y `skills-lock.json`: skills de Neon instaladas para Codex.
- `.neon`: vinculación local del proyecto, excluida de Git.
- `.env.local`: variables de conexión, excluidas de Git. Nunca publicar su contenido.

El CLI `neon` está instalado globalmente. Su MCP fue configurado en los archivos de usuario de Codex, Claude Code, GitHub Copilot CLI y VS Code. Las credenciales quedan fuera del repositorio; no deben copiarse a la documentación. Los clientes pueden necesitar reiniciarse para cargar el MCP.

### Preparar otro equipo

```powershell
npm i -g neon@latest
neon login
npm ci
neon skills -y --agent codex
neon mcp -y --agent codex
neon link --project-id raspy-firefly-35762819 --branch main -y
```

### Revisar y aplicar la política

```powershell
neon config plan --project-id raspy-firefly-35762819 --branch main
neon deploy --project-id raspy-firefly-35762819 --branch main
neon config status --project-id raspy-firefly-35762819 --branch main
```

`neon deploy` aplica la configuración de Neon; no despliega el frontend ni la API. Revisar el plan antes de aplicar cambios.

### Desarrollo local

La conexión de Neon `main` en `.env.local` no se carga en Compose, la aplicación o las pruebas. No ejecutar migraciones o pruebas contra producción.

## Ejecutar la base local

Podman es el motor local; GitHub Actions conserva Docker. Ambos utilizan los mismos Dockerfiles y `compose.yml`. Nginx obtiene el DNS desde `/etc/resolv.conf`, sin depender de una dirección específica del motor.

Si la máquina de Podman está detenida, iniciarla con `podman machine start`. `podman compose version` permite comprobar el proveedor de Compose. Docker Compose puede funcionar como proveedor de Podman sin iniciar Docker Desktop. No desinstalar el proveedor sin instalar un reemplazo.

Para las pruebas, `npm run test:smoke -- podman` selecciona Podman; sin argumento utiliza Docker, como en CI.

Requisitos: Podman con su máquina activa y un proveedor de Compose instalado (el equipo actual utiliza Docker Compose como proveedor, sin necesitar el motor de Docker Desktop). Node.js 24 solo es necesario para ejecutar comandos npm fuera de los contenedores.

```powershell
podman compose up --build -d --wait
```

Abrir http://localhost:8080. El navegador recibe React desde Nginx; Nginx dirige `/api` al contenedor `api`; la API consulta `db`. Solo la web publica un puerto, limitado al equipo local. API y PostgreSQL se comunican por la red interna de Compose.

```powershell
podman compose ps
podman compose logs --tail 50
podman compose run --rm api npm run migrate --workspace @mi-balance/api
```

Las migraciones SQL se guardan en `apps/api/migrations`. El ejecutor crea únicamente la tabla técnica `schema_migrations`, registra checksums y aplica los archivos pendientes en una transacción. Todavía no existen tablas de negocio.

`GET /api/health/live` confirma que responde la API. `GET /api/health/ready` comprueba PostgreSQL y devuelve 503 cuando no está disponible, sin revelar errores internos.

Con los contenedores activos, ejecutar la verificación completa:

```powershell
npm ci
npm run check
npm run test:smoke -- podman
```

La prueba smoke recrea el contenedor de PostgreSQL, comprueba persistencia, lo detiene para verificar el 503 y lo vuelve a levantar. Utilizarla exclusivamente en esta base local de desarrollo.

```powershell
podman compose down
```

Este comando retira los contenedores y conserva el volumen `postgres_data`. `podman compose down -v` borra los datos locales; usarlo únicamente para un reinicio deliberado.

Los Dockerfiles usan varias etapas: compilan con herramientas de desarrollo y entregan imágenes de ejecución. La API se ejecuta con el usuario `node`. `.dockerignore` excluye credenciales y archivos locales del contexto de construcción. PostgreSQL 18 guarda sus datos bajo `/var/lib/postgresql`, donde se monta el volumen.

La contraseña de Compose es un valor de ejemplo exclusivo del entorno local aislado, no una credencial de producción. Cambiar imágenes, código o configuración requiere reconstruir con `podman compose up --build -d --wait`. No copiar `.env.local` a ninguna imagen.

## Flujo de ramas

El código se desarrolla en ramas feat/* (también se admite feature/*) y se integra mediante pull requests a main. La rama principal de Neon también se llama main, pero es independiente de Git. El merge de código no fusiona datos entre ramas de Neon; los cambios de esquema se aplicarán mediante migraciones versionadas.
