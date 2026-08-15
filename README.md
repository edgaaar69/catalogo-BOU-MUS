# Catálogo BOU&MUS

Este proyecto funciona con HTML, CSS y JavaScript, sin Python ni instalaciones especiales.

## Archivos principales

- `index.html`: estructura visible de la página.
- `styles.css`: diseño, versión móvil, cambio de foto y modal.
- `productos.js`: los 39 productos y sus variantes, generados desde el Excel oficial.
- `app.js`: búsqueda, filtros, tallas, modal, precios y WhatsApp.
- `imagenes/`: tres fotografías por producto.

## Cómo abrirlo

Abre la carpeta completa en Visual Studio Code y usa **Open with Live Server** sobre `index.html`.

## Fotos de cada producto

Cada carpeta debe contener exactamente estos nombres:

```text
01-frente.jpeg
02-modelo.jpeg
03-detalle.jpeg
```

## Número de WhatsApp

En `app.js`, al inicio, cambia esta línea:

```js
const WHATSAPP_NUMBER = "";
```

Escribe el número con lada de país, solo con números. Ejemplo de México:

```js
const WHATSAPP_NUMBER = "5215512345678";
```

Si se deja vacío, el botón abre WhatsApp y permite elegir el contacto.

## Agregar productos después

No copies tarjetas en `index.html`. Agrega el producto al Excel oficial, prepara su carpeta con las tres fotos y vuelve a generar `productos.js`. Así la misma estructura puede manejar decenas o cientos de productos.
