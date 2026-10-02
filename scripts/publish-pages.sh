#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
REMOTE="${1:-origin}"
BRANCH="${PAGES_BRANCH:-gh-pages}"
SITE_DIR="$(mktemp -d)"
cleanup() { rm -rf "$SITE_DIR"; }
trap cleanup EXIT

cd "$ROOT"
npm run build
REMOTE_URL="$(git remote get-url "$REMOTE")"
if git ls-remote --exit-code --heads "$REMOTE_URL" "$BRANCH" >/dev/null 2>&1; then
  git clone --single-branch --branch "$BRANCH" "$REMOTE_URL" "$SITE_DIR"
else
  git -C "$SITE_DIR" init --initial-branch="$BRANCH"
  git -C "$SITE_DIR" remote add origin "$REMOTE_URL"
fi

find "$SITE_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf -- {} +
cp -a "$ROOT/dist/." "$SITE_DIR/"
touch "$SITE_DIR/.nojekyll"
git -C "$SITE_DIR" add --all
if ! git -C "$SITE_DIR" diff --cached --quiet; then
  git -C "$SITE_DIR" -c user.name="$(git config user.name)" \
    -c user.email="$(git config user.email)" \
    commit -m "Deploy Ampdeck to GitHub Pages"
  git -C "$SITE_DIR" push --set-upstream origin "$BRANCH"
else
  echo "Pages output is already up to date."
fi
