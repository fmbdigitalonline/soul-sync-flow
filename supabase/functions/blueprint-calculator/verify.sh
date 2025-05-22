
#!/bin/bash
# Script to verify WASM file loading and test Swiss Ephemeris

echo "=== Swiss Ephemeris WASM Setup Verification ==="
echo

# Check environment variables
echo "1. Environment Configuration:"
echo "   WASM_SOURCE: ${WASM_SOURCE:-'not set'}"
echo "   WASM_BUCKET: ${WASM_BUCKET:-'not set'}"
echo "   WASM_OBJECT_PATH: ${WASM_OBJECT_PATH:-'not set'}"
echo "   SUPABASE_PROJECT: ${SUPABASE_PROJECT:-'not set'}"

# Check if astro.wasm file exists locally
echo
echo "2. Checking for WASM files:"
WASM_PATHS=(
  "./sweph/astro.wasm"
  "../_shared/sweph/astro.wasm"
)

for WASM_PATH in "${WASM_PATHS[@]}"; do
  if [ -f "$WASM_PATH" ]; then
    SIZE=$(du -h "$WASM_PATH" | cut -f1)
    echo "   ✅ Found: $WASM_PATH ($SIZE)"
    echo "      Full path: $(realpath "$WASM_PATH")"
  else
    echo "   ❌ Not found: $WASM_PATH"
  fi
done

# Check storage URL
if [ -n "$SUPABASE_PROJECT" ] && [ -n "$WASM_BUCKET" ] && [ -n "$WASM_OBJECT_PATH" ]; then
  STORAGE_URL="https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/${WASM_BUCKET}/${WASM_OBJECT_PATH}"
  echo
  echo "3. Testing Storage URL:"
  echo "   URL: $STORAGE_URL"
  
  # Check if curl is available
  if command -v curl &> /dev/null; then
    CURL_RESULT=$(curl -s -I "$STORAGE_URL")
    HTTP_STATUS=$(echo "$CURL_RESULT" | grep HTTP | awk '{print $2}')
    
    if [ "$HTTP_STATUS" == "200" ]; then
      CONTENT_TYPE=$(echo "$CURL_RESULT" | grep -i "content-type" | awk '{print $2}')
      CONTENT_LENGTH=$(echo "$CURL_RESULT" | grep -i "content-length" | awk '{print $2}')
      CONTENT_LENGTH_KB=$((CONTENT_LENGTH / 1024))
      
      echo "   ✅ URL accessible: HTTP $HTTP_STATUS"
      echo "      Content-Type: $CONTENT_TYPE"
      echo "      Size: $CONTENT_LENGTH_KB KB"
      
      if [ $CONTENT_LENGTH_KB -ge 630 ] && [ $CONTENT_LENGTH_KB -le 650 ]; then
        echo "      ✅ Correct size range for Emscripten build"
      else
        echo "      ⚠️ WARNING: Size outside expected range (630-650 KB) - may be wrong build"
      fi
    else
      echo "   ❌ URL not accessible: HTTP $HTTP_STATUS"
      echo "      This usually means either:"
      echo "      - The bucket doesn't exist"
      echo "      - The file doesn't exist in the bucket"
      echo "      - The bucket isn't public"
    fi
  else
    echo "   ⚠️ Cannot test URL - curl not available"
  fi
fi

# Run a test
echo
echo "4. Running ephemeris test calculation:"
DENO_DIR=.deno_dir deno run --allow-net --allow-read --allow-env ./test-verification.ts \
  | grep -E 'engine_used|all_passed|passed_tests|failed_tests'

echo
echo "Verification complete."
