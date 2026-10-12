# Mi Balance — Producto

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El creador del proyecto, familiares y conocidos que probarán una aplicación de finanzas personales. Interfaz en español, adaptable a móvil. La publicación de una aplicación Android es una etapa futura, aún sin stack decidido.

## Product Purpose

Entender cuánto dinero tengo y en qué se convierte. Proyecto de aprendizaje full-stack, infraestructura, Azure y DevOps. El agente implementa y explica.

## Operating Context

React y TypeScript con Vite, API Fastify independiente, PostgreSQL. Desarrollo local con Podman; Docker en CI. Las reglas, alcance y aceptación se encuentran en [SSD.md](../../Agents/SSD.md); ejecución en [README.md](../../README.md).

## Capabilities and Constraints

Login por correo y contraseña, sesiones y recuperación implementados localmente con Better Auth. Landing mínima en `/inicio`, login en `/` y entrada informativa de registro en `/registro`, que aclara su disponibilidad pendiente; no crea cuentas. Registro por invitación, Google, dashboard y operaciones financieras HTTP pendientes. Moneda CLP entera. No representar servicios o capacidades futuras como disponibles. Este rediseño no cambia la API, la base ni servicios cloud.

## Brand Commitments

Nombre Mi Balance. Voz amigable, cercana y cómoda; campos intuitivos. Formulario a la izquierda (60%) y escena a la derecha (40%) dentro de un panel blanco compartido, con el color del tema alrededor como marco exterior. Marca sobre el formulario, alineada a sus campos; sin frase ni footer. tres ambientes suaves violeta/durazno/aqua. Tras revisar el primer diseño, el usuario eligió serif cursiva en títulos y marca, conservando campos legibles, y equilibrio abstracto para sustituir al personaje. Libre Baskerville Italic y Nunito Sans se alojan localmente. La escena vectorial de piezas que se balancean se estabiliza tras cuatro segundos; después los puntos decorativos hacen un pulso breve y quedan quietos. El fondo del bloque derecho mezcla 5% de tinta del tema con blanco. Toda la escena es estática con movimiento reducido.

## Evidence on Hand

Referencia inicial y captura del usuario en la conversación: el panel anterior no aprovechaba el ancho y se cortaba en su navegador. Monitor declarado de 1920×1080 a 100% de zoom. No hay vídeo suministrado; se implementa geometría SVG original. No hay testimonios ni métricas de producto para utilizar como decoración.

## Product Principles

- Dar prioridad a completar la tarea, con un solo botón principal por formulario.
- Explicar errores con claridad y permitir reintentar.
- Cambiar el ambiente de color sin cambiar posiciones ni comportamiento.
- Mantener la privacidad y separar apariencia de autenticación.

## Accessibility & Inclusion

Etiquetas visibles, navegación por teclado, foco destacado, contraste accesible y preferencia de movimiento reducido. La escena es decorativa y no recibe contraseñas. No bloquear el scroll cuando zoom o pantallas pequeñas lo requieren para acceder al contenido.
