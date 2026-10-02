#!/usr/bin/env bash
# Baut lokal (Typprüfung), sichert die Container-Logs, überträgt per rsync, baut auf dem Server neu
# und prüft, ob die ausgelieferte Version der lokalen entspricht. Konfiguration kommt aus .env.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then echo "Fehlt: .env (siehe .env.example)" >&2; exit 1; fi
set -a; source .env; set +a
: "${APP_HOST:?}" "${DEPLOY_HOST:?}" "${DEPLOY_PATH:?}" "${CONTAINER:?}"

echo "→ Lokaler Build und Tests"
npm test
npm run build

echo "→ Container-Logs sichern (docker logs überlebt einen Neustart nicht)"
mkdir -p logs
ssh "$DEPLOY_HOST" "docker logs $CONTAINER 2>&1" > "logs/${CONTAINER}-docker-log_$(date +%Y-%m-%d_%H%M).txt" || echo "  (noch kein Container – erstes Deployment?)"

echo "→ Übertragen"
ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_PATH'"
rsync -az --delete \
  --exclude node_modules --exclude dist --exclude .git --exclude logs \
  --exclude .claude --exclude CLAUDE.local.md \
  ./ "$DEPLOY_HOST:$DEPLOY_PATH/"

echo "→ Neu bauen und starten"
ssh "$DEPLOY_HOST" "cd '$DEPLOY_PATH' && docker compose up -d --build"

echo "→ Prüfen (direkt nach dem Neustart liefert Traefik kurz 404)"
local_asset=$(grep -o 'index-[A-Za-z0-9_-]*\.js' dist/index.html | head -1)
for attempt in 1 2 3 4 5 6; do
  sleep 10
  live_asset=$(curl -fsS "https://$APP_HOST/" 2>/dev/null | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1 || true)
  if [[ "$live_asset" == "$local_asset" && -n "$live_asset" ]]; then
    echo "✓ https://$APP_HOST/ liefert $live_asset (identisch mit dem lokalen Build)"
    exit 0
  fi
  echo "  Versuch $attempt: live='${live_asset:-–}' lokal='$local_asset'"
done
echo "✗ Die ausgelieferte Version stimmt nicht überein – bitte manuell prüfen." >&2
exit 1
