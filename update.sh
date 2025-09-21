#!/bin/bash

# Update-Script für n8n-nodes-paperless-ngx in Production

echo "🔄 Starting update for n8n-nodes-paperless-ngx..."

# Wechsle in das Plugin-Verzeichnis
cd /opt/n8n/custom-nodes/n8n-nodes-paperless-ngx || {
    echo "❌ Plugin directory not found. Please adjust the path in the script."
    echo "Current directory: $(pwd)"
    exit 1
}

# Sichere lokale Änderungen
echo "💾 Stashing local changes..."
git stash

# Stelle sicher, dass das Verzeichnis als sicher markiert ist
git config --global --add safe.directory /opt/n8n/custom-nodes/n8n-nodes-paperless-ngx

# Hole die neuesten Änderungen
echo "📥 Pulling latest changes..."
git pull origin master

# Entferne alte Build-Artefakte
echo "🧹 Cleaning old build artifacts..."
rm -rf dist node_modules package-lock.json

# Stelle sicher, dass pnpm verfügbar ist
echo "🧰 Ensuring pnpm is available..."
if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD="pnpm"
else
    if command -v corepack >/dev/null 2>&1; then
        echo "🧩 Activating pnpm via corepack..."
        corepack enable >/dev/null 2>&1 || true
        corepack prepare pnpm@10.17.0 --activate >/dev/null 2>&1 || true
        PNPM_CMD="pnpm"
    else
        echo "⬇️ Installing pnpm globally via npm..."
        npm i -g pnpm >/dev/null 2>&1 || {
            echo "❌ Could not install pnpm. Please install pnpm and re-run."
            exit 1
        }
        PNPM_CMD="pnpm"
    fi
fi

# PNPM-Store bereinigen (optional)
echo "🗑️ Pruning pnpm store..."
$PNPM_CMD store prune || true

# Installiere Dependencies neu (pnpm)
echo "📦 Installing dependencies (pnpm)..."
$PNPM_CMD install --frozen-lockfile=false

# Baue das Plugin
echo "🔨 Building plugin (pnpm)..."
$PNPM_CMD run build

# Prüfe ob Build erfolgreich war
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"

    # Setze die Berechtigungen (falls nötig)
    echo "🔐 Setting permissions..."
    chown -R n8n:n8n /opt/n8n/custom-nodes/n8n-nodes-paperless-ngx 2>/dev/null || echo "⚠️ Could not set permissions (running as non-root?)"

    # Stelle sicher, dass die n8n-Konfiguration korrekt ist
    if [ -f "/home/n8n/.n8n/.env" ]; then
        if ! grep -q "N8N_CUSTOM_EXTENSIONS" /home/n8n/.n8n/.env; then
            echo "N8N_CUSTOM_EXTENSIONS=\"/opt/n8n/custom-nodes\"" >> /home/n8n/.n8n/.env
            echo "📝 Added N8N_CUSTOM_EXTENSIONS to .env"
        fi
    fi

    # Starte n8n neu (verschiedene Methoden probieren)
    echo "🔄 Restarting n8n..."
    if systemctl is-active --quiet n8n; then
        systemctl restart n8n
        echo "✅ n8n restarted via systemctl"
    elif docker-compose ps n8n >/dev/null 2>&1; then
        docker-compose restart n8n
        echo "✅ n8n restarted via docker-compose"
    elif docker ps --filter name=n8n >/dev/null 2>&1; then
        docker restart n8n
        echo "✅ n8n restarted via docker"
    else
        echo "⚠️ Could not automatically restart n8n. Please restart manually."
    fi

    # Zeige die letzten Logs (falls verfügbar)
    echo "📋 Showing last 20 logs:"
    if journalctl -u n8n -n 20 >/dev/null 2>&1; then
        journalctl -u n8n -n 20
    else
        echo "⚠️ Could not access system logs"
    fi

    echo "🎉 Update completed successfully!"

else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
