#!/usr/bin/env python3
"""
Descarga las fotos y videos de las ultimas publicaciones de una cuenta de Instagram
y las deja ordenadas para pasarlas al catalogo de la web.

Uso rapido:
    pip install instaloader
    python3 herramientas/descargar-instagram.py lux.sportt

Ver instrucciones completas en herramientas/README.md
"""

import argparse
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO_POR_DEFECTO = RAIZ / "descargas-instagram"


def salir(mensaje, codigo=1):
    print(f"\n[ERROR] {mensaje}\n", file=sys.stderr)
    sys.exit(codigo)


def cargar_instaloader():
    try:
        import instaloader
    except ImportError:
        salir(
            "Falta la libreria instaloader. Instalala con:\n"
            "    pip install instaloader\n"
            "(en Windows puede ser: py -m pip install instaloader)"
        )
    return instaloader


def main():
    ap = argparse.ArgumentParser(
        description="Baja fotos y videos de las ultimas publicaciones de una cuenta de Instagram."
    )
    ap.add_argument("cuenta", help="Nombre de usuario, sin la arroba. Ej: lux.sportt")
    ap.add_argument("-n", "--cantidad", type=int, default=15,
                    help="Cuantas publicaciones bajar, de la mas nueva hacia atras (por defecto 15).")
    ap.add_argument("-u", "--usuario", default=None,
                    help="Tu usuario de Instagram para iniciar sesion. Instagram ya casi no "
                         "deja ver perfiles sin estar logueado, asi que conviene usarlo.")
    ap.add_argument("-d", "--destino", default=str(DESTINO_POR_DEFECTO),
                    help="Carpeta donde guardar. Por defecto: descargas-instagram/")
    ap.add_argument("--sin-videos", action="store_true",
                    help="Bajar solamente las fotos.")
    args = ap.parse_args()

    instaloader = cargar_instaloader()

    destino = Path(args.destino).expanduser().resolve()
    destino.mkdir(parents=True, exist_ok=True)

    L = instaloader.Instaloader(
        dirname_pattern=str(destino / "{profile}"),
        filename_pattern="{date_utc:%Y-%m-%d}_{shortcode}",
        download_pictures=True,
        download_videos=not args.sin_videos,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        post_metadata_txt_pattern="{caption}",
        compress_json=False,
    )

    if args.usuario:
        try:
            L.load_session_from_file(args.usuario)
            print(f"Sesion de '{args.usuario}' reutilizada.")
        except FileNotFoundError:
            print(f"Iniciando sesion como '{args.usuario}'...")
            try:
                L.interactive_login(args.usuario)
                L.save_session_to_file()
            except Exception as e:
                salir(f"No se pudo iniciar sesion: {e}")

    print(f"Buscando el perfil '{args.cuenta}'...")
    try:
        perfil = instaloader.Profile.from_username(L.context, args.cuenta)
    except Exception as e:
        salir(
            f"No se pudo abrir el perfil '{args.cuenta}': {e}\n"
            "Causas tipicas: la cuenta es privada y no la seguis, el nombre esta mal escrito, "
            "o Instagram pide iniciar sesion (volve a correr el comando agregando -u TU_USUARIO)."
        )

    if perfil.is_private and not perfil.followed_by_viewer:
        salir(
            f"La cuenta '{args.cuenta}' es privada y la sesion actual no la sigue. "
            "Segui la cuenta con tu usuario y volve a intentar con -u TU_USUARIO."
        )

    print(f"Perfil encontrado: {perfil.full_name or perfil.username} "
          f"({perfil.mediacount} publicaciones)")
    print(f"Bajando las ultimas {args.cantidad} a: {destino / perfil.username}\n")

    bajadas = 0
    for post in perfil.get_posts():
        if bajadas >= args.cantidad:
            break
        bajadas += 1
        tipo = "video" if post.is_video else ("carrusel" if post.typename == "GraphSidecar" else "foto")
        print(f"  {bajadas:>2}/{args.cantidad}  {post.shortcode}  ({tipo})")
        try:
            L.download_post(post, target=perfil.username)
        except Exception as e:
            print(f"      no se pudo bajar {post.shortcode}: {e}", file=sys.stderr)

    if bajadas == 0:
        salir("La cuenta no tiene publicaciones visibles.")

    carpeta = destino / perfil.username
    archivos = sorted(p for p in carpeta.iterdir() if p.suffix.lower() in
                      {".jpg", ".jpeg", ".png", ".webp", ".mp4"})

    print(f"\nListo: {bajadas} publicaciones, {len(archivos)} archivos en {carpeta}\n")
    print("Siguiente paso para sumarlos al catalogo de la web:")
    print("  1. Elegi las fotos que quieras y copialas a la carpeta img/ del proyecto.")
    print("  2. Renombralas con el formato SKU_XXX_1.jpg, SKU_XXX_2.jpg, etc.")
    print("  3. Agrega el producto en la lista PRODUCTOS de 'Chaviel Shopp.dc.html'.\n")
    for a in archivos[:40]:
        print(f"    {a.name}")
    if len(archivos) > 40:
        print(f"    ... y {len(archivos) - 40} archivos mas")


if __name__ == "__main__":
    main()
