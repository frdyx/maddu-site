#!/usr/bin/env bash
#
# Build maddu-site and deploy it to Loopia over SSH.
#
# Builds the Astro site, streams the output as a tarball into a fresh staging
# dir on the server, then atomically swaps it into place (near-zero downtime,
# stale files removed). No rsync needed (tar + ssh only).
#
# Target is driven by deploy.env:
#   REMOTE_SUBDIR empty -> publishes to $REMOTE_SITE/public_html (web root)
#   REMOTE_SUBDIR=foo   -> publishes to $REMOTE_SITE/public_html/foo
#
# Auth: ssh-agent (key loaded once per reboot via ~/.bashrc). No passwords here.
#
# Usage:
#   ./deploy.sh            # build + deploy
#   NOBUILD=1 ./deploy.sh  # skip the build, deploy the existing dist/
#   DRYRUN=1 ./deploy.sh   # build only, show what would upload, send nothing

set -euo pipefail
cd "$(dirname "$0")"

# Stop Git Bash (MSYS) from rewriting "/..." values into Windows paths,
# which otherwise corrupts the Astro base path during the build.
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'

[ -f deploy.env ] || { echo "deploy.env not found"; exit 1; }
# shellcheck disable=SC1091
source deploy.env

DEPLOY_URL="$SITE_URL${BASE_PATH:-}"

# --- build -----------------------------------------------------------------
if [ "${NOBUILD:-0}" != "1" ]; then
    echo "Building (site=$SITE_URL base=${BASE_PATH:-/}) ..."
    if [ -n "${BASE_PATH:-}" ] && [ "$BASE_PATH" != "/" ]; then
        MADDU_SITE="$SITE_URL" MADDU_BASE="$BASE_PATH" $BUILD_CMD
    else
        # Web-root build: leave base at the Astro default "/".
        MADDU_SITE="$SITE_URL" $BUILD_CMD
    fi
fi

# --- preflight -------------------------------------------------------------
if [ ! -d "$LOCAL_SRC" ] || [ -z "$(ls -A "$LOCAL_SRC" 2>/dev/null)" ]; then
    echo "Build output '$LOCAL_SRC' missing or empty - aborting."; exit 1
fi

# Resolve the remote parent dir + the folder name we swap atomically.
if [ -n "${REMOTE_SUBDIR:-}" ]; then
    REMOTE_PARENT="$REMOTE_SITE/public_html"
    SWAP_NAME="$REMOTE_SUBDIR"
else
    REMOTE_PARENT="$REMOTE_SITE"
    SWAP_NAME="public_html"
fi

echo "Source : $LOCAL_SRC/ ($(find "$LOCAL_SRC" -type f | wc -l) files)"
echo "Target : $SSH_HOST:~/$REMOTE_PARENT/$SWAP_NAME"
echo "URL    : $DEPLOY_URL"

if [ "${DRYRUN:-0}" = "1" ]; then
    echo "--- DRYRUN: files that would be uploaded ---"
    find "$LOCAL_SRC" -type f | sed "s#^$LOCAL_SRC/#  #"
    exit 0
fi

# --- deploy: stream tarball, extract to staging, atomic swap ---------------
echo "Uploading..."
tar czf - -C "$LOCAL_SRC" . | ssh "$SSH_HOST" "
    set -e
    cd ~/$REMOTE_PARENT
    rm -rf '$SWAP_NAME.new' '$SWAP_NAME.old'
    mkdir '$SWAP_NAME.new'
    tar xzf - -C '$SWAP_NAME.new'
    [ -d '$SWAP_NAME' ] && mv '$SWAP_NAME' '$SWAP_NAME.old' || true
    mv '$SWAP_NAME.new' '$SWAP_NAME'
    rm -rf '$SWAP_NAME.old'
"

echo "Done. Live at $DEPLOY_URL/"
