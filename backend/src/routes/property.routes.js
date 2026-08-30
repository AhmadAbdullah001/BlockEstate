import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import * as controller from "../controllers/property.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  propertySchema,
  propertyUpdateSchema,
} from "../validators/property.validator.js";
import { upload } from "../middlewares/upload.js";
import { uploadPropertyImages } from "../controllers/upload.controller.js";

const router = Router();
router.get("/", controller.listProperties);
router.get("/mine", authenticate, controller.listUserProperties);
router.get("/:propertyId/verification", authenticate, controller.getUserPropertyVerification);
router.post(
  "/uploads",
  authenticate,
  upload.array("images", 10),
  uploadPropertyImages,
);
router.post("/geocode", authenticate, controller.geocodePropertyAddress);
router.get("/:propertyId", controller.getProperty);
router.post(
  "/",
  authenticate,
  validate(propertySchema),
  controller.createProperty,
);
router.patch(
  "/:propertyId",
  authenticate,
  validate(propertyUpdateSchema),
  controller.updateProperty,
);
router.post("/:propertyId/submit", authenticate, controller.submitProperty);

export default router;
