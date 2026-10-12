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

El check `CI` cubre la base ejecutable. Incluye pruebas de autenticación; las de endpoints financieros se añadirán con esas funciones. No se despliega a Azure en esta etapa.

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

Las migraciones SQL se guardan en `apps/api/migrations`. El ejecutor registra checksums en `schema_migrations` y aplica los archivos pendientes en una transacción. `001` prepara Better Auth e invitaciones; `002` crea cuentas financieras, categorías, movimientos, devoluciones y una vista de saldo. Login y recuperación local están disponibles; registro por invitación y endpoints financieros siguen pendientes. El diseño y sus razones están en [Agents/DATABASE.md](Agents/DATABASE.md).

Probar únicamente el esquema en una base temporal local:

```powershell
podman compose run --rm api npm run test:schema --workspace @mi-balance/api
```

La prueba crea una base con nombre aleatorio en el PostgreSQL local, aplica las migraciones, valida compatibilidad con Better Auth y prueba restricciones financieras y concurrencia; luego elimina exclusivamente esa base temporal. No modifica las credenciales de Neon ni sus datos.

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

## Login y recuperación locales

Reconstruir, habilitar el buzón de pruebas y aplicar las migraciones:

```powershell
podman compose --profile mail up --build -d --wait
podman compose run --rm api npm run migrate --workspace @mi-balance/api
podman compose run --rm -it api npm run create:dev-user --workspace @mi-balance/api
```

El último comando solicita nombre, correo y contraseña sin mostrarla. Crea un usuario con correo verificado exclusivamente en PostgreSQL local; no es un registro público ni funciona con Neon. Abrir http://localhost:8080 e ingresar con esos datos. La sesión se conserva al recargar y puede cerrarse desde la bienvenida.

Para probar «¿Olvidaste tu contraseña?», solicitar un enlace y abrir el mensaje en http://localhost:8025. Mailpit captura el correo; no lo entrega a direcciones reales. Es un cuarto contenedor auxiliar opcional, activado solo con el perfil `mail`. Sin ese perfil funcionan login y cierre, pero no el envío de recuperación. El enlace vence en treinta minutos, sirve una vez y reemplaza los anteriores; restablecer la contraseña cierra todas las sesiones previas.

```powershell
podman compose run --rm api npm run test:auth --workspace @mi-balance/api
```

Esta prueba también forma parte de `test:smoke` y CI; crea y elimina su propia base temporal, sin requerir Mailpit. Better Auth maneja el hash de contraseña y la cookie HttpOnly; React consulta `/api/me` para conocer la sesión, sin guardar tokens en localStorage. El navegador y la API comparten origen a través de Nginx. `APP_ORIGIN` debe coincidir con la URL del navegador (usar `localhost`, no `127.0.0.1`).

Con el perfil `mail` activo, `podman compose run --rm -e AUTH_TEST_SMTP=true api npm run test:auth --workspace @mi-balance/api` prueba además el envío SMTP hacia Mailpit. Para detener también el buzón, usar `podman compose --profile mail down`. Los mensajes de prueba no corresponden a usuarios de la base principal.

El secreto de Compose es un ejemplo local. Para producción se requieren `AUTH_SECRET` aleatorio, `APP_ORIGIN` HTTPS y SMTP real (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` según proveedor). No cargar `.env.local`. Para Vite fuera de los contenedores, configurar `APP_ORIGIN=http://localhost:5173` al ejecutar la API.

La landing mínima está en `/inicio`, el login en `/` y la entrada informativa de registro en `/registro`. Los enlaces «Volver al inicio» y «Regístrate aquí» llevan a esas pantallas reales. `/registro` explica el acceso por invitación y su estado pendiente; aún no crea cuentas. El registro por invitación, Google y dashboard siguen pendientes. El diseño del login utiliza Libre Baskerville Italic local en títulos y marca, Nunito Sans en controles y una escena abstracta SVG de equilibrio. En escritorio el panel blanco contiene acceso y dibujo en proporción 60/40, con marco exterior del color del tema de 32 px en los cuatro lados; login y recuperación caben sin scroll en 1920×1080 y 1817×875. Elige violeta, durazno o aqua al abrir o recargar, y conserva esa variante al pasar por recuperación; el color puede repetirse. En móvil la escena aparece reducida sobre el formulario. Las piezas se balancean durante cuatro segundos; después los puntos decorativos hacen un pulso de 900 ms y quedan en reposo. El bloque de la escena tiene un fondo de 5% de tinta del tema sobre blanco. Con movimiento reducido toda la escena permanece estática.

El contexto para futuras mejoras está en [PRODUCT.md](apps/web/PRODUCT.md), [DESIGN.md](apps/web/DESIGN.md) y el brief en `apps/web/.impeccable/surfaces/`. Las fuentes provienen del repositorio oficial Google Fonts; sus licencias están en `apps/web/public/fonts/OFL.txt` y `apps/web/public/fonts/libre-baskerville-OFL.txt`.

### Pruebas de interfaz

```powershell
npx playwright install chromium
npm run test:ui
```

Playwright levanta Vite y prueba el login en Chromium con respuestas de API simuladas; no crea usuarios, modifica contraseñas ni necesita PostgreSQL. Comprueba controles, recuperación, estados, bienvenida, temas, contraste y adaptación móvil. Guarda capturas locales excluidas de Git en `apps/web/.impeccable/review/`. GitHub Actions instala Chromium y ejecuta estas pruebas, además del check y la integración real de contenedores.
