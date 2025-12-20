# Configuration (defaults to your site, can be overridden by env)
SITE_URL="${REMCO_SITE_URL:-https://remcostoeten.nl}"
# Reads secret from environment (set this in your .zshrc/.bashrc/etc)
API_SECRET="${CRON_SECRET}"

if [ -z "$API_SECRET" ]; then
  echo "⚠️  CRON_SECRET is not set."
  read -p "❓ Would you like to set it now for this session? (y/n): " confirm
  if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
     read -sp "Enter CRON_SECRET: " user_secret
     echo
     API_SECRET="$user_secret"
     export CRON_SECRET="$user_secret"
  else
    echo "❌ Skipping sync."
    exit 0
  fi
fi


echo "🕒 [$(date)] Starting Activity Sync for $SITE_URL..."

# Trigger the sync via POST (added -L to follow redirects)
RESPONSE=$(curl -s -L -X POST "$SITE_URL/api/sync" \
  -H "Authorization: Bearer $API_SECRET" \
  -H "Content-Type: application/json")


# Check if successful
if [[ $RESPONSE == *"\"success\":true"* ]]; then
  NEW_GH=$(echo $RESPONSE | grep -o '"newItems":[0-9]*' | head -1 | cut -d: -f2)
  NEW_SPOT=$(echo $RESPONSE | grep -o '"newItems":[0-9]*' | tail -1 | cut -d: -f2)
  echo "✅ Sync successful!"
  echo "📊 New items: GitHub ($NEW_GH), Spotify ($NEW_SPOT)"
else
  echo "❌ Sync failed!"
  echo "🔗 Response: $RESPONSE"
  exit 1
fi
