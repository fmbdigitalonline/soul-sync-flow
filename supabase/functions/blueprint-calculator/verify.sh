
#!/bin/bash
# Script to run ephemeris verification tests

echo "Starting Swiss Ephemeris verification tests..."

# Check if astro.wasm file exists
echo -e "\nChecking if WASM file exists..."
WASM_PATH="./sweph/astro.wasm"
if [ -f "$WASM_PATH" ]; then
  echo "✓ WASM file found at $WASM_PATH ($(ls -lh $WASM_PATH | awk '{print $5}'))"
  echo "  Full path: $(realpath $WASM_PATH)"
else
  echo "✗ WASM file NOT found at $WASM_PATH"
  echo "Checking alternate locations..."
  find ../ -name "astro.wasm" | while read file; do
    echo "  Found at: $file ($(ls -lh $file | awk '{print $5}'))"
    echo "  Full path: $(realpath $file)"
  done
fi

# Check the .deno configuration
echo -e "\nChecking .deno configuration..."
if [ -f ".deno" ]; then
  echo "✓ .deno file exists:"
  cat .deno
else
  echo "✗ .deno file missing"
fi

# Start the local function server if not already running
if ! nc -z localhost 54321 >/dev/null 2>&1; then
  echo -e "\nStarting Supabase functions server..."
  DENO_DIR=.deno_dir supabase functions serve blueprint-calculator &
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
     | jq '.calculation_metadata.engine,
           .humanDesign.type,
           .humanDesign.profile,
           .chineseZodiac.animal,
           .numerology.life_path_number'

# Run the more comprehensive verification tests
echo -e "\n2. Running comprehensive verification tests..."
curl -s -X POST http://localhost:54321/functions/v1/test-verification | jq .

# Run a direct test of the Swiss Ephemeris loading
echo -e "\n3. Testing direct astro.wasm loading..."
cat <<EOF > /tmp/test-wasm-loading.ts
import initializeWasm from "../_shared/sweph/astro.js";

console.log("Current directory:", Deno.cwd());
console.log("Import URL:", import.meta.url);

try {
  console.log("Attempting to load Swiss Ephemeris WASM module...");
  
  const wasmUrl = new URL("./sweph/astro.wasm", import.meta.url);
  console.log("WASM URL:", wasmUrl.href);
  
  const wasmBytes = await Deno.readFile(wasmUrl);
  console.log("Successfully read \${wasmBytes.byteLength} bytes from WASM file");
  
  const sweph = await initializeWasm(wasmBytes);
  console.log("Success! Module loaded and returned:", !!sweph);
  
  // Test basic calculation
  const jd = sweph.swe_julday(2020, 1, 1, 12, sweph.SE_GREG_CAL);
  console.log("Julian Day calculation test:", jd);
  
  Deno.exit(0);
} catch (error) {
  console.error("Failed to load WASM module:", error);
  Deno.exit(1);
}
EOF

echo "Running direct WASM loader test..."
DENO_DIR=.deno_dir deno run --allow-read --allow-net /tmp/test-wasm-loading.ts

# If we started the server, shut it down
if [ -n "$SERVER_PID" ]; then
  echo -e "\nStopping Supabase functions server..."
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null
fi

echo -e "\nVerification tests complete."
