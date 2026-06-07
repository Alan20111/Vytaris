# Vytaris — Perfil médico de emergencia en QR

> *"Más vale prevenir un segundo, que lamentar una eternidad."*

Vytaris es una aplicación web que genera un **perfil médico de emergencia codificado dentro de un código QR**. La idea es imprimir ese QR en un llavero: cualquier persona (paramédico, transeúnte) puede escanearlo con la cámara de su teléfono y ver de inmediato la información vital del portador.

**La clave de privacidad:** los datos **no se envían a ningún servidor ni se almacenan en ninguna base de datos**. Toda la información viaja codificada dentro de la propia URL del QR, así que solo existe en el código impreso que el usuario lleva consigo.

## 🔗 En vivo

**https://vytaris.vercel.app**

## ¿Qué hace?

- Formulario para capturar datos médicos: nombre, fecha de nacimiento, código postal, contacto de emergencia, tipo de sangre, alergias y enfermedades crónicas.
- Codifica toda esa información en una URL y genera el código QR en el navegador.
- Permite **descargar el QR como imagen `.png`** lista para imprimir.
- Al escanear el QR se abre una vista de solo lectura con la información de emergencia.
- 100 % offline-friendly: funciona sin registro, sin login y sin conexión a un backend.

## 🛠️ Stack

- **HTML5** semántico (íconos SVG embebidos).
- **CSS3** (diseño responsivo, variables, tema azul `#1A56B2`).
- **JavaScript vanilla** (sin framework).
- **[qrcodejs](https://github.com/davidshimjs/qrcodejs)** vía CDN para la generación del QR.
- Codificación de datos en la URL con `TextEncoder` + Base64.
- **Despliegue:** Vercel (sitio estático).

## ▶️ Cómo ejecutarlo en local

Al ser un sitio estático no necesita build ni dependencias. Basta con servir la carpeta:

```bash
# Opción 1: con Python
python3 -m http.server 8000

# Opción 2: con Node
npx serve .
```

Luego abre `http://localhost:8000` en el navegador.

## 📁 Estructura

```
index.html                         # Estructura de la app
style.css                          # Estilos
script.js                          # Lógica: formulario, codificación y QR
logo.png                           # Logo
Vytaris_Documentacion_Tecnica.pdf  # Documentación técnica
```

## 👤 Autor

**Alan Daniel Méndez Jiménez** — Ing. en Sistemas Computacionales, TecNM Celaya.
GitHub: [@Alan20111](https://github.com/Alan20111)
