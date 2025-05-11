
#!/usr/bin/env python3
import os, json, datetime, requests
import hdkit        # pip install hdkit
import swisseph as swe

# Environment variables (these will need to be set in Supabase)
# OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# GEONAMES_USER = os.environ["GEONAMES_USER"]          # free account

# ---------- helpers -------------------------------------------------

def geocode(city, country):
    url = ("https://nominatim.openstreetmap.org/search"
           f"?city={city}&country={country}&format=json&limit=1")
    data = requests.get(url, headers={"User-Agent": "HD Blueprint"}).json()[0]
    return float(data["lat"]), float(data["lon"]), data["display_name"]

def utc_offset(lat, lon, date):
    # You'll need to register a free GeoNames account and add the username as an env var
    geonames_user = os.environ.get("GEONAMES_USER", "demo")
    ts = int(date.timestamp())
    url = ("http://api.geonames.org/timezoneJSON"
           f"?lat={lat}&lng={lon}&date={date:%Y-%m-%d}&username={geonames_user}")
    tz = requests.get(url).json()
    return tz["gmtOffset"] * 3600  # convert to seconds

def life_path(date):
    digits = [int(ch) for ch in date.strftime("%Y%m%d")]
    total  = sum(digits)
    while total > 9 and total not in (11, 22, 33):
        total = sum(int(d) for d in str(total))
    return total

def chinese_zodiac(date):
    animals = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake",
               "Horse","Goat","Monkey","Rooster","Dog","Pig"]
    elements = ["Wood","Wood","Fire","Fire","Earth","Earth",
                "Metal","Metal","Water","Water"]
    y = date.year
    return {
        "animal" : animals[(y - 4) % 12],
        "element": elements[(y - 4) % 10],
        "yin_yang": "Yang" if (y % 2)==0 else "Yin"
    }

# ---------- main deterministic routine ------------------------------

def build_fact_json(name, date_str, time_str, city, country, mbti=None):
    # 1. parse date / time
    local_dt = datetime.datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    # 2. geocode & tz
    lat, lon, location_name = geocode(city, country)
    offset = utc_offset(lat, lon, local_dt)
    utc_dt = local_dt - datetime.timedelta(seconds=offset)
    # 3. create HD bodygraph
    bg = hdkit.BodyGraph.from_datetime(utc_dt, lat, lon)
    # 4. western astro (Sun/Moon/Asc)
    swe.set_topo(lon, lat, 0)
    jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                    utc_dt.hour + utc_dt.minute/60)
    sun_long = swe.calc_ut(jd, swe.SUN)[0]
    moon_long= swe.calc_ut(jd, swe.MOON)[0]
    # Ascendant
    asc = swe.houses_ex(jd, lat, lon, b"P", 0)[0][0]
    
    # Convert degrees to signs and degrees
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    
    sun_sign = signs[int(sun_long / 30)]
    sun_deg = sun_long % 30
    moon_sign = signs[int(moon_long / 30)]
    moon_deg = moon_long % 30
    asc_sign = signs[int(asc / 30)]
    asc_deg = asc % 30
    
    # 5. output JSON
    return {
        "name": name,
        "birth" : {
            "local": f"{local_dt.isoformat()}",
            "utc"  : f"{utc_dt.isoformat()}",
            "lat"  : lat,
            "lon"  : lon,
            "location": location_name
        },
        "western": {
            "sun_sign": sun_sign,
            "sun_deg": round(sun_deg, 2),
            "moon_sign": moon_sign, 
            "moon_deg": round(moon_deg, 2),
            "ascendant_sign": asc_sign,
            "asc_deg": round(asc_deg, 2),
            # Full degrees for completeness
            "raw": {
                "sun_long": sun_long,
                "moon_long": moon_long,
                "asc_long": asc
            }
        },
        "chinese": chinese_zodiac(local_dt),
        "numerology": {
            "life_path": life_path(local_dt)
        },
        "human_design": {
            "type": bg.type,
            "strategy": bg.strategy,
            "authority": bg.authority,
            "profile": bg.profile,
            "incarnation_cross": bg.cross,
            "definition": bg.definition,
            "channels": [str(c) for c in bg.channels],
            "gates": [str(g) for g in bg.gates]
        },
        "mbti": mbti or ""  # Use provided MBTI or empty string
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 6:
        print("Usage: python get_facts.py NAME YYYY-MM-DD HH:MM CITY COUNTRY [MBTI]")
        sys.exit(1)
    
    args = sys.argv[1:]
    mbti = args[5] if len(args) > 5 else None
    facts = build_fact_json(args[0], args[1], args[2], args[3], args[4], mbti)
    print(json.dumps(facts, indent=2))
