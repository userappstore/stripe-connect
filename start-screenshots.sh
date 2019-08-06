NODE_ENV=development \
DASHBOARD_SERVER="$CONNECT_DASHBOARD_SERVER" \
PORT=8200 \
ID_LENGTH=8 \
DOMAIN="${CONNECT_DOMAIN}" \
STRIPE_KEY="$CONNECT_STRIPE_KEY" \
STRIPE_PUBLISHABLE_KEY="$CONNECT_STRIPE_PUBLISHABLE_KEY" \
CONNECT_ENDPOINT_SECRET="$CONNECT_CONNECT_ENDPOINT_SECRET" \
STRIPE_JS="false" \
IP="0.0.0.0" \
STORAGE_PATH=/tmp/connect \
REQUIRE_PROFILE_EMAIL=true \
REQUIRE_PROFILE_NAME=true \
node main.js