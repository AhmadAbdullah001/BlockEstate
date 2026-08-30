import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import Property from "../src/models/Property.js";
import { geocodeAddress } from "../src/services/geocodeService.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await mongoose.connect(env.mongodbUri);

  const total = await Property.countDocuments({ latitude: null });
  const properties = await Property.find({ latitude: null }).sort({ createdAt: 1 }).lean();

  console.log(`Found ${total} properties without coordinates.`);

  for (let index = 0; index < properties.length; index += 1) {
    const property = properties[index];

    try {
      const coordinates = await geocodeAddress({
        address: property.address || "",
        city: property.city || "",
        state: property.state || "",
        pincode: property.pincode || property.postalCode || "",
        country: property.country || "",
      });

      if (coordinates) {
        await Property.updateOne(
          { _id: property._id },
          {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            geocodedAt: new Date(),
          },
        );
        console.log(`${index + 1}/${total} geocoded`);
      } else {
        console.log(`${index + 1}/${total} failed: no coordinates found`);
      }
    } catch (error) {
      console.log(`${index + 1}/${total} failed: ${error.message}`);
    }

    if (index < properties.length - 1) {
      await sleep(1100);
    }
  }

  console.log("Backfill complete.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Backfill error:", error);
  process.exit(1);
});
