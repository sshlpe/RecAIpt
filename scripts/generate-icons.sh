#!/bin/sh
# Genera los PNG de la PWA desde src/app/icon.svg (fuente única del logo).
# Requiere macOS (qlmanage y sips). Correr después de cambiar el SVG:  sh scripts/generate-icons.sh
#
# Los PNG van sin esquinas redondeadas: iOS y Android aplican su propio recorte. El dibujo
# cabe en la zona segura de los íconos "maskable" (círculo de 80% del lado).
set -e
TMP_DIR=$(mktemp -d)
sed 's/ rx="112" fill="#0b1a33"/ fill="#0b1a33"/' src/app/icon.svg > "$TMP_DIR/full-bleed.svg"
qlmanage -t -s 512 -o "$TMP_DIR" "$TMP_DIR/full-bleed.svg" > /dev/null
SOURCE_PNG="$TMP_DIR/full-bleed.svg.png"
sips -Z 512 "$SOURCE_PNG" --out public/icon-512.png > /dev/null
sips -Z 192 "$SOURCE_PNG" --out public/icon-192.png > /dev/null
sips -Z 180 "$SOURCE_PNG" --out src/app/apple-icon.png > /dev/null
rm -rf "$TMP_DIR"
echo "Íconos generados: public/icon-512.png, public/icon-192.png, src/app/apple-icon.png"
