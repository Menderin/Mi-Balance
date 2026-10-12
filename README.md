# Mi Balance

Aplicación de finanzas personales y proyecto de aprendizaje full-stack, Docker, Azure y DevOps.

Tras completar y estabilizar la versión web, se prevé crear una aplicación Android y publicarla en Google Play Store. La tecnología móvil se decidirá en esa etapa; el alcance está documentado en `Agents/SSD.md`.

## Integración continua

Usar Node.js 24 y ejecutar las mismas verificaciones que GitHub Actions:

```powershell
npm ci
npm run check
```

El workflow `.github/workflows/ci.yml` se ejecuta en pushes a main, feat/** y feature/**, en pull requests hacia `main` y manualmente desde Actions. Instala las dependencias del lockfile, comprueba formato con Prettier y valida los tipos de `neon.ts` con TypeScript. No requiere secretos ni se conecta a Neon.

Todavía no existen tests de aplicación ni builds de frontend/API. Se añadirán al check `CI` cuando implementemos la base ejecutable y las funciones. No se despliega a Azure en esta etapa.

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

La base local de desarrollo seguirá siendo PostgreSQL en Docker cuando se implemente la base ejecutable. La conexión de `main` en `.env.local` no debe cargarse automáticamente en la aplicación local ni en las pruebas. No ejecutar migraciones o pruebas contra producción.

## Flujo de ramas

El código se desarrolla en ramas feat/* (también se admite feature/*) y se integra mediante pull requests a main. La rama principal de Neon también se llama main, pero es independiente de Git. El merge de código no fusiona datos entre ramas de Neon; los cambios de esquema se aplicarán mediante migraciones versionadas.
