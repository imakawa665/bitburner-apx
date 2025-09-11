#!/usr/bin/env bash
set -euo pipefail
REPO_NAME="${1:-bitburner-apx}"
GH_USER="${2:-your-github-username}"
REMOTE_URL="git@github.com:${GH_USER}/${REPO_NAME}.git"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required" >&2
  exit 1
fi

git init
git add .
git commit -m "Initial commit: bitburner-apx (Lily build)"
git branch -M main

if command -v gh >/dev/null 2>&1; then
  gh repo create "${GH_USER}/${REPO_NAME}" --public --source=. --remote=origin --push
else
  git remote add origin "${REMOTE_URL}"
  echo "Now create the repo ${REPO_NAME} on GitHub, then run:"
  echo "  git push -u origin main"
fi
