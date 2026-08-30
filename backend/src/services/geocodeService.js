import axios from "axios";

const USER_AGENT = "BlockEstate/1.0 (support@blockestate.example)";
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const PHOTON_BASE_URL = "https://photon.komoot.io/api/";

function buildQuery({ address = "", city = "", state = "", pincode = "", country = "" }) {
  const parts = [address, city, state, pincode, country].filter(Boolean);
  return parts.join(", ").trim();
}

function buildCountryCode(country) {
  const normalized = (country || "").trim().toLowerCase();
  if (!normalized) return undefined;
  const countryMap = {
    india: "in",
    "united states": "us",
    "united states of america": "us",
    canada: "ca",
    uk: "gb",
    "united kingdom": "gb",
    germany: "de",
    france: "fr",
    australia: "au",
  };
  return countryMap[normalized] || undefined;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function geocodeWithNominatim(query) {
  try {
    const countryCode = buildCountryCode(query.country || "");
    const response = await axios.get(NOMINATIM_BASE_URL, {
      params: {
        q: query.q,
        format: "json",
        limit: 1,
        ...(countryCode ? { countrycodes: countryCode } : {}),
      },
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      timeout: 10000,
    });

    const item = response.data?.[0];
    if (!item) return null;

    const lat = toNumber(item.lat);
    const lng = toNumber(item.lon);
    return lat !== null && lng !== null ? { lat, lng } : null;
  } catch (error) {
    console.error("Nominatim geocoding failed:", error.message);
    return null;
  }
}

async function geocodeWithPhoton(query) {
  try {
    const response = await axios.get(PHOTON_BASE_URL, {
      params: {
        q: query,
        limit: 1,
      },
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      timeout: 10000,
    });

    const feature = response.data?.features?.[0];
    if (!feature || !Array.isArray(feature.geometry?.coordinates)) return null;

    const [lng, lat] = feature.geometry.coordinates;
    const parsedLat = toNumber(lat);
    const parsedLng = toNumber(lng);
    return parsedLat !== null && parsedLng !== null ? { lat: parsedLat, lng: parsedLng } : null;
  } catch (error) {
    console.error("Photon geocoding failed:", error.message);
    return null;
  }
}

export async function geocodeAddress({ address, city, state, pincode, country }) {
  const queryText = buildQuery({ address, city, state, pincode, country });
  if (!queryText) return null;

  const nominatimQuery = {
    q: queryText,
    country: country || "",
  };

  const nominatimResult = await geocodeWithNominatim(nominatimQuery);
  if (nominatimResult) return nominatimResult;

  const photonResult = await geocodeWithPhoton(queryText);
  return photonResult || null;
}

export async function geocodeAddressWithDelay({ address, city, state, pincode, country }, delayMs = 1100) {
  const result = await geocodeAddress({ address, city, state, pincode, country });
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return result;
}
