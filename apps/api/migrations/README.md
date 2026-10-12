# Migraciones

Añadir archivos SQL con nombres ordenados, por ejemplo `001_create_accounts.sql`.
No modificar migraciones ya aplicadas ni incluir BEGIN/COMMIT: el ejecutor aplica los archivos pendientes en una transacción y registra su checksum en `schema_migrations`.
`001_authentication.sql` prepara el esquema central de Better Auth 1.7.7 e invitaciones. `002_finances.sql` crea las entidades de v0.1, catálogo y restricciones. No añadir tablas de funciones futuras.

Ejecutar explícitamente con `podman compose run --rm api npm run migrate --workspace @mi-balance/api` (Docker en CI). No editar archivos ya aplicados: una evolución requiere otra migración.

Diseño y reglas en [DATABASE.md](../../../Agents/DATABASE.md). La compatibilidad con la versión fijada de Better Auth se verifica en la prueba de esquema; no ejecutar su CLI de migración como segundo mecanismo en producción.
