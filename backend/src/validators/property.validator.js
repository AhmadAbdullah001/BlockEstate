import { z } from "zod";

const optionalText = (min, max) =>
  z.string().trim().min(min).max(max).optional().or(z.literal(""));

const blankToUndefined = (value) =>
  value === "" || value === null || value === undefined ? undefined : value;

const optionalNumber = z.preprocess(
  blankToUndefined,
  z.coerce.number().nonnegative().optional(),
);

const optionalCoordinate = z.preprocess(
  blankToUndefined,
  z.coerce.number().min(-90).max(90).optional(),
);

export const propertySchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  propertyType: z.string().trim().min(2).max(50),
  price: z.coerce.number().positive(),
  currency: z.string().trim().length(3).default("USD"),
  address: optionalText(3, 250),
  city: optionalText(2, 100),
  state: optionalText(2, 100),
  country: optionalText(2, 100),
  pincode: z.string().trim().max(20).optional().or(z.literal("")),
  postalCode: optionalText(2, 20),
  latitude: optionalCoordinate,
  longitude: optionalCoordinate,
  area: optionalNumber,
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  parking: optionalNumber,
  floors: optionalNumber,
  kitchenCount: optionalNumber,
  livingRooms: optionalNumber,
  diningRooms: optionalNumber,
  balconies: optionalNumber,
  builtUpArea: optionalNumber,
  plotSize: optionalNumber,
  frontage: optionalNumber,
  zoning: optionalText(2, 50),
  businessType: optionalText(2, 50),
  furnishing: optionalText(2, 40),
  amenities: z.array(z.string().trim()).default([]),
  images: z.array(z.string().url()).default([]),
});

export const propertyUpdateSchema = propertySchema.partial();
