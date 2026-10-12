# Instrucciones de trabajo — Mi Balance

## Propósito y fuentes de verdad

Mi Balance es una aplicación de finanzas personales y un proyecto de aprendizaje full-stack, Docker, Azure y DevOps. El agente implementa y explica; el usuario conoce los conceptos y quiere aprender especialmente infraestructura y entrega de software.

Leer `Agents/SSD.md` antes de implementar funcionalidades. Ese documento contiene la especificación, las reglas financieras, el alcance y los criterios de aceptación. `README.md` describe la preparación y ejecución real del repositorio. Las instrucciones explícitas del usuario prevalecen sobre estos documentos.

## Desarrollo guiado por especificaciones

1. Inspeccionar el código y la documentación existentes antes de proponer cambios.
2. Identificar la función y sus criterios de aceptación en `Agents/SSD.md`. Para comportamientos nuevos, actualizar la especificación antes del código.
3. Resolver elecciones rutinarias con las decisiones acordadas. Consultar al usuario cuando cambien el alcance, la experiencia del producto, el stack o el presupuesto.
4. Implementar por funcionalidades completas: frontend, API, persistencia y verificación. Mantener cada entrega pequeña y ejecutable.
5. Ejecutar las comprobaciones apropiadas, corregir fallos y actualizar la documentación afectada.
6. Explicar en español qué cambió, por qué, cómo funciona y cómo se verificó. Declarar las comprobaciones que no pudieron ejecutarse.

No presentar funciones futuras como implementadas. Mantener el estado de cada milestone en la especificación y los comandos del README sincronizados con el código real.

## Arquitectura y convenciones

- Monorepo con npm workspaces: `apps/web` para React + TypeScript + Vite; `apps/api` para Node.js LTS + TypeScript + Fastify.
- PostgreSQL mediante `pg`, consultas parametrizadas y migraciones SQL versionadas. No introducir un ORM sin discutir el cambio.
- Frontend y API independientes. Nginx sirve el frontend y dirige `/api` al backend. La conexión a PostgreSQL pertenece exclusivamente al backend.
- TypeScript estricto; nombres de código en inglés, interfaz y documentación explicativa en español.
- CSS sencillo y adaptable a móvil. No incorporar bibliotecas de UI o capas de abstracción sin necesidad concreta.
- Mantener la lógica financiera comprobable fuera de componentes visuales y detalles de proveedores cloud.
- Evitar microservicios, Kubernetes, event sourcing y servicios adicionales que no correspondan al milestone activo.

## Datos, seguridad y entornos

- Dinero en CLP entero: nunca usar aritmética de punto flotante para cálculos financieros.
- Aplicar las reglas de saldo, transferencias y compromisos de `Agents/SSD.md`.
- Autenticar y autorizar en la API; toda lectura o escritura de datos personales debe comprobar el propietario.
- Nunca versionar, imprimir ni incluir en ejemplos credenciales reales. Usar ejemplos sin secretos y archivos de entorno excluidos de Git.
- PostgreSQL local en Docker es la base de desarrollo y pruebas. No cargar automáticamente la `.env.local` de Neon en la app local, pruebas o CI.
- Neon `main` es la rama principal remota. No ejecutar pruebas, seeds ni migraciones experimentales contra ella. Los cambios de producción requieren el flujo de despliegue autorizado.
- Las skills instaladas de Neon complementan el trabajo; no sustituyen las decisiones acordadas sobre Azure, backend propio y PostgreSQL local.
- Antes de aplicar configuración Neon, revisar el plan y conservar la configuración existente. No habilitar servicios adicionales por defecto.

## Git, CI y despliegue

- Trabajar en `feat/*` (también se admite `feature/*`), integrar con pull requests hacia `main`. CI se ejecuta en pushes a `main`, `feat/**` y `feature/**`, y en pull requests cuyo destino sea `main`. Añadir `develop` únicamente cuando exista un entorno DEV separado y se acuerde.
- No hacer commits, pushes, merges o despliegues sin autorización de la tarea o de la sesión. No sobrescribir cambios del usuario.
- Git y Neon tienen ramas independientes. Un merge de código no fusiona datos; el esquema evoluciona mediante migraciones versionadas.
- CI debe comprobar tipos, lint, pruebas pertinentes y builds de apps e imágenes. Un fallo debe impedir el despliegue.
- Usar variables de entorno para que el mismo código funcione localmente, en Docker y en Azure.
- Priorizar desplegar temprano. Primera infraestructura: Azure Container Apps Consumption y Neon; respetar el crédito estudiantil disponible de USD 100.
- Estimar costos de todos los recursos antes de provisionarlos, incluidos registro de imágenes y logs. Terraform/Bicep y Cloudflare quedan para etapas posteriores.

## Verificación y comunicación

Probar reglas financieras y autorización con casos significativos; usar integración con PostgreSQL local y pruebas de flujo cuando corresponda. Para cambios de documentación, comprobar coherencia, enlaces y diferencias; no añadir pruebas que solo reproduzcan el texto.

En cada entrega, explicar especialmente los conceptos de Docker, redes, volúmenes, secretos, CI/CD y Azure que intervienen, con ejemplos concretos y sin convertir cambios pequeños en tutoriales extensos. Informar limitaciones y próximos pasos sin confundir planes con resultados.
