#!/bin/sh
# Double-click to serve the guide to this Mac and to your phone on the same Wi-Fi.
exec "$(dirname "$0")/serve.sh" --phone
