#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

printf 'Paste the full YTM cookie header and press Enter:\n> '
IFS= read -r COOKIE

if [ -z "$COOKIE" ]; then
	echo 'No cookie provided, aborting.' >&2
	exit 1
fi

python3 - "$COOKIE" <<'PY'
import sys, re, pathlib
cookie = sys.argv[1].strip()
env = pathlib.Path('.env')
text = env.read_text()
pattern = re.compile(r'^YTM_COOKIE=.*$', re.M)
if pattern.search(text):
    text = pattern.sub(lambda _: f'YTM_COOKIE={cookie}', text)
else:
    text = text.rstrip('\n') + f'\nYTM_COOKIE={cookie}\n'
env.write_text(text)
print('Updated .env')
PY

vercel env rm YTM_COOKIE production --yes 2>/dev/null || true
vercel env add YTM_COOKIE production --value "$COOKIE" --yes
echo 'Pushed YTM_COOKIE to Vercel production.'

read -r -p 'Redeploy production now? [y/N] ' REPLY
if [ "$REPLY" = 'y' ] || [ "$REPLY" = 'Y' ]; then
	vercel redeploy --yes 2>/dev/null || vercel --prod
fi
