# Modelo de datos — Mi Balance v0.1

## Preguntas que guían el diseño

| Pregunta                                       | Decisión y concepto                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ¿Qué representa cada fila?                     | Una entidad o un hecho: usuario, sesión, invitación, cuenta o movimiento. Esto define la responsabilidad de la tabla.                                                                                                                                                                                     |
| ¿Cómo identificamos una fila?                  | Clave primaria. Better Auth usa identificadores de texto; las entidades propias usan UUID generados por PostgreSQL.                                                                                                                                                                                       |
| ¿Cómo relacionamos datos?                      | Claves foráneas: un movimiento pertenece a una cuenta y la cuenta a un usuario. No duplicamos el propietario en cada movimiento.                                                                                                                                                                          |
| ¿Guardamos el saldo actual?                    | No: se deriva del saldo inicial y movimientos activos. Una vista SQL evita mantener dos verdades.                                                                                                                                                                                                         |
| ¿Cómo representamos pesos?                     | NUMERIC sin escala fija, restringido a enteros y al rango seguro de JavaScript. Una escala cero podría redondear una entrada fraccionaria antes de validarla. `pg` entrega NUMERIC como texto; la API debe convertir solo tras validar el rango. Las sumas también deben validarse antes de convertirlas. |
| ¿Fecha o instante?                             | DATE para el día financiero; TIMESTAMPTZ para creación, expiración y eliminación. El día actual se calcula en America/Santiago.                                                                                                                                                                           |
| ¿Qué hace única una identidad?                 | Correo normalizado único; para proveedores externos, pareja providerId/accountId. No vincular Google automáticamente solo por coincidencia de correo.                                                                                                                                                     |
| ¿Qué hacemos si dos operaciones llegan juntas? | Transacciones SQL y bloqueo de la cuenta antes de escribir movimientos. Las comprobaciones diferidas validan el estado final, incluido el total de devoluciones.                                                                                                                                          |
| ¿Qué debe proteger la base y qué la API?       | La base protege coherencia. La API autentica, comprueba propietario, valida entradas y define las operaciones permitidas. Las claves foráneas no sustituyen autorización.                                                                                                                                 |

## Tablas y relaciones

| Tabla              | Datos principales                                                            | Relación                                                                               |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| user               | id, nombre, correo único, emailVerified, timestamps                          | Identidad canónica de Better Auth                                                      |
| session            | userId, token, expiresAt, dispositivo                                        | Varias sesiones por usuario                                                            |
| account            | userId, providerId, accountId, password y campos OAuth                       | Credenciales; **no dinero**. password contiene el hash gestionado por la biblioteca    |
| verification       | identifier, value, expiresAt                                                 | Registros temporales gestionados por Better Auth                                       |
| invitations        | correo, token_hash, expiración, revocación, consumo                          | Invitación individual; used_by referencia al usuario creado                            |
| financial_accounts | propietario, nombre, saldo inicial, fecha de inicio                          | Una por usuario en v0.1, impuesta con UNIQUE                                           |
| categories         | identificador, nombre, tipo                                                  | Catálogo global predefinido, separado para ingresos y gastos                           |
| transactions       | cuenta, tipo, monto, descripción, fecha, categoría, gasto original, papelera | Ingreso, gasto o devolución; la devolución debe pertenecer a la misma cuenta del gasto |
| schema_migrations  | archivo, checksum, fecha                                                     | Registro técnico del ejecutor existente                                                |

Los nombres y campos camelCase de las cuatro tablas de autenticación siguen el contrato de Better Auth. Sus timestamps tienen valores iniciales; la biblioteca mantiene updatedAt. Las entidades propias usan snake_case. La API deberá actualizar updated_at cuando cambie datos.

## Reglas acordadas

- Usuario: nombre visible y correo obligatorio, normalizado a minúsculas y sin espacios exteriores. Puede cambiar nombre y contraseña; el correo queda fijo en v0.1.
- Invitación por email: enlace individual de un solo uso, siete días de validez y revocable. Guardar únicamente SHA-256 del token aleatorio propio, nunca el enlace completo. El registro deberá consumir la invitación y crear identidad de forma atómica; el esquema no implementa ese flujo todavía.
- Better Auth será autogestionado en Fastify. Sesiones independientes de siete días sin renovación automática; cambio o recuperación de contraseña revoca todas las sesiones, incluida la actual. Sin caché de sesión para comprobar revocación en el servidor. Recuperación: enlace de un uso, treinta minutos; la solicitud nueva invalida anteriores. Estas políticas requieren configuración y pruebas del módulo de autenticación.
- El enlace de invitación confirma control del correo: marcarlo verificado únicamente después de validar el token y que el correo coincide. No introducir registro libre por una ruta alternativa de Better Auth.
- Antes de usar el dashboard, configurar nombre y saldo de cuenta; fecha actual precargada y editable. Saldo cero y negativo válidos. Se puede corregir saldo inicial sin alterar ingresos mensuales. La fecha de inicio nunca puede quedar después de movimientos, incluso en papelera.
- Ingresos: Sueldo, Trabajo independiente, Regalo y Otros. Gastos: Alimentación, Transporte, Hardware, Universidad, Entretenimiento, Servicios, Hogar, Salud, Ropa y Otros.
- Devoluciones parciales o totales: monto positivo, fecha entre el gasto y hoy; el total activo no supera el gasto. No son ingreso; reducen el gasto neto del mes de devolución. Heredan la categoría del gasto, sin guardar una copia.
- Editar un gasto con devoluciones: no convertirlo en ingreso, no reducirlo por debajo del total activo y no mover su fecha después de ninguna devolución, incluso eliminada.
- Papelera sin purga: deleted_at y deletion_batch_id deben aparecer juntos. Borrar gasto y devoluciones activas con la misma marca, en una transacción; restaurar solo los de esa operación. Devoluciones previamente eliminadas siguen eliminadas. Una devolución individual solo se restaura con gasto activo y límite disponible; si lo supera, rechazar y explicar cómo corregirlo.
- La vista financial_balances suma ingresos y devoluciones, resta gastos y excluye papelera. La API calculará por mes ingresos, gasto bruto, devoluciones y gasto neto con la fecha de cada movimiento.

## Responsabilidades pendientes de la API

El esquema no expone endpoints. La API implementará eliminación/restauración de conjuntos, consumo de invitaciones, edición de perfil y autorización. No admitir edición normal de movimientos en papelera ni cambios de cuenta, identidad o vínculo original de una devolución. Para corregir un vínculo, eliminar y registrar correctamente. Las operaciones de grupo bloquearán primero financial_accounts con SELECT FOR UPDATE, antes de seleccionar sus integrantes.

No se añade RLS todavía: la API será el único acceso a datos personales. La futura suite HTTP debe demostrar aislamiento de usuarios. La base impide devoluciones entre cuentas; no sabe quién realiza una petición HTTP.

## Migraciones y verificación

001 crea identidad e invitaciones; 002 crea dominio financiero, catálogo, restricciones, índices, comprobaciones diferidas y vista de saldo. Se aplican con el ejecutor versionado, nunca al iniciar automáticamente la API. Los archivos aplicados son inmutables: modificar el esquema requiere una nueva migración.

Probar en una base temporal local, sin datos reales: correo duplicado, categorías incompatibles, montos fraccionarios, fechas inválidas, devolución entre cuentas, exceso de devolución, edición/restauración, operación de papelera agrupada y dos devoluciones simultáneas. Los fixtures se revierten o se descarta exclusivamente la base temporal creada por la prueba.

No crear tablas de proyectos, metas, compromisos o transferencias en esta entrega. Google y envío real de correo quedan pendientes; Azure Communication Services con dominio administrado es un candidato, todavía sujeto a disponibilidad y costo en la suscripción estudiantil.

Referencias: [esquema Better Auth](https://better-auth.com/docs/concepts/database), [PostgreSQL](https://better-auth.com/docs/adapters/postgresql), [sesiones](https://better-auth.com/docs/concepts/session-management).
