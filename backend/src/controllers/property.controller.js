import * as propertyService from "../services/property.service.js";

export async function listProperties(req, res) {
  return res.json({
    success: true,
    data: { properties: await propertyService.listProperties(req.query) },
  });
}
export async function getProperty(req, res) {
  return res.json({
    success: true,
    data: {
      property: await propertyService.getProperty(req.params.propertyId),
    },
  });
}
export async function listUserProperties(req, res) {
  return res.json({
    success: true,
    data: {
      properties: await propertyService.listUserProperties(req.user.sub),
    },
  });
}
export async function getUserPropertyVerification(req, res) {
  return res.json({
    success: true,
    data: await propertyService.getUserPropertyVerification(
      req.user.sub,
      req.params.propertyId,
    ),
  });
}
export async function createProperty(req, res) {
  return res
    .status(201)
    .json({
      success: true,
      message: "Property draft created.",
      data: {
        property: await propertyService.createProperty(req.user.sub, req.body),
      },
    });
}
export async function updateProperty(req, res) {
  return res.json({
    success: true,
    message: "Property draft updated.",
    data: {
      property: await propertyService.updateProperty(
        req.user.sub,
        req.params.propertyId,
        req.body,
      ),
    },
  });
}
export async function geocodePropertyAddress(req, res) {
  const coordinates = await propertyService.geocodePropertyAddress(req.body || {});
  return res.json({
    success: true,
    data: { coordinates },
  });
}

export async function submitProperty(req, res) {
  return res.json({
    success: true,
    message: "Property submitted for verification.",
    data: {
      property: await propertyService.submitProperty(
        req.user.sub,
        req.params.propertyId,
      ),
    },
  });
}
