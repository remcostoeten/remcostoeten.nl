#!/bin/bash

# optimize-media.sh - Media optimization script using ffmpeg
# Usage: ./optimize-media.sh <file_path> [max_width]
# Example: ./optimize-media.sh ./public/images/demo.gif 1200

FILE_PATH="$1"
MAX_WIDTH="${2:-1200}"

if [ -z "$FILE_PATH" ]; then
    echo "Usage: $0 <file_path> [max_width]"
    exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found: $FILE_PATH"
    exit 1
fi

FILENAME=$(basename "$FILE_PATH")
DIRNAME=$(dirname "$FILE_PATH")
EXTENSION="${FILENAME##*.}"
BASENAME="${FILENAME%.*}"
OUTPUT_PATH="$DIRNAME/$BASENAME.webp"

# Check for ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed."
    echo "Install it via 'sudo apt install ffmpeg' or 'brew install ffmpeg'"
    exit 1
fi

echo "Optimizing $FILENAME..."
echo "Max width: $MAX_WIDTH px"

# Determine file type and optimize
case "${EXTENSION,,}" in
    gif)
        # Convert GIF to animated WebP
        # -loop 0: Loop forever
        # -vf scale: Resize maintaining aspect ratio
        # -q:v 80: Quality factor
        ffmpeg -i "$FILE_PATH" \
            -vf "scale='min($MAX_WIDTH,iw)':-1:flags=lanczos" \
            -vcodec libwebp -lossless 0 -compression_level 6 \
            -q:v 75 -loop 0 -preset default -an -vsync 0 \
            -y "$OUTPUT_PATH"
        ;;
    png|jpg|jpeg|tiff|bmp)
        # Convert Image to static WebP
        ffmpeg -i "$FILE_PATH" \
            -vf "scale='min($MAX_WIDTH,iw)':-1:flags=lanczos" \
            -c:v libwebp -quality 80 \
            -y "$OUTPUT_PATH"
        ;;
    *)
        echo "Error: Unsupported file format .$EXTENSION"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    ORIGINAL_SIZE=$(du -h "$FILE_PATH" | cut -f1)
    NEW_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
    echo "✅ Success!"
    echo "Output: $OUTPUT_PATH"
    echo "Size: $ORIGINAL_SIZE -> $NEW_SIZE"
else
    echo "❌ Failed to convert $FILENAME"
    exit 1
fi
