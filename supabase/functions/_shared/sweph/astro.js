// This file is a copy of https://cdn.jsdelivr.net/gh/u-blusky/sweph-wasm@0.11.3/js/astro.js
// It's included directly in the repo to avoid external dependencies
// The original source is from https://github.com/u-blusky/sweph-wasm

const SwissEphGlobals = {
  AS_MAXCH:  256,
  AS_MAXPL:  50,
  BUFLEN: 256, // GD what is this?
  BIT_ROUND_ASC:  512, // GD added
  BIT_ROUND_MC:   1024, // GD added
  DEG: Math.PI / 180,
  CS2DEG: 90 / Math.PI,
  BOOLEAN: {
    TRUE: 1,
    FALSE: 0
  },
  OK: 0,
  ERR: -1,
  ERR_BEYOND_EPH_LIMITS:-2,
  SEFLG_EPHMASK: 1 | 2 | 4 | 8 | 16 | 32,
  SEFLG_JPLEPH: 1,
  SEFLG_SWIEPH: 2,
  SEFLG_MOSEPH: 4,
  SEFLG_HELCTR: 8,
  SEFLG_TRUEPOS: 16,
  SEFLG_J2000: 32,
  SEFLG_NONUT: 64,
  SEFLG_SPEED3: 128,
  SEFLG_SPEED: 256,
  SEFLG_NOGDEFL: 512,
  SEFLG_NOABERR: 1024,
  SEFLG_ASTROMETRIC: 1024 | 512,
  SEFLG_EQUATORIAL: 2048,
  SEFLG_XYZ: 4096,
  SEFLG_RADIANS: 8192,
  SEFLG_BARYCTR: 16384,
  SEFLG_TOPOCTR: 32768,
  SEFLG_ORBEL_AA: 32768 * 2,
  SEFLG_ORBEL: 32768 * 4,
  SEFLG_SIDEREAL: 32768 * 8,
  SEFLG_ICRS: 32768 * 16,
  SEFLG_DPSIDEPS_1980: 32768 * 32,
  SEFLG_JPLHOR: 32768 * 64,
  SEFLG_JPLHOR_APPROX: 32768 * 128,
  SEFLG_CENTER_BODY: 32768 * 256,
  SEFLG_TEST_PLMOON: 32768 * 512,
  SE_ECL_NUT: -1,
  SE_SUN: 0,
  SE_MOON: 1,
  SE_MERCURY: 2,
  SE_VENUS: 3,
  SE_MARS: 4,
  SE_JUPITER: 5,
  SE_SATURN: 6,
  SE_URANUS: 7,
  SE_NEPTUNE: 8,
  SE_PLUTO: 9,
  SE_MEAN_NODE: 10,
  SE_TRUE_NODE: 11,
  SE_MEAN_APOG: 12,
  SE_OSCU_APOG: 13,
  SE_EARTH: 14,
  SE_CHIRON: 15,
  SE_PHOLUS: 16,
  SE_CERES: 17,
  SE_PALLAS: 18,
  SE_JUNO: 19,
  SE_VESTA: 20,
  SE_INTP_APOG: 21,
  SE_INTP_PERG: 22,
  SE_NPLANETS: 23,
  SE_FICT_OFFSET: 40,
  SE_FICT_OFFSET_1: 39,
  SE_FICT_MAX: 999,
  SE_NFICT_ELEM: 15,
  SE_PLMOON_OFFSET: 9000,
  SE_AST_OFFSET: 10000,
  SE_VARUNA: 30000,
  SE_FIXED_STAR: -10,
  SE_SIDM_FAGAN_BRADLEY: 0,
  SE_SIDM_LAHIRI: 1,
  SE_SIDM_DELUCE: 2,
  SE_SIDM_RAMAN: 3,
  SE_SIDM_USHASHASHI: 4,
  SE_SIDM_KRISHNAMURTI: 5,
  SE_SIDM_DJWHAL_KHUL: 6,
  SE_SIDM_YUKTESHVAR: 7,
  SE_SIDM_JN_BHASIN: 8,
  SE_SIDM_BABYL_KUGLER1: 9,
  SE_SIDM_BABYL_KUGLER2: 10,
  SE_SIDM_BABYL_KUGLER3: 11,
  SE_SIDM_BABYL_HUBER: 12,
  SE_SIDM_BABYL_ETPSC: 13,
  SE_SIDM_ALDEBARAN_15TAU: 14,
  SE_SIDM_HIPPARCHOS: 15,
  SE_SIDM_SASSANIAN: 16,
  SE_SIDM_GALCENT_0SAG: 17,
  SE_SIDM_J2000: 18,
  SE_SIDM_J1900: 19,
  SE_SIDM_B1950: 20,
  SE_SIDM_SURYASIDDHANTA: 21,
  SE_SIDM_SURYASIDDHANTA_MSUN: 22,
  SE_SIDM_ARYABHATA: 23,
  SE_SIDM_ARYABHATA_MSUN: 24,
  SE_SIDM_SS_REVATI: 25,
  SE_SIDM_SS_CITRA: 26,
  SE_SIDM_TRUE_CITRA: 27,
  SE_SIDM_TRUE_REVATI: 28,
  SE_SIDM_TRUE_PUSHYA: 29,
  SE_SIDM_GALCENT_RGILBRAND: 30,
  SE_SIDM_GALEQU_IAU1958: 31,
  SE_SIDM_GALEQU_TRUE: 32,
  SE_SIDM_GALEQU_MULA: 33,
  SE_SIDM_GALALIGN_MARDYKS: 34,
  SE_SIDM_TRUE_MULA: 35,
  SE_SIDM_GALCENT_MULA_WILHELM: 36,
  SE_SIDM_ARYABHATA_522: 37,
  SE_SIDM_BABYL_BRITTON: 38,
  SE_SIDM_TRUE_SHEORAN: 39,
  SE_SIDM_GALCENT_COCHRANE: 40,
  SE_SIDM_GALEQU_FIORENZA: 41,
  SE_SIDM_VALENS_MOON: 42,
  SE_SIDM_LAHIRI_1940: 43,
  SE_SIDM_LAHIRI_VP285: 44,
  SE_SIDM_KRISHNAMURTI_VP291: 45,
  SE_SIDM_LAHIRI_ICRC: 46,
  SE_SIDM_USER: 255,
  SE_SIDBITS: 256,
  SE_SIDBIT_ECL_T0: 256,
  SE_SIDBIT_SSY_PLANE: 512,
  SE_SIDBIT_USER_UT: 1024,
  SE_NSIDM_PREDEF: 47,
  SE_NODBIT_MEAN: 1,
  SE_NODBIT_OSCU: 2,
  SE_NODBIT_OSCU_BAR: 4,
  SE_NODBIT_FOPOINT: 256,
  SE_MAX_STNAME: 256,
  SE_HOUSE_SYSTEM: {
    NONE: 'P',
    PLACIDUS: 'P',
    KOCH: 'K',
    PORPHYRIUS: 'O',
    REGIOMONTANUS: 'R',
    CAMPANUS: 'C',
    EQUAL: 'E',
    VEHLOW: 'V',
    MERIDIAN: 'X',
    HORIZONTAL: 'H',
    POLICH_PAGE: 'T',
    ALCABITIUS: 'B',
    GAUQUELIN: 'G',
    MORINUS: 'M',
    KRUSINSKI: 'U',
    WHOLE_SIGN: 'W',
    AXIAL_ROTATION: 'A',
    HORIZONTAL_NULL: 'N',
    SUNSHINE: 'I',
    SUNSHINE_NULL: 'i',
    SRIPATI: 'S',
    DEFAULT: 'P'
  },
  SE_HSYS: {
    PLACIDUS: 'P',
    KOCH: 'K',
    PORPHYRIUS: 'O',
    REGIOMONTANUS: 'R',
    CAMPANUS: 'C',
    EQUAL: 'E',
    VEHLOW: 'V',
    MERIDIAN: 'X',
    HORIZONTAL: 'H',
    POLICH_PAGE: 'T',
    ALCABITIUS: 'B',
    GAUQUELIN: 'G',
    MORINUS: 'M',
    KRUSINSKI: 'U',
    WHOLE_SIGN: 'W',
    AXIAL_ROTATION: 'A',
    HORIZONTAL_NULL: 'N',
    SUNSHINE: 'I',
    SUNSHINE_NULL: 'i',
    SRIPATI: 'S'
  },
  SE_CALC_RISE: 1,
  SE_CALC_SET: 2,
  SE_CALC_MTRANSIT: 4,
  SE_CALC_ITRANSIT: 8,
  SE_CALC_ALL: (1|2|4|8),
  SE_BIT_HINDU_RISING: 128,
  SE_BIT_DISC_CENTER: 256,
  SE_BIT_GEOCTR_NO_ECL_LAT: 512,
  SE_BIT_NO_REFRACTION: 1024,
  SE_BIT_CIVIL_TWILIGHT: 2048,
  SE_BIT_NAUTIC_TWILIGHT: 4096,
  SE_BIT_ASTRONOMICAL_TWILIGHT: 8192,
  SE_BIT_FIXED_DISC_SIZE: 16384,
  SE_BIT_FORCE_SLOW_METHOD: 32768,
  SE_BIT_ELLIPTICAL_PATH: (32768*2),
  SE_ECL2HOR: 0,
  SE_EQU2HOR: 1,
  SE_HOR2ECL: 0,
  SE_HOR2EQU: 1
};

(function(exports) {
  // JulDay constructor
  function JulDay(year, month, day, hour) {
    if (!(this instanceof JulDay)) {
      return new JulDay(year, month, day, hour);
    }

    if (arguments.length === 4) {
      let [a, y] = [0, 0];
      if (month > 2) {
        y = year;
        a = month - 3;
      } else {
        y = year - 1;
        a = month + 9;
      }

      const c = Math.floor(y / 100);
      const jd1 = Math.floor(146097.0 * c / 4.0);
      const jd2 = Math.floor(1461.0 * (y - c * 100) / 4.0);
      const jd3 = Math.floor((153.0 * a + 2.0) / 5.0);

      const jd = jd1 + jd2 + jd3 + day + 1721119;

      this.julian = jd + hour / 24.0;
    } else {
      this.julian = arguments[0];
    }
  }

  JulDay.prototype.toCalendar = function() {
    const jd = this.julian;

    const z = Math.floor(jd);
    const f = jd - z;
    let a = z;
    if (z >= 2299161) {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }

    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day = b - d - Math.floor(30.6001 * e);
    const hours = f * 24;
    const hour = Math.floor(hours);
    const minutes = (hours - hour) * 60;
    const minute = Math.floor(minutes);
    const second = Math.floor((minutes - minute) * 60);
    let month;
    let year;
    if (e < 14) {
      month = e - 1;
    } else {
      month = e - 13;
    }
    if (month > 2) {
      year = c - 4716;
    } else {
      year = c - 4715;
    }

    return {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      second: second
    };
  };

  JulDay.prototype.addDays = function(numDays) {
    return new JulDay(this.julian + numDays);
  };

  JulDay.prototype.getDayOfWeek = function() {
    return (Math.floor(this.julian + 1.5) % 7);
  };

  JulDay.fromDate = function(year, month, day, hour) {
    return new JulDay(year, month, day, hour);
  };

  JulDay.now = function() {
    const date = new Date();
    return JulDay.fromDate(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours() + date.getMinutes() / 60);
  };

  exports.JulDay = JulDay;

  // AID OF CALCULATION
  exports.Houses = {
    PLACIDUS: SwissEphGlobals.SE_HOUSE_SYSTEM.PLACIDUS,
    KOCH: SwissEphGlobals.SE_HOUSE_SYSTEM.KOCH,
    PORPHYRIUS: SwissEphGlobals.SE_HOUSE_SYSTEM.PORPHYRIUS,
    REGIOMONTANUS: SwissEphGlobals.SE_HOUSE_SYSTEM.REGIOMONTANUS,
    CAMPANUS: SwissEphGlobals.SE_HOUSE_SYSTEM.CAMPANUS,
    EQUAL: SwissEphGlobals.SE_HOUSE_SYSTEM.EQUAL,
    VEHLOW: SwissEphGlobals.SE_HOUSE_SYSTEM.VEHLOW,
    MERIDIAN: SwissEphGlobals.SE_HOUSE_SYSTEM.MERIDIAN,
    HORIZONTAL: SwissEphGlobals.SE_HOUSE_SYSTEM.HORIZONTAL,
    POLICH_PAGE: SwissEphGlobals.SE_HOUSE_SYSTEM.POLICH_PAGE,
    ALCABITIUS: SwissEphGlobals.SE_HOUSE_SYSTEM.ALCABITIUS,
    GAUQUELIN: SwissEphGlobals.SE_HOUSE_SYSTEM.GAUQUELIN,
    MORINUS: SwissEphGlobals.SE_HOUSE_SYSTEM.MORINUS,
    KRUSINSKI: SwissEphGlobals.SE_HOUSE_SYSTEM.KRUSINSKI,
    WHOLE_SIGN: SwissEphGlobals.SE_HOUSE_SYSTEM.WHOLE_SIGN
  };

  exports.HouseSystems = {
    PLACIDUS: SwissEphGlobals.SE_HSYS.PLACIDUS,
    KOCH: SwissEphGlobals.SE_HSYS.KOCH,
    PORPHYRIUS: SwissEphGlobals.SE_HSYS.PORPHYRIUS,
    REGIOMONTANUS: SwissEphGlobals.SE_HSYS.REGIOMONTANUS,
    CAMPANUS: SwissEphGlobals.SE_HSYS.CAMPANUS,
    EQUAL: SwissEphGlobals.SE_HSYS.EQUAL,
    VEHLOW: SwissEphGlobals.SE_HSYS.VEHLOW,
    MERIDIAN: SwissEphGlobals.SE_HSYS.MERIDIAN,
    HORIZONTAL: SwissEphGlobals.SE_HSYS.HORIZONTAL,
    POLICH_PAGE: SwissEphGlobals.SE_HSYS.POLICH_PAGE,
    ALCABITIUS: SwissEphGlobals.SE_HSYS.ALCABITIUS,
    GAUQUELIN: SwissEphGlobals.SE_HSYS.GAUQUELIN,
    MORINUS: SwissEphGlobals.SE_HSYS.MORINUS,
    KRUSINSKI: SwissEphGlobals.SE_HSYS.KRUSINSKI,
    WHOLE_SIGN: SwissEphGlobals.SE_HSYS.WHOLE_SIGN
  };

  exports.Bodies = {
    SUN: SwissEphGlobals.SE_SUN,
    MOON: SwissEphGlobals.SE_MOON,
    MERCURY: SwissEphGlobals.SE_MERCURY,
    VENUS: SwissEphGlobals.SE_VENUS,
    MARS: SwissEphGlobals.SE_MARS,
    JUPITER: SwissEphGlobals.SE_JUPITER,
    SATURN: SwissEphGlobals.SE_SATURN,
    URANUS: SwissEphGlobals.SE_URANUS,
    NEPTUNE: SwissEphGlobals.SE_NEPTUNE,
    PLUTO: SwissEphGlobals.SE_PLUTO,
    MEAN_NODE: SwissEphGlobals.SE_MEAN_NODE,
    TRUE_NODE: SwissEphGlobals.SE_TRUE_NODE,
    MEAN_APOG: SwissEphGlobals.SE_MEAN_APOG,
    OSCU_APOG: SwissEphGlobals.SE_OSCU_APOG,
    EARTH: SwissEphGlobals.SE_EARTH,
    CHIRON: SwissEphGlobals.SE_CHIRON,
    PHOLUS: SwissEphGlobals.SE_PHOLUS,
    CERES: SwissEphGlobals.SE_CERES,
    PALLAS: SwissEphGlobals.SE_PALLAS,
    JUNO: SwissEphGlobals.SE_JUNO,
    VESTA: SwissEphGlobals.SE_VESTA
  };

  exports.Flags = {
    SWIEPH: SwissEphGlobals.SEFLG_SWIEPH,
    SPEED: SwissEphGlobals.SEFLG_SPEED
  };

  SwissEphGlobals.SEFLG_SWIEPH;
  SwissEphGlobals.SEFLG_SPEED;

  // SWISS EPHEMERIS WRAPPER
  async function createSwissEph() {
    const wasmPromise = fetch(new URL('./astro.wasm', import.meta.url))
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => WebAssembly.compile(arrayBuffer));

    const wasm = await wasmPromise;
    const wasmModule = await WebAssembly.instantiate(wasm);
    const wasmExports = wasmModule.exports;

    // Set up Memory
    const memory = wasmExports.memory;
    const malloc = wasmExports.malloc;
    const free = wasmExports.free;
    const getLastError = wasmExports.getLastErrorText;

    // WASM functions
    const wasm_swe_calc = wasmExports.swe_calc;
    const wasm_swe_houses = wasmExports.swe_houses;
    const wasm_swe_julday = wasmExports.swe_julday;
    const wasm_swe_set_ephe_path = wasmExports.swe_set_ephe_path;
    const wasm_swe_close = wasmExports.swe_close;

    function processLastError() {
      const errorPtr = getLastError();
      if (errorPtr === 0) {
        return null;
      }

      const memory8 = new Uint8Array(memory.buffer);
      let result = '';
      let i = errorPtr;
      while (memory8[i] !== 0) {
        result += String.fromCharCode(memory8[i]);
        i++;
      }
      return result;
    }

    function arrayToPtr(array, ptr, length) {
      const memory8 = new Uint8Array(memory.buffer);
      for (let i = 0; i < length; i++) {
        memory8[ptr + i] = array[i];
      }
    }

    function ptrToArray(ptr, length) {
      const memory8 = new Uint8Array(memory.buffer);
      const arr = [];
      for (let i = 0; i < length; i++) {
        arr.push(memory8[ptr + i]);
      }
      return arr;
    }

    function allocateMemory(size) {
      return malloc(size);
    }

    function freeMemory(ptr) {
      free(ptr);
    }

    function writeStringToMemory(str, ptr) {
      const memory8 = new Uint8Array(memory.buffer);
      for (let i = 0; i < str.length; i++) {
        memory8[ptr + i] = str.charCodeAt(i);
      }
      memory8[ptr + str.length] = 0; // Null terminator
    }

    function readStringFromMemory(ptr) {
      const memory8 = new Uint8Array(memory.buffer);
      let result = '';
      while (memory8[ptr] !== 0) {
        result += String.fromCharCode(memory8[ptr]);
        ptr++;
      }
      return result;
    }

    class SwissEph {
      constructor() {
        this.jdUT = 0;
      }

      setPath(path) {
        const pathPtr = allocateMemory(path.length + 1);
        writeStringToMemory(path, pathPtr);
        wasm_swe_set_ephe_path(pathPtr);
        freeMemory(pathPtr);
      }

      julday(year, month, day, hour) {
        return wasm_swe_julday(year, month, day, hour);
      }

      calc(julday, ipl, flag) {
        const xPtr = allocateMemory(6 * 8); // 6 doubles (x, y, z, dx, dy, dz)
        const serr = allocateMemory(256);
        const xx = new Float64Array(memory.buffer, xPtr, 6);
        const result = wasm_swe_calc(julday, ipl, flag, xPtr, serr);

        const error = processLastError();
        if (error) {
          console.error('SwissEph calc error:', error);
        }

        const position = {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5]
        };

        freeMemory(xPtr);
        freeMemory(serr);

        return position;
      }

      houses(julday, lat, lon, hsys) {
        const cusps = allocateMemory(37 * 8); // 37 doubles
        const ascmc = allocateMemory(10 * 8); // 10 doubles
        const result = wasm_swe_houses(julday, lat, lon, hsys.charCodeAt(0), cusps, ascmc);

        const error = processLastError();
        if (error) {
          console.error('SwissEph houses error:', error);
        }

        const memory64 = new Float64Array(memory.buffer);
        const cuspsArray = [];
        for (let i = 1; i <= 12; i++) {
          cuspsArray.push(memory64[(cusps / 8) + i]);
        }

        const houses = {
          ascendant: memory64[(ascmc / 8)],
          mc: memory64[(ascmc / 8) + 1],
          armc: memory64[(ascmc / 8) + 2],
          vertex: memory64[(ascmc / 8) + 3],
          equatorialAscendant: memory64[(ascmc / 8) + 4],
          coAscendantKoch: memory64[(ascmc / 8) + 5],
          coAscendantMunkasey: memory64[(ascmc / 8) + 6],
          polarAscendant: memory64[(ascmc / 8) + 7],
          cusps: cuspsArray
        };

        freeMemory(cusps);
        freeMemory(ascmc);

        return houses;
      }

      close() {
        wasm_swe_close();
      }
    }

    globalThis.SwissEph = SwissEph;
    return new SwissEph();
  }

  exports.SwissEph = createSwissEph;

})(typeof exports !== 'undefined' ? exports : this);

// Fix the problematic export statement
export default SwissEphGlobals.SwissEph;
// Export the required components directly rather than from 'this'
export const JulDay = (typeof exports !== 'undefined' ? exports : this).JulDay;
export const Bodies = (typeof exports !== 'undefined' ? exports : this).Bodies;
export const Houses = (typeof exports !== 'undefined' ? exports : this).Houses;
export const HouseSystems = (typeof exports !== 'undefined' ? exports : this).HouseSystems;
export const Flags = (typeof exports !== 'undefined' ? exports : this).Flags;
