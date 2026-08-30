import mongoose from "mongoose";
import Property from "../models/Property.js";
import Verification from "../models/Verification.js";
import { geocodeAddress } from "./geocodeService.js";

const propertyError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });
const ownerFilter = (userId) => ({ seller: userId });
const toGeoPoint = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return { type: "Point", coordinates: [lng, lat] };
};

async function applyGeocode(data) {
  const payload = { ...data };
  const address = payload.address || "";
  const city = payload.city || "";
  const state = payload.state || "";
  const country = payload.country || "";
  const pincode = payload.pincode || payload.postalCode || "";

  if (!address && !city && !state && !country && !pincode) {
    return {
      ...payload,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      geocodedAt: payload.geocodedAt ?? null,
    };
  }

  try {
    const coordinates = await geocodeAddress({
      address,
      city,
      state,
      pincode,
      country,
    });

    if (!coordinates) {
      return {
        ...payload,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        geocodedAt: payload.geocodedAt ?? null,
      };
    }

    const next = {
      ...payload,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      location: toGeoPoint(coordinates.lat, coordinates.lng),
      geocodedAt: new Date(),
    };
    return next;
  } catch (error) {
    return {
      ...payload,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      geocodedAt: payload.geocodedAt ?? null,
    };
  }
}

export function buildPropertyListFilter(query = {}) {
  const filter = { listingStatus: "ACTIVE", verificationStatus: "VERIFIED" };
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  const radiusKm = Number(query.radiusKm ?? 50);

  if (query.city) filter.city = new RegExp(query.city.trim(), "i");
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.minPrice || query.maxPrice) filter.price = {};
  if (query.minPrice) filter.price.$gte = Number(query.minPrice);
  if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: Math.max(radiusKm, 0) * 1000,
      },
    };
  }

  return filter;
}

export function buildLegacyNearbyFilter(query = {}) {
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  const radiusKm = Number(query.radiusKm ?? 50);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {};
  }

  const deltaLat = Math.max(radiusKm, 0) / 111.32;
  const deltaLng = Math.max(radiusKm, 0) / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    latitude: { $gte: lat - deltaLat, $lte: lat + deltaLat },
    longitude: { $gte: lng - deltaLng, $lte: lng + deltaLng },
  };
}

export async function listProperties(query = {}) {
  const baseFilter = { listingStatus: "ACTIVE", verificationStatus: "VERIFIED" };
  const lat = Number(query.lat);
  const lng = Number(query.lng);

  if (query.city) baseFilter.city = new RegExp(query.city.trim(), "i");
  if (query.propertyType) baseFilter.propertyType = query.propertyType;
  if (query.minPrice || query.maxPrice) baseFilter.price = {};
  if (query.minPrice) baseFilter.price.$gte = Number(query.minPrice);
  if (query.maxPrice) baseFilter.price.$lte = Number(query.maxPrice);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const nearbyFilter = buildPropertyListFilter(query);
    const nearby = await Property.find(nearbyFilter).sort({ publishedAt: -1, createdAt: -1 }).lean();

    if (nearby.length > 0) return nearby;

    const legacyNearby = buildLegacyNearbyFilter(query);
    const legacyMatches = await Property.find({
      ...baseFilter,
      ...legacyNearby,
      latitude: { $ne: null },
      longitude: { $ne: null },
    }).sort({ publishedAt: -1, createdAt: -1 }).lean();

    return legacyMatches;
  }

  return Property.find(baseFilter).sort({ publishedAt: -1, createdAt: -1 }).lean();
}

export async function getProperty(propertyId) {
  if (!mongoose.isValidObjectId(propertyId))
    throw propertyError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const property = await Property.findOne({
    _id: propertyId,
    listingStatus: { $ne: "DRAFT" },
  })
    .populate("seller", "name avatar roles")
    .lean();
  if (!property)
    throw propertyError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  return property;
}

export async function getUserPropertyVerification(userId, propertyId) {
  if (!mongoose.isValidObjectId(propertyId)) {
    throw propertyError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  }
  const property = await Property.findOne({ _id: propertyId, ...ownerFilter(userId) })
    .populate("seller", "name email avatar")
    .lean();
  if (!property) {
    throw propertyError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  }
  const verification = await Verification.findOne({ property: property._id })
    .populate({ path: "assignedAgent", populate: { path: "user", select: "name email avatar" } })
    .lean();
  return { property, verification };
}

export function listUserProperties(userId) {
  return Property.find(ownerFilter(userId)).sort({ updatedAt: -1 }).lean();
}

export async function createProperty(userId, data) {
  const enriched = await applyGeocode(data);
  return Property.create({
    ...enriched,
    location: toGeoPoint(enriched.latitude, enriched.longitude) || enriched.location,
    seller: userId,
    verificationStatus: "DRAFT",
    listingStatus: "DRAFT",
  });
}

export async function updateProperty(userId, propertyId, data) {
  const property = await Property.findOne({
    _id: propertyId,
    ...ownerFilter(userId),
    listingStatus: "DRAFT",
  });

  if (!property)
    throw propertyError(404, "PROPERTY_NOT_FOUND", "Draft property not found.");

  const shouldRegeocode = ["address", "city", "state", "pincode", "postalCode"].some(
    (field) => Object.prototype.hasOwnProperty.call(data, field),
  );

  const payload = shouldRegeocode
    ? await applyGeocode({ ...property.toObject(), ...data })
    : {
        ...data,
        location: toGeoPoint(data.latitude, data.longitude) || data.location,
      };

  const updated = await Property.findOneAndUpdate(
    { _id: propertyId, ...ownerFilter(userId), listingStatus: "DRAFT" },
    payload,
    { new: true, runValidators: true },
  );

  return updated;
}

export async function geocodePropertyAddress({ address, city, state, pincode, country }) {
  const coordinates = await geocodeAddress({
    address,
    city,
    state,
    pincode,
    country,
  });

  if (!coordinates)
    throw propertyError(
      404,
      "GEOLOCATION_NOT_FOUND",
      "We could not find coordinates for this address.",
    );

  return coordinates;
}

export async function submitProperty(userId, propertyId) {
  const property = await Property.findOneAndUpdate(
    { _id: propertyId, ...ownerFilter(userId), listingStatus: "DRAFT" },
    { verificationStatus: "VERIFICATION_PENDING", listingStatus: "PENDING_VERIFICATION" },
    { new: true, runValidators: true },
  );
  if (!property)
    throw propertyError(404, "PROPERTY_NOT_FOUND", "Draft property not found.");
  await Verification.findOneAndUpdate(
    { property: property._id },
    {
      $setOnInsert: {
        property: property._id,
        overallStatus: "PENDING",
        timeline: [{ label: "Property submitted", status: "PENDING", occurredAt: new Date() }],
      },
    },
    { upsert: true, new: true },
  );
  return property;
}
