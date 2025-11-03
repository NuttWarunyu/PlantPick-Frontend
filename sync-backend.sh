#!/bin/bash

# Script สำหรับ sync backend code ไปที่ PlantPick-Backend repository

BACKEND_REPO="/tmp/PlantPick-Backend"
SOURCE_DIR="/Users/warunyu/PlantPick/backend"

echo "🔄 กำลัง sync backend code ไปที่ PlantPick-Backend..."

# Clone หรือ update repository
if [ -d "$BACKEND_REPO" ]; then
    echo "📥 Pulling latest changes..."
    cd "$BACKEND_REPO"
    git pull origin main
else
    echo "📥 Cloning repository..."
    cd /tmp
    git clone https://github.com/NuttWarunyu/PlantPick-Backend.git
    cd "$BACKEND_REPO"
fi

# Copy backend files
echo "📋 Copying backend files..."
cp -r "$SOURCE_DIR"/* backend/ 2>/dev/null || true

# Commit and push
echo "📤 Pushing changes..."
git add backend/
git commit -m "Sync backend code from PlantPick-Frontend: $(date +%Y-%m-%d\ %H:%M:%S)" || echo "No changes to commit"
git push origin main

echo "✅ Sync สำเร็จ!"
echo "🚂 Railway จะ auto-deploy อัตโนมัติ"

