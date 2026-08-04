#! /bin/bash

set -eu

IMAGE_NAME="${1:-testpages}"

EXISTING=$(docker ps -q --filter "publish=5001")
if [ -n "$EXISTING" ]; then
  echo "Stopping container already using port 5001..."
  docker stop $EXISTING
fi

echo "Starting nginx in Docker image '$IMAGE_NAME'..."
echo "Add this to your /etc/hosts if not already present:"
echo "  127.0.0.1 local.testpages.adblockplus.org"
echo ""
echo "Then open: https://local.testpages.adblockplus.org:5001/en/"
echo "(Accept the self-signed certificate warning in your browser)"
echo ""

CONTAINER_ID=$(docker run -d --rm -p 5001:5001 --entrypoint bash "$IMAGE_NAME" -c '
  echo "127.0.0.1 $DOMAIN" >> /etc/hosts &&
  sed -i "s/listen 127.0.0.1:5001/listen 5001/" /etc/nginx/sites-enabled/testpages.conf &&
  nginx &&
  npm --prefix testpages.adblockplus.org run start-endpoints')

trap "echo ''; echo 'Stopping container...'; docker stop $CONTAINER_ID 2>/dev/null || true; trap - EXIT INT TERM" EXIT INT TERM

docker logs -f "$CONTAINER_ID"
