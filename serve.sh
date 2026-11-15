#!/bin/sh
# Serve the guide at http://localhost:8742 (YouTube embeds need http, not file://).
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8742}"
( sleep 1; open "http://localhost:$PORT/" 2>/dev/null ) &
echo "Network+ guide → http://localhost:$PORT/  (Ctrl+C to stop)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$(pwd)"
