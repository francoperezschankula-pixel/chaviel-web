# Bajar fotos y videos de Instagram

Sirve para traer las fotos y videos de las últimas publicaciones de una cuenta
de Instagram y después pasarlas al catálogo de la web.

**Importante:** esto hay que correrlo desde tu computadora, no desde la web de
Claude. Instagram bloquea las conexiones que vienen de servidores y responde
"iniciá sesión" o error 429, así que desde ahí no se puede.

---

## 1. Instalar lo necesario (una sola vez)

Necesitás Python instalado. Después, en una terminal:

```
pip install instaloader
```

En Windows, si `pip` no anda, probá:

```
py -m pip install instaloader
```

---

## 2. Bajar las publicaciones

Parate en la carpeta del proyecto y corré:

```
python3 herramientas/descargar-instagram.py lux.sportt -n 15 -u TU_USUARIO_DE_INSTAGRAM
```

- `lux.sportt` es la cuenta de la que querés bajar.
- `-n 15` son cuántas publicaciones, desde la más nueva hacia atrás.
- `-u TU_USUARIO_DE_INSTAGRAM` es **tu** usuario. Te va a pedir la contraseña la
  primera vez y guarda la sesión, así no la pide de nuevo.

Sin `-u` casi seguro falla: hoy Instagram no deja ver perfiles sin estar logueado.

Otras opciones:

```
--sin-videos          baja solamente las fotos
-d otra/carpeta       cambia dónde se guardan (por defecto: descargas-instagram/)
```

Todo queda en `descargas-instagram/lux.sportt/`, con las fotos, los videos y un
`.txt` por publicación con el texto que tenía el post.

---

## 3. Pasarlas al catálogo

1. Elegí las fotos que quieras y copialas a la carpeta `img/`.
2. Renombralas con el formato `SKU_XXX_1.jpg`, `SKU_XXX_2.jpg`, etc.
3. Abrí `Chaviel Shopp.dc.html`, buscá la lista `PRODUCTOS` (cerca de la línea 490)
   y agregá una línea nueva copiando el formato de las que ya están:

   ```js
   { sku:"SKU_007", nombre:"Buzo Nike", categoria:"Buzos", talle:"M", calce:null,
     estado:"10/10", precio:30000, oferta:false, estado_stock:"disponible",
     fotos:["img/SKU_007_1.jpg"] },
   ```

Si me pasás las fotos ya bajadas, te las renombro y te cargo los productos yo.

---

## Si falla

| Mensaje | Qué hacer |
|---|---|
| `429 Too Many Requests` | Esperá unos minutos y volvé a intentar. Si sigue, usá `-u TU_USUARIO`. |
| `La cuenta es privada` | Seguí la cuenta con tu usuario y volvé a correrlo con `-u`. |
| `No se pudo iniciar sesión` | Entrá a Instagram desde el navegador, confirmá el aviso de "inicio de sesión sospechoso" y reintentá. |
| `Falta la librería instaloader` | Volvé al paso 1. |

---

## Una aclaración

Si la cuenta no es tuya, las fotos son de quien las publicó. Para usarlas en la
web conviene tener el OK de esa persona, sobre todo si son fotos de producto que
después van a estar a la venta.
