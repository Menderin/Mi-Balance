---
version: 1
slug: "src-main-tsx"
primary_target: "src/main.tsx"
related_targets:
  [
    "src/style.css",
    "src/balance-scene.tsx",
    "src/login.tsx",
    "src/brand.tsx",
    "src/public-page.tsx",
    "src/password-field.tsx",
    "src/tokens.css",
  ]
---

# Login — brief

Modo: Operate. Usuarios: creador, familiares y conocidos. Tarea: entrar y recuperar acceso. Mantener la autenticación real existente y las funciones futuras como pendientes. Referencia y decisiones de la conversación aprobadas mediante PLEASE IMPLEMENT THIS PLAN.

## Direction contract

THESIS: Una bienvenida cercana con equilibrio abstracto. El formulario es el centro funcional; una escultura geométrica se balancea y se estabiliza tras cuatro segundos.

OWN-WORLD: Fondos suaves violeta, durazno y aqua; formulario blanco, tinta oscura, Libre Baskerville Italic local en marca y títulos, Nunito Sans en controles. Escultura SVG abstracta elegida por el usuario en la revisión posterior.

STORY: Identificar Mi Balance, escribir correo y contraseña, entrar o recuperar acceso. La escena no recibe información del formulario.

FIRST VIEWPORT: Panel blanco compartido por formulario y dibujo; marco exterior del color del tema, 32 px en los cuatro lados en escritorio. Dos columnas 60% formulario / 40% escena; formulario de hasta 400 px y campos de 44 px. Marca e icono sobre el formulario, alineados con sus campos; enlace discreto con flecha «Volver al inicio» junto a la marca, destino `/inicio`. Debajo de recuperación: «¿No tienes cuenta? Regístrate aquí» con destino `/registro` y aclaración de acceso por invitación. Escultura de hasta 480 px, con fondo de 5% de tinta del tema sobre blanco, sin aplicar opacidad al contenido. Puntos y figuras decorativas detrás de la escultura pulsan durante 900 ms tras el balanceo de cuatro segundos y quedan quietos; con movimiento reducido son estáticos. Sin frase ni footer. Login y recuperación sin scroll en 1920×1080 y 1817×875; bajo 760 px, escena de 144 px encima del formulario. Móvil: margen exterior de 16 px en los cuatro lados; bajo 360 px, 12 px. Zoom y pantallas bajas conservan desplazamiento necesario.

FORM: Composición y medio fijados por el usuario; prevalecen sobre las alternativas del sorteo. Seed inicial 58b283b2, índice 7. La revisión posterior cambia el ancho, la tipografía de títulos y el personaje por geometría abstracta; mantiene colores, estructura y funciones. Construcción code-led de una pantalla Operate. Sin comp generado ni vídeo externo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Estados y aceptación

Visibilidad independiente de ambas contraseñas, sin enviar ni borrar; reinicio al cambiar de pantalla. La escultura no recibe datos y no responde a la visibilidad. Movimiento de cuatro segundos al entrar y posterior reposo; reduced-motion estático. Estados reales, teclado y foco, etiquetas permanentes, contraste suficiente y sin desbordamiento horizontal. Tres temas estables hasta recargar. API, esquema, Google e invitaciones fuera del refinamiento.

## Extensión de navegación

Landing mínima `/inicio`: hereda exactamente esta composición y sistema (sin un nuevo mundo visual); presenta el propósito y el estado en desarrollo, un CTA para entrar y un enlace secundario al registro. Modo Persuade, tarea: conocer el estado real y entrar. `/registro` es una pantalla informativa, modo Read: explica que se necesitará una invitación y que el registro aún está en preparación, sin formulario ni solicitudes de alta. Tiene CTA de login y vuelta a `/inicio`. Ambas conservan escena, marco y tipografía; no añaden funciones financieras ni registro público.
