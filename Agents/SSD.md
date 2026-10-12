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

Actualmente existen la configuración de Neon, React, la API Fastify, Dockerfiles, Docker Compose y CI. El esquema de identidad y finanzas se define mediante migraciones versionadas y se explica en [DATABASE.md](DATABASE.md). El login y la recuperación local están implementados; registro por invitación, CRUD y despliegue siguen pendientes.

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

### Entrega de esquema — implementada y verificada localmente

Migraciones `001_authentication.sql` y `002_finances.sql` aplicadas a PostgreSQL local, con repetición sin cambios. Better Auth 1.7.7 instalado y fijado para verificar su esquema, ahora con rutas de login y recuperación habilitadas. Las pruebas en base temporal comprueban campos requeridos por la biblioteca, relaciones entre cuentas, importes, fechas, devoluciones, papelera y concurrencia. La prueba smoke incluye esta suite y verifica persistencia y recuperación. Invitaciones, correo de producción y CRUD siguen pendientes; no se han aplicado migraciones a Neon.

Flujo: registro por invitación → login → configuración de cuenta → dashboard → registrar ingreso o gasto → guardar en PostgreSQL → mostrar y actualizar saldo. La versión debe terminar accesible por Internet.

### Identidad y acceso

- Permitir registro mediante enlace individual enviado por correo, nombre visible y contraseña; inicio y cierre de sesión. Invitación de un solo uso, revocable y válida siete días; el enlace confirma el control del correo obligatorio y único.
- Permitir solicitar recuperación y establecer una contraseña nueva mediante enlace recibido por correo.
- El backend debe impedir acceso a cuentas o movimientos de otro usuario, incluso si se manipulan identificadores.
- No incluir Google, registro sin invitación ni interfaz administrativa de invitaciones en v0.1.
- Biblioteca: Better Auth autogestionado en Fastify. Sesiones simultáneas por dispositivo, máximo siete días sin renovación automática. Cambio o recuperación de contraseña revoca todas las sesiones anteriores. Recuperación de un solo uso, treinta minutos. Nombre y contraseña editables; correo fijo en v0.1. Integración de invitaciones y proveedor real de correo pendientes; detalles del esquema en [DATABASE.md](DATABASE.md).

### Entrega de login — implementada y verificada localmente

Pantalla adaptable con correo y contraseña, enlace «¿Olvidaste tu contraseña? No te preocupes, pulsa aquí para recuperarla», formulario de solicitud y formulario de nueva contraseña. Tras entrar se muestra el nombre y el correo propios, con cierre de sesión; dashboard y registro por invitación siguen pendientes. La creación de usuarios de prueba se limita al CLI interactivo del PostgreSQL local.

Contrato habilitado:

| Ruta                                    | Entrada / resultado                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `POST /api/auth/sign-in/email`          | Correo, contraseña y `rememberMe`; cookie HttpOnly de sesión; credenciales inválidas 401, correo sin verificar 403 |
| `POST /api/auth/sign-out`               | Revoca la sesión actual y borra su cookie                                                                          |
| `GET /api/me`                           | Nombre, correo e identificador del usuario autenticado; sin sesión 401; `Cache-Control: no-store`                  |
| `POST /api/auth/request-password-reset` | Correo y `redirectTo` del mismo origen; respuesta genérica para correos conocidos y desconocidos                   |
| `GET /api/auth/reset-password/:token`   | Valida el enlace y redirige a `/recuperar`; token inválido redirige con error                                      |
| `POST /api/auth/reset-password`         | Token y `newPassword` de 8 a 128 caracteres; invalida todas las sesiones; enlace usado o vencido 400               |

No exponer otras rutas de Better Auth, incluido registro público. Sesión absoluta de siete días sin renovación ni caché de cookies. Enlaces de recuperación de treinta minutos y un solo uso; solicitar otro invalida el anterior. Serializar solicitudes por correo para conservar esa regla con concurrencia. No registrar URLs que contengan tokens. API valida origen; producción requiere HTTPS, secreto propio y proveedor de correo configurado.

Para desarrollo, Mailpit se activa con el perfil Compose `mail`; captura los mensajes sin enviarlos fuera del equipo. No modifica los tres servicios principales ni configura servicios cloud. CI prueba autenticación en una base temporal y un remitente capturado en memoria. La prueba cubre rechazo de credenciales, correo verificado, origen, cookie, sesión persistida, cierre, recuperación, caducidad, uso único y revocación de sesiones.

### Diseño del acceso — implementado y verificado localmente

Los textos de recuperación y registro bajo el botón de login están centrados, incluida la aclaración de acceso por invitación. Una línea horizontal fina del color de borde del tema separa ese grupo del formulario, con espacio suficiente a ambos lados de la línea. No cambia navegación ni autenticación.

Navegación de acceso: conservar el login en `/` y recuperación en `/recuperar`; crear una landing mínima en `/inicio`, con presentación fiel al estado del proyecto y enlaces a login y registro. En login, mostrar «¿No tienes cuenta? Regístrate aquí» debajo de recuperación y aclarar acceso por invitación. El enlace conduce a `/registro`, pantalla informativa que indica que el registro por invitación aún está en preparación, permite entrar si ya hay cuenta y volver a la landing. No crea usuarios, solicita datos ni expone nuevas rutas de autenticación. «Volver al inicio» es un enlace con flecha junto a la marca y lleva a `/inicio`; no depende del historial del navegador. Mantener un solo CTA principal por pantalla, teclado y foco visibles. Marco exterior uniforme: 32 px en escritorio, 16 px en móvil y 12 px bajo 360 px. Probar ambos enlaces y sus destinos reales, sin simular registro disponible.

Refinamiento vigente según la referencia: marca e icono nuevamente sobre el formulario, alineados con sus campos. Formulario y dibujo comparten un panel blanco; el color del tema queda en el marco exterior (32 px en los cuatro lados en escritorio). El bloque derecho usa un fondo de 5% de la tinta del tema mezclada con blanco; solo cambia el fondo, nunca la opacidad del contenido. Puntos y pequeñas figuras SVG decorativas detrás de la escultura hacen un pulso de 900 ms al terminar el balanceo de cuatro segundos, y después permanecen quietos. La secuencia completa dura 4,9 segundos, una sola vez; con movimiento reducido, ambas partes quedan estáticas. Mantener 60/40, campos de hasta 400 px útiles y 44 px de alto, control del ojito de 44×44 px, sin frase ni footer. En móvil, márgenes exteriores de 16 px en los cuatro lados; bajo 360 px, 12 px. Conservar acceso a todos los controles y ausencia de scroll innecesario en los tamaños de escritorio acordados. Esta composición sustituye las pruebas previas de marca en la esquina y superficies a borde de página.

En escritorio, 60% para el login y 40% para la escena. No añadir enlaces de páginas aún inexistentes. Se mantienen tipografía, paletas, animación y funciones de acceso.

La altura responde al viewport real del navegador; a 1920×1080 y 1817×875, el login y la recuperación deben caber sin scroll de página. No ocultar contenido mediante `overflow: hidden` en el documento; pantallas pequeñas, zoom y mensajes extensos pueden requerir desplazamiento para conservar acceso a todos los controles. El formulario conserva una medida cómoda. Libre Baskerville Italic local en marca y títulos, con Nunito Sans en campos y textos funcionales. El usuario eligió reemplazar al personaje por equilibrio abstracto: una escultura geométrica vectorial con movimiento lento, estática con movimiento reducido; decorativa y sin acceso a los campos. No se incorpora un vídeo externo.

Login, recuperación y bienvenida comparten formulario a la izquierda y escena de equilibrio SVG a la derecha; bajo 760 px la escena se reduce sobre el formulario. Fuentes locales con alternativas del sistema. Elegir violeta, durazno o aqua al montar la aplicación, mantener esa elección hasta recargar y permitir repeticiones.

El control de cada contraseña cambia su visibilidad sin enviar el formulario ni borrar su valor; se oculta al cambiar de pantalla. La escena abstracta no reacciona a la contraseña ni recibe su contenido. SVG decorativo fuera de la lectura asistida. Mantener etiquetas, autocompletado, estados y navegación por teclado; no modificar contratos HTTP. Esta dirección sustituye el gesto anterior de cubrir los ojos.

Aceptación: tres variantes con contraste suficiente, distribución estable, interacción correcta de los dos controles en recuperación, sin peticiones al pulsar el ojito, adaptación móvil sin desbordamiento y comprobaciones existentes sin regresiones. El contexto de producto y las reglas visuales se mantienen en `apps/web/PRODUCT.md`, `apps/web/DESIGN.md` y el brief de Impeccable.

Verificación automatizada con Playwright en Chromium: visibilidad y preservación de campos, navegación y tema estable, controles independientes de recuperación, teclado sin envío accidental, carga y errores, bienvenida/cierre, contraste, fuente local, tres variantes, móvil y movimiento reducido. Estas pruebas simulan respuestas HTTP; la integración real de autenticación se comprueba con `test:smoke`. CI ejecuta ambas verificaciones.

### Cuenta principal y saldo

Cada usuario configura una cuenta principal con nombre, saldo inicial en CLP y fecha de inicio. El saldo inicial representa dinero existente y no se contabiliza como ingreso. No admitir movimientos con fecha anterior al inicio de la cuenta.

`Saldo actual = saldo inicial + ingresos activos − gastos activos + devoluciones activas`.

Nombre y saldo inicial son obligatorios; fecha actual precargada y editable. Antes de usar el dashboard se completa esta configuración. El saldo inicial se puede corregir sin afectar estadísticas; la fecha debe respetar todo el historial, incluida la papelera.

El dashboard refleja movimientos realizados hasta la fecha actual; los compromisos futuros se incorporarán en versiones posteriores. Para v0.1 no admitir fechas futuras en ingresos o gastos. Los saldos negativos son válidos y se muestran sin ocultarlos.

### Movimientos

- Tipos iniciales: ingreso, gasto y devolución vinculada. Monto entero positivo en CLP; el tipo determina el efecto sobre el saldo. Las devoluciones reducen el gasto neto del mes en que se reciben, sin contar como ingreso.
- Campos de negocio: cuenta, tipo, monto, descripción del objeto o propósito, categoría y fecha. El servidor asigna identidad, propietario y fecha de creación.
- Categorías predefinidas: Alimentación, Transporte, Hardware, Universidad, Entretenimiento, Servicios, Hogar, Salud, Ropa y Otros. Configuración de categorías queda para después.
- Crear, listar, editar y eliminar movimientos propios. Confirmar eliminación en la interfaz.
- Papelera recuperable sin borrado definitivo. Gasto y devoluciones activas se eliminan juntos; restaurar solo los integrantes de esa operación. No permitir restauración que exceda el monto original. Reglas completas, categorías de ingresos y restricciones de edición en [DATABASE.md](DATABASE.md).
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
