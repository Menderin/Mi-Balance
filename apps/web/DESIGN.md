---
name: Mi Balance
description: Un espacio de finanzas personales amigable, cómodo, cercano e intuitivo.
colors:
  blue-marguerite-50: "#f0f3fd"
  blue-marguerite-100: "#e4e8fb"
  blue-marguerite-200: "#cdd4f8"
  blue-marguerite-300: "#afb8f2"
  blue-marguerite-400: "#8f94ea"
  blue-marguerite-500: "#6664dd"
  blue-marguerite-600: "#6459d2"
  blue-marguerite-700: "#5649b9"
  blue-marguerite-800: "#463d96"
  blue-marguerite-900: "#3d3877"
  blue-marguerite-950: "#252145"
  violet-field: "#f7f8fd"
  violet-field-border: "#afb8d7"
  peach-page: "#fff4ed"
  peach-scene: "#fce7d9"
  peach-accent: "#a3482d"
  peach-accent-hover: "#843620"
  peach-accent-soft: "#edb69a"
  peach-ink: "#422b28"
  peach-muted: "#755047"
  peach-field: "#fcf8f5"
  peach-field-border: "#c8b0a3"
  peach-illustration-shadow: "#efd3c1"
  aqua-page: "#edf8f6"
  aqua-scene: "#dcf0ec"
  aqua-accent: "#246c62"
  aqua-accent-hover: "#195449"
  aqua-accent-soft: "#9ccdc3"
  aqua-ink: "#213b39"
  aqua-muted: "#426964"
  aqua-field: "#f4faf8"
  aqua-field-border: "#a0beb7"
  aqua-illustration-shadow: "#c4e2db"
  white: "#ffffff"
  illustration-ink: "#292b36"
  illustration-paper: "#fafaf7"
  error: "#932f3d"
  error-surface: "#fff0f2"
  success: "#235a43"
  success-surface: "#eef7f0"
typography:
  headline:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(28px, 2.5vw, 40px)"
    fontWeight: 400
    lineHeight: 1.25
  headline-mobile:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.25
  brand:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "20px"
    fontWeight: 400
  brand-mobile:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
  body:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.6
  label:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  navigation:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  invitation-note:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "13px"
rounded:
  control: "10px"
  feedback: "8px"
  text-action: "2px"
spacing:
  field-gap: "8px"
  control-inline: "14px"
  control-block: "9px"
  action-inline: "18px"
  form-gap: "20px"
  mobile-content: "28px"
  desktop-content: "32px"
  desktop-shell-block: "32px"
  desktop-shell-inline: "32px"
  mobile-shell: "16px"
  header-gap: "12px"
  signup-gap: "24px"
components:
  button-primary:
    backgroundColor: "{colors.blue-marguerite-700}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
  link-primary:
    backgroundColor: "{colors.blue-marguerite-700}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
    height: "44px"
  link-primary-hover:
    backgroundColor: "{colors.blue-marguerite-800}"
  link-home:
    textColor: "{colors.blue-marguerite-900}"
    typography: "{typography.navigation}"
    height: "44px"
  link-text:
    textColor: "{colors.blue-marguerite-700}"
    rounded: "{rounded.text-action}"
    padding: "0"
  registration-notice:
    backgroundColor: "{colors.blue-marguerite-50}"
    textColor: "{colors.blue-marguerite-900}"
    rounded: "{rounded.feedback}"
    padding: "12px"
  button-primary-hover:
    backgroundColor: "{colors.blue-marguerite-800}"
  button-text:
    textColor: "{colors.blue-marguerite-700}"
    rounded: "{rounded.text-action}"
    padding: "0"
  button-visibility:
    textColor: "{colors.blue-marguerite-900}"
    rounded: "{rounded.feedback}"
    padding: "10px"
    width: "44px"
  input:
    backgroundColor: "{colors.violet-field}"
    textColor: "{colors.blue-marguerite-950}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "44px"
  auth-layout:
    backgroundColor: "{colors.white}"
    width: "100%"
  scene-surface:
    backgroundColor: "color-mix(in srgb, var(--ink) 5%, white)"
  feedback-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error}"
    rounded: "{rounded.feedback}"
    padding: "12px"
  feedback-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.feedback}"
    padding: "12px"
---

# Design System: Mi Balance

## Overview

**Creative North Star: "Una bienvenida cercana"**

Un espacio amigable, cómodo, cercano e intuitivo. Los fondos suaves, la serif cursiva de los títulos y los campos claros acompañan tareas concretas sin competir con ellas. El blanco contiene el formulario y la tinta oscura mantiene su legibilidad.

La escultura geométrica original SVG expresa equilibrio abstracto. Su viga oscila una sola vez durante cuatro segundos; después, los pequeños detalles del fondo pulsan durante 900 ms y todo queda en reposo a los 4.9 segundos. Con movimiento reducido, toda la escena es estática desde el inicio. Es decorativa, no recibe datos del formulario y no reacciona a la visibilidad de las contraseñas. Este sistema registra el acceso y las páginas públicas mínimas existentes; no anticipa el diseño de un dashboard.

**Key Characteristics:**

- Tres ambientes suaves con funciones cromáticas equivalentes.
- Libre Baskerville Italic local en marca y títulos; Nunito Sans local en controles y textos funcionales.
- Controles redondeados y foco visible.
- Escultura abstracta con balanceo inicial, pulso breve de detalles y reposo posterior.

## Colors

La paleta combina ambientes claros con acentos sólidos y tinta oscura. Los valores normativos están en el frontmatter y proceden de `src/tokens.css`; el blanco de la superficie de acceso procede de `src/style.css`.

### Primary

- **Violeta Blue Marguerite:** escala original de once tonos. El 50 ocupa el marco exterior, el 100 el hover del control de visibilidad, el 300 una pieza de la escultura y la selección, el 700 las acciones, el 800 su hover, el 900 el texto secundario y el 950 la tinta. Los pasos intermedios existen en la fuente y no tienen una asignación adicional en esta pantalla.

### Secondary

- **Durazno cálido:** ambiente alternativo completo; acento terracota, marco durazno, hover tonal y tinta marrón. Sustituye roles, no añade un acento simultáneo al violeta.

### Tertiary

- **Aqua suave:** ambiente alternativo completo; acento verde profundo, marco aqua, hover tonal y tinta verde oscura. Mantiene la misma distribución y los mismos controles.

### Neutral

- **Blanco:** base del panel, formulario y campos enfocados. La zona de la escena usa el token de componente `scene-surface`: mezcla de la tinta semántica del tema al 5% con blanco, sin reducir la opacidad de la ilustración.
- **Papel ilustrado:** viga clara de la escultura en todos los ambientes. La sombra SVG utiliza el acento del ambiente con opacidad baja.
- **Error y éxito:** parejas independientes de texto y superficie para mensajes; conservan su significado en los tres temas.

**The Stable Atmosphere Rule.** Elegir un ambiente al montar la aplicación y conservarlo al navegar entre acceso y recuperación. Una recarga puede repetir el mismo ambiente.

## Typography

**Display Font:** Libre Baskerville, con `Georgia, serif` como alternativa; estilo cursivo en título y marca.
**Body Font:** Nunito Sans, con `system-ui, sans-serif` como alternativa.

Ambas familias se alojan localmente con `font-display: swap`. Nunito Sans declara pesos 200–900 y Libre Baskerville Italic 400–700; los roles serif implementados usan peso 400. El estilo cursivo se registra aquí y en los ejemplos CSS porque el esquema del frontmatter no admite `fontStyle`.

**Character:** la serif cursiva da una bienvenida cercana; los trazos suaves de Nunito Sans sostienen la lectura y los controles. Las etiquetas conservan el peso suficiente para identificarse sin recurrir a mayúsculas decorativas.

### Hierarchy

- **Headline:** título principal adaptable según el token `headline`, peso 400 e interlineado 1.25; bajo 760 px usa `headline-mobile` (26 px). Balancea las líneas y permite dividir contenido largo.
- **Brand:** nombre de producto con el token `brand`; bajo 760 px usa `brand-mobile` (18 px).
- **Body:** instrucciones con interlineado amplio. Recuperación y mensajes usan 14 px.
- **Label:** etiquetas permanentes y encabezado funcional de recuperación, en Nunito Sans.
- **Navigation:** regreso al inicio en Nunito Sans de 13 px, peso 700 y estilo normal.
- **Invitation note:** nota de acceso por invitación en Nunito Sans de 13 px.

**The Visible Label Rule.** Mantener una etiqueta visible y asociada a cada campo; el placeholder no reemplaza su nombre.

## Layout

El acceso actual usa un panel con formulario blanco y una zona de escena sutilmente sombreada. El lienzo tiene al menos `100svh` y padding de 32 px en todos los lados: el color del tema queda como marco exterior. El panel ocupa todo el ancho interior disponible y tiene altura mínima `calc(100svh - 64px)`. La cuadrícula usa `minmax(0, 3fr) minmax(0, 2fr)`, con 60% para marca y formulario a la izquierda y 40% para la escultura a la derecha; sus dos filas son `auto 1fr`. La zona derecha usa el fondo del token `scene-surface`, una mezcla al 5% de la tinta del tema con blanco; sus objetos conservan su color y opacidad propios. El panel no tiene radios ni borde.

Marca y contenido se centran dentro de la columna izquierda con ancho máximo 464 px y padding horizontal de 32 px: el formulario dispone de hasta 400 px. La marca conserva 32 px de espacio superior y se alinea con el borde izquierdo de los campos; el formulario se centra verticalmente en la segunda fila. La secuencia del formulario usa separación de 20 px y las etiquetas 8 px. El header agrupa icono y nombre a la izquierda y el enlace «Volver al inicio» cuando corresponde. Usa `space-between`, permite envolver sus elementos y separa los grupos por 12 px. El nombre y el icono mantienen separación de 10 px. No hay frase de la escena ni footer.

Entre 760 y 900 px, el padding izquierdo de la marca y ambos lados del contenido son de 36 px para mantener su alineación. Bajo 760 px, el panel usa todo el ancho interior en una columna y tres filas `auto auto 1fr`: marca, escena compacta, formulario. El lienzo tiene padding de 16 px en todos los lados; el panel tiene altura mínima `calc(100svh - 32px)`. La marca usa padding de 24 px arriba, 28 px horizontal y 16 px abajo. La escultura mide 144 px de ancho dentro de una escena sutilmente sombreada de 124 px de altura; el contenido tiene 28 px de padding horizontal y 24 px vertical. Bajo 360 px, el padding horizontal del contenido y el izquierdo de la marca bajan a 20 px; el padding exterior pasa a 12 px en todos los lados y la altura mínima a `calc(100svh - 24px)`. Login, landing `/inicio` y página informativa `/registro` comparten esta composición; estas medidas no imponen dos columnas a futuras superficies.

La altura mínima permite crecer cuando los mensajes, el zoom o un viewport bajo lo requieren; el documento conserva el scroll necesario. No se fija una altura máxima ni se recorta el documento para forzar el encaje.

## Elevation & Depth

La profundidad combina el marco exterior del tema con un panel blanco y una sombra ambiental sutil. El formulario permanece blanco; el fondo de la escena se oscurece sutilmente con la mezcla de tinta del tema al 5%. Los campos claros y su borde distinguen la zona editable. No hay desplazamiento de controles ni elevación por hover.

### Shadow Vocabulary

- **Panel ambiental** (`0 12px 32px #292b3610`): separa suavemente el panel blanco del marco exterior.
- **Sombra ilustrada:** elipse SVG bajo la escultura, en el acento del ambiente con opacidad 0.08; no es una sombra CSS.

**The Subtle Scene Surface Rule.** Conservar el formulario blanco y la escena sombreada con la tinta del tema al 5%; el ambiente de color ocupa el marco exterior.

## Shapes

El panel compartido es rectangular, sin radios, borde ni recorte de tarjeta; la zona de escena recibe solo el fondo sutil del token `scene-surface`, sin aplicar opacidad al contenedor. Los controles conservan el radio `control`. Mensajes y control de visibilidad comparten curvas pequeñas; las acciones textuales mantienen un radio mínimo para el foco. Los campos tienen borde continuo de un píxel. La escultura combina círculo, arcos y una viga de extremos redondeados; no tiene rasgos humanos ni gesto de privacidad.

## Components

### Buttons

Acciones claras y cómodas, con una acción principal por formulario.

- **Primary:** fondo de acento, texto blanco, altura mínima 44 px y padding del token `button-primary`. Hover cambia al acento profundo.
- **Text:** recuperación y regreso, subrayados con separación de 3 px, sin fondo ni altura mínima impuesta.
- **Visibility:** icono SVG de ojo de 24 px dentro de un control de 44 × 44 px, colocado a 0 px del borde superior y 4 px del derecho del campo; fondo transparente y hover tonal. Su nombre accesible indica mostrar u ocultar y `aria-pressed` refleja el estado.
- **Focus / Disabled:** contorno de 2 px con separación de 3 px en botones, enlaces y campos; opacidad 0.6 durante la solicitud. Las transiciones cromáticas duran 160 ms con `ease`.

### Containers

Panel de ancho completo dentro del marco exterior del tema, con formulario blanco, sombra ambiental sutil y sin radios ni borde. La zona de escena sutilmente sombreada abarca ambas filas de escritorio y conserva padding de 40 px vertical y 24 px horizontal. En móvil ocupa la segunda fila, mide 124 px de altura y no tiene padding. Las demás distancias se describen en Layout.

### Inputs / Fields

Campos claros, altura 44 px, padding de 9 px vertical y 14 px horizontal, borde del ambiente y tinta oscura. Hover intensifica el borde; foco vuelve blanco el fondo y añade el contorno visible. El cursor de escritura adopta el acento. El campo de contraseña reserva 56 px a la derecha para el ojo y mantiene su etiqueta externa. Los campos deshabilitados indican espera; el autocompletado conserva el fondo del campo.

### Navigation

Enlaces reales para cambiar de página; botones para acciones dentro del formulario. «Volver al inicio» dirige a `/inicio`, con flecha SVG de 16 px, texto secundario de 13 px en Nunito Sans, peso 700, estilo normal y altura mínima de 44 px. Hover cambia al acento y subraya; foco mantiene el contorno visible. El header permite envolver el enlace en pantallas estrechas. La landing muestra solo la marca; login y registro incluyen regreso al inicio.

El enlace principal «Iniciar sesión» dirige a `/`, conserva los colores y radio del botón principal, padding de 9 px vertical y 18 px horizontal, altura mínima de 44 px y margen superior de 24 px. Centra su texto y no tiene subrayado; hover utiliza el acento profundo.

En el login, recuperación, registro y nota de invitación se agrupan bajo la acción principal. Este bloque tiene una línea superior de 1 px en el color de borde del campo, padding superior de 24 px y texto centrado. La línea separa visualmente el botón del contenido de ayuda.

La entrada «¿No tienes cuenta? Regístrate aquí» usa párrafo de 14 px con margen superior de 24 px e inferior de 4 px, y enlace textual subrayado a `/registro`. Debajo, «El acceso es por invitación» usa 13 px sin margen. La página de registro explica que las invitaciones siguen en preparación: no contiene formulario ni crea cuentas. Su aviso usa fondo del ambiente, padding de 12 px y radio de 8 px. La landing informa del propósito y el estado real del desarrollo.

### Feedback

Mensajes de error y éxito de 14 px con padding de 12 px y superficie semántica. Error usa `role="alert"`; confirmación y carga usan `role="status"`. El color acompaña un mensaje explícito en español.

### Balance Scene

Escultura geométrica original SVG decorativa, sin foco y oculta a la lectura asistida. No recibe props ni datos del formulario. Una base semicircular sostiene una viga de papel con dos piezas en el acento suave y la tinta del ambiente. Ocho puntos, dos rombos y un signo de suma en el acento del tema se dibujan detrás de la escultura. En escritorio mide hasta 480 px; en móvil, 144 px.

La viga rota alrededor de `210px 245px`: parte en −8°, pasa por 4° al 40% y −2° al 70%, y llega a 0° al 100%. La animación usa cuatro segundos, una iteración, `cubic-bezier(0.16, 1, 0.3, 1)` y `both`; después permanece quieta. Los detalles esperan cuatro segundos y ejecutan un único pulso de 900 ms con la misma curva y `both`, alrededor de `210px 180px`: opacidad 0.22 y escala 1 al inicio y al final; opacidad 0.5 y escala 1.035 al 45%. A los 4.9 segundos toda la escena queda en reposo. Con movimiento reducido, animaciones y transiciones se desactivan, la viga permanece horizontal y los detalles conservan opacidad 0.22 y escala 1. La escena se conserva al cambiar entre acceso y recuperación; no reacciona al ojo de contraseña. No hay vídeo externo.

## Do's and Don'ts

### Do:

- **Do** conservar los roles cromáticos al alternar violeta, durazno y aqua.
- **Do** usar Libre Baskerville Italic local en marca y título, y Nunito Sans local en campos y textos funcionales.
- **Do** mantener etiquetas visibles, foco destacado y mensajes explícitos.
- **Do** respetar movimiento reducido en controles y escultura.
- **Do** mantener la escena decorativa y separada del estado del formulario.

### Don't:

- **Don't** cambiar el ambiente al pasar entre acceso y recuperación.
- **Don't** añadir movimiento continuo después de la secuencia de balanceo y pulso de 4.9 segundos.
- **Don't** entregar contraseñas ni estado de visibilidad a la escena.
- **Don't** presentar dashboard, Google o registro por invitación como funciones disponibles.
