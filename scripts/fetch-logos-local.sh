#!/bin/bash
# Fetch real logos and upload to Vercel Blob
# Run this on your local machine with internet access

# Requirements: curl, jq, and BLOB_READ_WRITE_TOKEN set

set -e

echo "🚀 Fetching real logos for AI tools..."

# Create temp directory
mkdir -p /tmp/tool-logos

# List of tools with their logo URLs
# You can add more tools here
declare -A logos=(
  ["chatgpt"]='https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  ["claude"]='https://www.anthropic.com/images/claude-logo.svg'
  ["gemini"]='https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg'
  ["midjourney"]='https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg'
  ["github-copilot"]='https://github.githubassets.com/images/icons/copilot/copilot-128.png'
  ["notion"]='https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png'
  ["figma"]='https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
  ["canva"]='https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_logo_2021.svg'
  ["grammarly"]='https://www.grammarly.com/media/brand/logo/grammarly-logo.svg'
  ["jasper"]='https://www.jasper.ai/brand/logo.svg'
)

for tool in "${!logos[@]}"; do
  url="${logos[$tool]}"
  echo ""
  echo "📸 Downloading: $tool"
  
  # Download logo
  ext="${url##*.}"
  if [[ "$ext" == "svg" ]]; then
    output="/tmp/tool-logos/$tool.svg"
  else
    output="/tmp/tool-logos/$tool.png"
  fi
  
  if curl -sL "$url" -o "$output" --max-time 10; then
    echo "  ✅ Downloaded"
    
    # Upload to Vercel Blob
    content_type=$(file -b --mime-type "$output")
    echo "  📤 Uploading to Vercel Blob..."
    
    curl -X PUT \
      "https://blob.vercel-storage.com/logos/real/$tool-${ext}" \
      -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
      -H "Content-Type: $content_type" \
      -H "x-vercel-blob-add-random-suffix: false" \
      --data-binary "@$output" \
      -s | jq -r '.url'
    
    echo "  ✅ Uploaded"
  else
    echo "  ❌ Failed to download"
  fi
done

echo ""
echo "✅ Done! Check the URLs above and update your database."
echo ""
echo "To update database, run:"
echo "  npx prisma db execute --stdin <<'EOF'"
echo "  UPDATE \"Tool\" SET logo = 'https://...' WHERE name = 'ChatGPT';"
echo "  EOF"
