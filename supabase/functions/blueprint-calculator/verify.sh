
#!/bin/bash
# Script to run ephemeris verification tests

echo "Starting Swiss Ephemeris verification tests..."

# Check if astro.wasm file exists
echo -e "\nChecking if WASM file exists..."
WASM_PATH="../_shared/sweph/astro.wasm"
if [ -f "$WASM_PATH" ]; then
  echo "✓ WASM file found at $WASM_PATH ($(ls -lh $WASM_PATH | awk '{print $5}'))"
else
  echo "✗ WASM file NOT found at $WASM_PATH"
  echo "Checking alternate locations..."
  find ../ -name "astro.wasm" | while read file; do
    echo "  Found at: $file"
  done
fi

# Start the local function server if not already running
if ! nc -z localhost 54321 >/dev/null 2>&1; then
  echo -e "\nStarting Supabase functions server..."
  supabase functions serve blueprint-calculator &
  SERVER_PID=$!
  sleep 3  # Give server time to start
else
  echo -e "\nSupabase functions server already running"
fi

# Run the basic smoke test with curl
echo -e "\n1. Running smoke test with curl..."
curl -s -X POST http://localhost:54321/functions/v1/blueprint-calculator \
     -H 'Content-Type: application/json' \
     -d '{"birthData":{"date":"1978-02-12","time":"22:00","location":"Paramaribo, Suriname","fullName":"Nikola Tesla"}}' \
     | jq '.humanDesign.type,
           .humanDesign.profile,
           .chineseZodiac.animal,
           .numerology.life_path_number,
           .calculation_metadata.engine'

# Run the more comprehensive verification tests
echo -e "\n2. Running comprehensive verification tests..."
curl -s -X POST http://localhost:54321/functions/v1/test-verification

# If we started the server, shut it down
if [ -n "$SERVER_PID" ]; then
  echo -e "\nStopping Supabase functions server..."
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null
fi

echo -e "\nVerification tests complete."
