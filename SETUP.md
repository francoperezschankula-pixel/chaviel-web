# CHAVIEL SHOPP — puesta en marcha

Dos pasos: primero el backend gratis (Google), después subir la web a Vercel.

---

## 1. Backend con Google Apps Script

Sirve para tres cosas: guardar cada pedido, recibir el comprobante y marcar las prendas
como vendidas para todos los que entren a la web. Es gratis y no necesita servidor.

1. Entrá a **drive.google.com** y creá una carpeta nueva, por ejemplo `Comprobantes Chaviel`.
   Abrila y copiá el ID de la URL: `drive.google.com/drive/folders/`**`ESTA_PARTE`**.

2. Creá una **hoja de cálculo** nueva (sheets.new). Ponele `Pedidos Chaviel`.

3. En la hoja: menú **Extensiones → Apps Script**.

4. Borrá lo que haya y pegá todo el contenido de `codigo-apps-script.gs`.

5. En la primera línea del código, reemplazá `PEGAR_ID_DE_CARPETA` por el ID del paso 1.

6. Botón **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Implementar → aceptar los permisos que pide.

7. Copiá la **URL de la aplicación web** (termina en `/exec`).

8. Abrí `Chaviel Shopp.dc.html`, buscá la línea:

   ```js
   const API_URL = "";
   ```

   y pegá la URL adentro de las comillas.

Listo. Desde ahí:
- Cada pedido cae como fila en la planilla.
- El comprobante se guarda en la carpeta de Drive, con el link en la fila.
- La prenda queda `Vendido🚫` para todos.
- Te llega un WhatsApp con el aviso de la venta (cliente, prenda, entrega y link al comprobante).

> El aviso por WhatsApp sale de la variable `AVISO_WHATSAPP` que está arriba de todo del código.
> Ya viene configurada. Si alguna vez querés apagarla, dejala vacía: `var AVISO_WHATSAPP = '';`

Para volver a poner una prenda a la venta, escribí `cancelado` en la columna **Estado** de esa fila.

---

## 2. Subir a Vercel

La web es estática, no necesita build.

1. Descargá el proyecto completo (botón de descarga del chat) y descomprimilo.
   Tienen que estar: `index.html`, `Chaviel Shopp.dc.html`, `support.js` y la carpeta `img/`.

2. Entrá a **vercel.com**, iniciá sesión y elegí **Add New → Project → Deploy**.
   Si no usás Git, arrastrá la carpeta en la opción de subida directa
   (o instalá la CLI: `npm i -g vercel`, entrá a la carpeta y corré `vercel`).

3. Sin framework, sin build command, output directory: la raíz.

4. Deploy. Te queda una URL tipo `chaviel-shopp.vercel.app`.

El link que manda el bot para cada prenda es:

```
https://TU-DOMINIO.vercel.app/#/p/SKU_001
```

Los SKU tienen que ser los mismos que los del catálogo del bot.

---

## 3. Cargar prendas

En `Chaviel Shopp.dc.html`, arriba de todo del bloque de código, está el array `CATALOGO`.
Agregar una prenda es copiar y pegar un bloque:

```js
{ sku:"SKU_008", nombre:"Campera Nike", categoria:"Camperas", talle:"M",
  calce:"va para un L", estado:"10/10", precio:45000, oferta:false,
  estado_stock:"disponible", fotos:["img/SKU_008_1.jpg","img/SKU_008_2.jpg"] },
```

- Las fotos van en la carpeta `img/` con ese mismo nombre.
- `estado_stock`: `"disponible"`, `"vendido"` o `"señado"`.
- `calce` es opcional.
- En zapatillas la web escribe **Talla**; en el resto, **Talle**.

## 4. Otros ajustes

- **Alias de transferencia**: buscá `ch.shopp77` en el archivo.
- **Dirección de retiro**: buscá `Albatros 14, casa 313`.
- **Día del próximo drop**: función `proximoDrop()` — hoy apunta al viernes 20:00.
