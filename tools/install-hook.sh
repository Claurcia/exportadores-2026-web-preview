#!/bin/sh
# Instala el hook pre-commit que estampa la versión de caché (tools/version.py) antes de cada commit.
# Uso: sh tools/install-hook.sh   (una vez por clon)
ROOT="$(git rev-parse --show-toplevel)"
cat > "$ROOT/.git/hooks/pre-commit" <<'HOOK'
#!/bin/sh
# Cache busting: nueva versión en css/js/imágenes enlazados por el HTML en cada commit
cd "$(git rev-parse --show-toplevel)" || exit 1
python tools/version.py && git add index.html galeria.html inscripcion.html
HOOK
chmod +x "$ROOT/.git/hooks/pre-commit"
echo "hook pre-commit instalado en $ROOT/.git/hooks/pre-commit"
