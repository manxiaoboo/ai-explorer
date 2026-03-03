#!/bin/bash
# Upload local logos to Vercel Blob
# Usage: ./scripts/upload-logos-to-blob.sh

set -e

cd "$(dirname "$0")/.."

echo "🚀 Uploading logos to Vercel Blob..."

# Check if BLOB_READ_WRITE_TOKEN is set
if [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
  echo "❌ Error: BLOB_READ_WRITE_TOKEN is not set"
  echo "   Get it from: https://vercel.com/dashboard/stores"
  exit 1
fi

# Upload each logo
for file in public/logos/*.{png,jpg,jpeg,svg}; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "📤 Uploading: $filename"
    
    # Use Vercel Blob REST API
    curl -X PUT \
      "https://blob.vercel-storage.com/logos/$filename" \
      -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
      -H "Content-Type: $(file -b --mime-type "$file")" \
      --data-binary "@$file"
    
    echo " ✅ Done"
  fi
done

echo ""
echo "✅ All logos uploaded!"
echo ""
echo "Update your .env.local with:"
echo "NEXT_PUBLIC_CDN_URL=https://blob.vercel-storage.com"
