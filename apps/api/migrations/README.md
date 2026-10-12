# Migraciones

Añadir archivos SQL con nombres ordenados, por ejemplo `001_create_accounts.sql`.
No modificar migraciones ya aplicadas ni incluir BEGIN/COMMIT: el ejecutor aplica los archivos pendientes en una transacción y registra su checksum en `schema_migrations`.
M0 no necesita tablas de negocio. Ejecutar explícitamente con `docker compose run --rm api npm run migrate --workspace @mi-balance/api`.
