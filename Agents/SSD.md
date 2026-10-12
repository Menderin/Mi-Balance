# Mi Balance — Especificación del sistema

## 1. Propósito y proceso

Mi Balance permite entender cuánto dinero tengo, dónde está, cuánto debo, cuánto me deben y en qué se convierte mi dinero. La descripción de un gasto debe expresar qué se compró o para qué, además del monto; el comercio es información secundaria.

Es una aplicación personal abierta a familiares y conocidos para probarla, con información privada por usuario. Su objetivo adicional es aprender frontend, backend, SQL, autenticación y especialmente Docker, Azure y DevOps. No se plantea inicialmente como producto comercial.

Se seguirá desarrollo guiado por especificaciones: definir comportamiento y criterios de aceptación, implementar una entrega funcional, verificarla y actualizar su estado. Las decisiones de trabajo del agente están en `../AGENTS.md`.

## 2. Decisiones acordadas

| Área               | Decisión                                                                          |
| ------------------ | --------------------------------------------------------------------------------- |
| Frontend           | React, TypeScript y Vite; CSS sencillo; interfaz adaptable a móvil                |
| Backend            | Node.js LTS, TypeScript y Fastify; API REST propia                                |
| Persistencia       | PostgreSQL, driver `pg`, consultas parametrizadas y migraciones SQL versionadas   |
| Organización       | Un repositorio con npm workspaces; `apps/web` y `apps/api`                        |
| Contenedores       | Frontend con Nginx, API independiente y PostgreSQL local con volumen persistente  |
| Red                | Nginx dirige `/api` a la API; el navegador nunca accede directamente a PostgreSQL |
| Cloud              | Azure Container Apps Consumption para aplicaciones; Neon para PostgreSQL remoto   |
| Entrega            | GitHub Actions; `feat/*` o `feature/*` → pull request → `main`                    |
| Entornos iniciales | Local y producción; DEV separado más adelante                                     |
| Idioma y moneda    | Español, CLP sin decimales, calendario `America/Santiago`                         |
| Acceso v0.1        | Correo y contraseña, registro por invitación, recuperación por correo             |
| Presupuesto        | Mínimo necesario dentro del crédito estudiantil disponible de USD 100             |

Mantener la aplicación portable: PostgreSQL estándar, contenedores ejecutables fuera de Azure y lógica de negocio independiente del proveedor. Elegir versiones estables compatibles al preparar la base ejecutable y fijarlas con el lockfile y las imágenes utilizadas.

## 3. Estado actual y primera entrega

Actualmente existen la configuración de Neon, React, la API Fastify, migraciones, Dockerfiles, Docker Compose y CI. Todavía no existen autenticación, tablas de negocio ni despliegue automatizado.

El workflow `.github/workflows/ci.yml` ejecuta `npm ci` y `npm run check` en pushes a main, feat/** y feature/**, pull requests hacia `main` y ejecuciones manuales. El check `CI` valida formato, tipos, pruebas de salud y builds; construye las imágenes y ejecuta una prueba de integración con los tres contenedores. Comprueba comunicación por Nginx, migraciones repetibles, persistencia al recrear PostgreSQL y recuperación de readiness. No utiliza credenciales ni acceso a Neon. El lint inicial comprueba formato; se ampliará con reglas de análisis de código cuando sea necesario.

Proyecto Neon: `Mi Balance`, identificador `raspy-firefly-35762819`. La rama principal y predeterminada es `main`; antes se llamaba `production` y se renombró conservando su identidad y datos. `neon.ts` contiene `defineConfig({})`; solo se utiliza PostgreSQL. La vinculación `.neon` y las conexiones de `.env.local` están excluidas de Git.

### Milestone M0 — Base ejecutable (implementada y verificada localmente con Podman)

Formato, tipos, tres pruebas de salud y builds de ambas aplicaciones pasan localmente. Podman construye y levanta los tres servicios. La prueba de integración verifica web, proxy, PostgreSQL, migraciones repetibles, persistencia al recrear el contenedor y recuperación tras detener la base. Nginx utiliza el DNS del contenedor para funcionar con ambos motores. CI conserva Docker; su ejecución remota requiere subir los cambios a GitHub. Docker Desktop local no se utiliza.

Entregar frontend mínimo, API y PostgreSQL local con Podman (Docker en CI); todavía no implementar funciones de v0.1.

- Crear npm workspaces, configuración TypeScript estricta, lint, variables de ejemplo, Dockerfiles y Docker Compose.
- Mostrar una pantalla mínima de Mi Balance que consulte la API y comunique éxito o indisponibilidad.
- Exponer `GET /api/health/live` con HTTP 200 cuando el proceso responda.
- Exponer `GET /api/health/ready` con HTTP 200 si PostgreSQL responde y HTTP 503 si no está disponible; no revelar credenciales ni detalles internos.
- Preparar ejecución de migraciones SQL y registrar cuáles se aplicaron; no crear tablas de funciones futuras.
- Incorporar CI para tipos, lint, pruebas pertinentes y builds de aplicaciones e imágenes.
- Documentar los comandos reales de arranque, parada, comprobación y migración.

**Aceptación:** Docker Compose levanta los tres servicios; el frontend consulta la API por Nginx; readiness detecta disponibilidad e indisponibilidad de PostgreSQL; el volumen conserva datos al recrear contenedores; builds y comprobaciones pasan. Ningún comando local o de CI utiliza Neon `main` por defecto.

## 4. Mi Balance v0.1 — Primer flujo de producto (pendiente)

Flujo: registro por invitación → login → configuración de cuenta → dashboard → registrar ingreso o gasto → guardar en PostgreSQL → mostrar y actualizar saldo. La versión debe terminar accesible por Internet.

### Identidad y acceso

- Permitir registro mediante código de invitación, correo y contraseña; inicio y cierre de sesión.
- Permitir solicitar recuperación y establecer una contraseña nueva mediante enlace recibido por correo.
- El backend debe impedir acceso a cuentas o movimientos de otro usuario, incluso si se manipulan identificadores.
- No incluir Google, registro sin invitación ni interfaz administrativa de invitaciones en v0.1.
- Antes de implementar este módulo, especificar proveedor de correo, emisión y caducidad de invitaciones, sesiones y tokens de recuperación. Son decisiones pendientes de este módulo, no funciones de M0.

### Cuenta principal y saldo

Cada usuario configura una cuenta principal con nombre, saldo inicial en CLP y fecha de inicio. El saldo inicial representa dinero existente y no se contabiliza como ingreso. No admitir movimientos con fecha anterior al inicio de la cuenta.

`Saldo actual = saldo inicial + ingresos registrados − gastos registrados`.

El dashboard refleja movimientos realizados hasta la fecha actual; los compromisos futuros se incorporarán en versiones posteriores. Para v0.1 no admitir fechas futuras en ingresos o gastos. Los saldos negativos son válidos y se muestran sin ocultarlos.

### Movimientos

- Tipos iniciales: ingreso y gasto. Monto entero positivo en CLP; el tipo determina el efecto sobre el saldo.
- Campos de negocio: cuenta, tipo, monto, descripción del objeto o propósito, categoría y fecha. El servidor asigna identidad, propietario y fecha de creación.
- Categorías predefinidas: Alimentación, Transporte, Hardware, Universidad, Entretenimiento, Servicios, Hogar, Salud, Ropa y Otros. Configuración de categorías queda para después.
- Crear, listar, editar y eliminar movimientos propios. Confirmar eliminación en la interfaz.
- Recalcular saldo y resumen al crear, editar o eliminar; mantener el resultado consistente en la API y en PostgreSQL.
- Una operación fallida no debe mostrarse como guardada; permitir corregir entradas inválidas y reintentar.

### Dashboard

Mostrar saldo actual, ingresos y gastos del mes calendario actual y últimos movimientos. Priorizar claridad, con estados de carga, vacío y error. Mostrar montos formateados como CLP y fechas según el calendario acordado.

### Contrato de API previsto

La API REST bajo `/api` cubrirá registro por invitación, sesión, recuperación, cuenta principal, CRUD de movimientos y resumen del dashboard. Validar entradas en el servidor y distinguir falta de autenticación, datos inválidos y recursos inexistentes sin exponer datos ajenos.

Antes de implementar cada módulo, añadir aquí su contrato concreto de rutas, entradas, respuestas y errores, junto con sus pruebas de aceptación. Mantener frontend y API alineados; no introducir rutas de funciones fuera de v0.1.

### Aceptación de v0.1

- Un invitado puede registrarse, entrar, salir y recuperar acceso por correo.
- Dos usuarios ven únicamente sus propios datos; los intentos de acceso cruzado se rechazan.
- Con saldo inicial de $100.000, ingreso de $20.000 y gasto de $15.000, el saldo es $105.000; el ingreso inicial de la cuenta no aparece en estadísticas.
- Cambiar ese gasto a $10.000 produce saldo de $110.000; eliminarlo produce $120.000. Recargar la página conserva los resultados.
- Rechazar montos cero, negativos, fraccionarios y fechas fuera del período permitido.
- Los totales mensuales respetan los límites del mes en `America/Santiago`.
- El flujo completo funciona por HTTPS desde Internet y los checks fallidos impiden despliegue.

## 5. Reglas y evolución posteriores

| Versión     | Capacidades                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| v0.2        | Múltiples cuentas, efectivo, banco, transferencias y saldo por cuenta                 |
| v0.3        | Cuentas por pagar y por cobrar, estados y fechas límite                               |
| v0.4        | Recordatorios en la aplicación, dinero comprometido, esperado y resumen consolidado   |
| Posteriores | Metas, compras detalladas, proyectos, estadísticas, presupuestos y gastos recurrentes |

Reglas que deben conservarse al evolucionar:

- Una transferencia entre cuentas propias cambia la distribución del dinero y no los ingresos, gastos ni saldo total. Su registro debe ser atómico.
- Una tarjeta de débito es un medio de pago asociado a una cuenta; no duplicar su saldo. El crédito representa deuda y no dinero disponible.
- Dinero disponible es el saldo real de las cuentas; dinero comprometido es el pendiente de pagar; dinero por cobrar se muestra separado y no se suma al saldo real.
- Disponible después de compromisos = disponible − pagos pendientes. Los saldos se modifican cuando existe un movimiento real de pago o cobro.
- Relacionar pagos y cobros con sus movimientos para evitar doble contabilización. Los cobros parciales conservan el importe pendiente.
- Compras podrán desglosarse en elementos y asociarse a proyectos. No crear esas entidades hasta implementar su milestone.

Importación bancaria, CSV, adjuntos, notificaciones externas, PWA, offline y multimoneda quedan fuera de v0.1. No diseñar infraestructura adicional para esas funciones anticipadamente.

### Etapa futura — Android y Play Store

Cuando la aplicación web esté terminada y estable, preparar una aplicación para Android y publicarla en Google Play Store para evaluar su uso. Esta etapa queda fuera de M0 y v0.1.

Mantener la API independiente y la web adaptable a móvil para facilitar esa evolución. Antes de implementar Android, evaluar reutilización de la web frente a un cliente móvil, y especificar autenticación, navegación, compilación, firma y requisitos vigentes de publicación. El stack Android aún no está decidido; no incorporar dependencias móviles en la base web por anticipación.

## 6. Infraestructura, pruebas y entrega

Desarrollo y pruebas utilizan PostgreSQL local con Podman (Docker en CI). Neon `main` queda reservado para la base principal remota; las ramas de Git no se sincronizan automáticamente con Neon. El merge integra código; las migraciones versionadas actualizan el esquema.

Al preparar el despliegue, cerrar región de Azure, registro de imágenes, proveedor de correo, procedimiento de migraciones y recuperación, y estimación de costos. No provisionar recursos por anticipación. Container Apps utilizará inicialmente Consumption, mínimo cero y máximo una réplica por aplicación; admitir arranque en frío. Considerar también costos de logs, registro y tráfico.

GitHub Actions debe detener el despliegue si fallan tipos, lint, pruebas o builds. La automatización de entrega a Azure se añadirá tras comprender el primer despliegue. Mantener secretos en mecanismos locales excluidos de Git, GitHub y Azure, según el entorno.

Probar reglas financieras y autorización, integración con PostgreSQL y el flujo crítico de usuario. Verificar salud, errores y estado tras el despliegue. Logs y health checks se incorporan desde la base; métricas, alertas, tracing y Azure Monitor se desarrollarán progresivamente. No registrar contraseñas, tokens ni datos financieros completos en logs.

Cloudflare y Terraform/Bicep se incorporarán después de comprender la infraestructura inicial. Un entorno DEV separado tendrá configuración, secretos y base de datos propios.
