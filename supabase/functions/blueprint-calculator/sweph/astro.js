
// Swiss Ephemeris WASM wrapper for JavaScript
// This file is adapted from the sweph-wasm project

// Define ephemeris object to hold all exports
const ephemeris = {};

// Define the components we'll be exporting
ephemeris.JulDay = {
  // Add fromDate function for easy date conversion to Julian Day
  fromDate: (year, month, day, hour = 0, minute = 0, second = 0) => {
    if (!ephemeris.swe_julday) {
      throw new Error("WASM module not initialized");
    }
    return ephemeris.swe_julday(year, month, day, hour + minute/60 + second/3600, ephemeris.SE_GREG_CAL);
  },
};

ephemeris.Bodies = {
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  URANUS: 7,
  NEPTUNE: 8,
  PLUTO: 9,
  MEAN_NODE: 10,
  TRUE_NODE: 11,
  CHIRON: 15
};

ephemeris.Houses = {
  calculate: (julDay, lat, lon, system = 'P') => {
    if (!wasmModuleCache) {
      throw new Error("WASM module not initialized");
    }
    
    const houses = new Float64Array(13);
    const ascmc = new Float64Array(10);
    
    wasmModuleCache.swe_houses(julDay, lat, lon, system, houses, ascmc);
    
    return {
      ascendant: ascmc[wasmModuleCache.SE_ASC],
      mc: ascmc[wasmModuleCache.SE_MC],
      armc: ascmc[wasmModuleCache.SE_ARMC],
      vertex: ascmc[wasmModuleCache.SE_VERTEX],
      cusps: Array.from(houses.slice(1, 13))
    };
  }
};

ephemeris.HouseSystems = {
  PLACIDUS: 'P',
  KOCH: 'K',
  PORPHYRIUS: 'O',
  REGIOMONTANUS: 'R',
  CAMPANUS: 'C',
  EQUAL: 'E',
  WHOLE_SIGN: 'W'
};

ephemeris.Flags = {
  SPEED: 256,
  EQUATORIAL: 2048,
  SIDEREAL: 64
};

// Calculate function to get planetary positions
ephemeris.calculate = (julDay, bodyId, flags = ephemeris.Flags.SPEED) => {
  if (!wasmModuleCache) {
    throw new Error("WASM module not initialized");
  }
  
  const result = new Float64Array(6);
  wasmModuleCache.swe_calc_ut(julDay, bodyId, flags, result);
  
  return {
    longitude: result[0],
    latitude: result[1],
    distance: result[2],
    longitudeSpeed: result[3],
    latitudeSpeed: result[4],
    distanceSpeed: result[5]
  };
};

// Cache for the initialized WASM module
let wasmModuleCache = null;
let wasmLoadStartTime = 0;

// Initialize the WASM module from bytes or URL
const initializeWasm = async (wasmBytesOrUrl) => {
  try {
    // Return cached module if already initialized
    if (wasmModuleCache) {
      console.log("Using cached WASM module");
      return wasmModuleCache;
    }
    
    wasmLoadStartTime = performance.now();
    
    let wasmBinary;
    
    // Check if wasmBytesOrUrl is a URL string, a URL object, or already a binary
    if (typeof wasmBytesOrUrl === 'string') {
      console.log("Initializing WASM module from URL string:", wasmBytesOrUrl);
      const response = await fetch(wasmBytesOrUrl);
      if (!response.ok) throw new Error(`Failed to fetch WASM: ${response.status}`);
      wasmBinary = await response.arrayBuffer();
    } 
    else if (wasmBytesOrUrl instanceof URL) {
      console.log("Initializing WASM module from URL object:", wasmBytesOrUrl.toString());
      // For Deno environments
      if (typeof Deno !== 'undefined') {
        wasmBinary = await Deno.readFile(wasmBytesOrUrl);
      } else {
        const response = await fetch(wasmBytesOrUrl);
        if (!response.ok) throw new Error(`Failed to fetch WASM: ${response.status}`);
        wasmBinary = await response.arrayBuffer();
      }
    }
    else if (wasmBytesOrUrl instanceof Uint8Array) {
      console.log(`Initializing WASM module from provided binary (${wasmBytesOrUrl.byteLength} bytes)`);
      wasmBinary = wasmBytesOrUrl.buffer;
    }
    else {
      console.log("Received unknown type for WASM initialization:", typeof wasmBytesOrUrl);
      throw new Error("Invalid WASM source provided");
    }
    
    console.log(`Successfully obtained WASM binary (${Math.round(wasmBinary.byteLength / 1024)} kB)`);
    
    // Convert to Uint8Array if it's an ArrayBuffer
    const wasmBytes = wasmBinary instanceof ArrayBuffer ? new Uint8Array(wasmBinary) : wasmBinary;
    
    // Try to detect if this is a WASI build by checking for custom sections
    let isWasiBuild = false;
    try {
      // This is a simple heuristic - check for "wasi" or "wasm" strings in the binary
      const textDecoder = new TextDecoder();
      const wasmText = textDecoder.decode(wasmBytes.slice(0, 1000)); // Just check start of file
      isWasiBuild = wasmText.includes("wasi_snapshot_preview1");
      console.log(`WASM build type detection: ${isWasiBuild ? "WASI" : "Emscripten"}`);
    } catch (err) {
      console.warn("Failed to detect WASM build type:", err);
    }
    
    let wasmModule;
    
    // If we're in Deno and it's a WASI build, use Deno.Wasi
    if (typeof Deno !== 'undefined' && isWasiBuild) {
      console.log("Using Deno.Wasi for WASI-compatible WASM module");
      try {
        // Create a WASI instance
        const wasi = new Deno.Wasi({
          args: [],
          env: {},
          preopens: {
            '/': '/'
          },
        });
        
        // Instantiate with WASI imports
        const importObject = {
          wasi_snapshot_preview1: wasi.exports,
          env: { memory: new WebAssembly.Memory({ initial: 10, maximum: 100 }) }
        };
        
        // Compile and instantiate the module
        const module = await WebAssembly.compile(wasmBytes);
        const instance = await WebAssembly.instantiate(module, importObject);
        
        // Initialize WASI
        wasi.initialize(instance);
        
        wasmModule = { instance };
        console.log("Successfully instantiated WASM module with WASI runtime");
        
      } catch (wasiError) {
        console.error("Failed to instantiate with WASI:", wasiError);
        throw new Error(`WASI initialization failed: ${wasiError.message}`);
      }
    } else {
      // Standard Emscripten build (default)
      console.log("Instantiating standard Emscripten WASM module");
      try {
        // Instantiate the WASM module with the binary
        wasmModule = await WebAssembly.instantiate(wasmBytes, {
          env: { memory: new WebAssembly.Memory({ initial: 10, maximum: 100 }) }
        });
      } catch (emscriptenError) {
        // If this fails and it might be a WASI build, try with empty wasi_snapshot_preview1
        if (emscriptenError.message.includes("wasi_snapshot_preview1")) {
          console.log("Emscripten instantiation failed, trying with mock WASI imports");
          
          // Create mock WASI imports
          const mockWasiImports = {
            wasi_snapshot_preview1: {
              // Minimal mock implementation of required WASI functions
              proc_exit: (code) => console.log(`proc_exit called with code ${code}`),
              fd_close: () => 0,
              fd_write: () => 0,
              fd_seek: () => 0,
              fd_read: () => 0,
              // Add other functions as needed
            },
            env: { memory: new WebAssembly.Memory({ initial: 10, maximum: 100 }) }
          };
          
          try {
            // Try with mock WASI imports
            wasmModule = await WebAssembly.instantiate(wasmBytes, mockWasiImports);
            console.log("Successfully instantiated with mock WASI imports");
          } catch (mockError) {
            console.error("Failed to instantiate with mock WASI imports:", mockError);
            throw new Error(`WASM instantiation failed with both standard and mock WASI imports: ${mockError.message}`);
          }
        } else {
          // If it's another error, rethrow
          console.error("Failed to instantiate WASM module:", emscriptenError);
          throw emscriptenError;
        }
      }
    }
    
    const loadDuration = performance.now() - wasmLoadStartTime;
    console.log(`WASM module instantiated successfully in ${Math.round(loadDuration)} ms!`);
    
    // Cache the module
    wasmModuleCache = wasmModule.instance.exports;
    
    // Set up the exported objects
    const swe = wasmModuleCache;
    
    // Export constants and methods
    ephemeris.SE_GREG_CAL = swe.SE_GREG_CAL;
    ephemeris.SE_JUL_CAL = swe.SE_JUL_CAL;
    ephemeris.SEFLG_SPEED = swe.SEFLG_SPEED;
    ephemeris.SEFLG_EQUATORIAL = swe.SEFLG_EQUATORIAL;
    ephemeris.SEFLG_SIDEREAL = swe.SEFLG_SIDEREAL;
    
    // Planet IDs
    ephemeris.SE_SUN = swe.SE_SUN;
    ephemeris.SE_MOON = swe.SE_MOON;
    ephemeris.SE_MERCURY = swe.SE_MERCURY;
    ephemeris.SE_VENUS = swe.SE_VENUS;
    ephemeris.SE_MARS = swe.SE_MARS;
    ephemeris.SE_JUPITER = swe.SE_JUPITER;
    ephemeris.SE_SATURN = swe.SE_SATURN;
    ephemeris.SE_URANUS = swe.SE_URANUS;
    ephemeris.SE_NEPTUNE = swe.SE_NEPTUNE;
    ephemeris.SE_PLUTO = swe.SE_PLUTO;
    ephemeris.SE_CHIRON = swe.SE_CHIRON;
    ephemeris.SE_TRUE_NODE = swe.SE_TRUE_NODE;
    ephemeris.SE_MEAN_NODE = swe.SE_MEAN_NODE;
    
    // House systems
    ephemeris.SE_HSYS_PLACIDUS = swe.SE_HSYS_PLACIDUS;
    ephemeris.SE_HSYS_KOCH = swe.SE_HSYS_KOCH;
    ephemeris.SE_HSYS_PORPHYRIUS = swe.SE_HSYS_PORPHYRIUS;
    ephemeris.SE_HSYS_REGIOMONTANUS = swe.SE_HSYS_REGIOMONTANUS;
    ephemeris.SE_HSYS_CAMPANUS = swe.SE_HSYS_CAMPANUS;
    ephemeris.SE_HSYS_EQUAL = swe.SE_HSYS_EQUAL;
    ephemeris.SE_HSYS_WHOLE_SIGN = swe.SE_HSYS_WHOLE_SIGN;
    
    // House points
    ephemeris.SE_ASC = swe.SE_ASC;
    ephemeris.SE_MC = swe.SE_MC;
    ephemeris.SE_ARMC = swe.SE_ARMC;
    ephemeris.SE_VERTEX = swe.SE_VERTEX;
    
    // Export methods directly
    ephemeris.swe_julday = swe.swe_julday;
    ephemeris.swe_calc_ut = swe.swe_calc_ut;
    ephemeris.swe_houses = swe.swe_houses;
    ephemeris.swe_houses_ex = swe.swe_houses_ex;
    ephemeris.swe_set_sid_mode = swe.swe_set_sid_mode;
    
    console.log("Swiss Ephemeris WASM module initialized successfully!");
    return wasmModuleCache;

  } catch (err) {
    console.error("Failed to initialize Swiss Ephemeris WASM module:", err);
    throw err;
  }
};

// Export the main object and initialization function
export default initializeWasm;  // Changed to default export the init function
export const swe = ephemeris;   // Named export for the ephemeris object

// Export individual components for direct use
export const JulDay = ephemeris.JulDay;
export const Bodies = ephemeris.Bodies;
export const Houses = ephemeris.Houses;
export const HouseSystems = ephemeris.HouseSystems;
export const Flags = ephemeris.Flags;
