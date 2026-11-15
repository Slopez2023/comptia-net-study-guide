#!/bin/sh
# Serve the guide at http://localhost:8742 (YouTube embeds need http, not file://).
#   ./serve.sh          this Mac only
#   ./serve.sh --phone  also reachable from your phone on the same Wi-Fi
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8742}"
BIND=127.0.0.1
if [ "$1" = "--phone" ]; then
  BIND=0.0.0.0
  IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
  echo "On your phone (same Wi-Fi): http://$IP:$PORT/"
fi
( sleep 1; open "http://localhost:$PORT/" 2>/dev/null ) &
echo "Network+ guide → http://localhost:$PORT/  (Ctrl+C to stop)"
exec python3 -m http.server "$PORT" --bind "$BIND" --directory "$(pwd)"
