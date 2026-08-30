import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import AgentProfile from "../src/models/AgentProfile.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is missing. Set it in backend/.env before running seed script.");
  process.exit(1);
}

const agentSeedData = [
  {
    name: "Aisha Khan",
    email: "aisha.agent1@example.com",
    phone: "+91 98765 43210",
    city: "Lucknow",
    state: "Uttar Pradesh",
    country: "India",
    latitude: 26.8467,
    longitude: 80.9462,
    roles: ["USER", "ADMIN"],
    agencyName: "Aisha Realty Group",
    licenseNumber: "UP-AG-101",
    yearsExperience: 8,
    specializations: ["Residential", "Luxury Villas", "Investment"],
    languages: ["Hindi", "English"],
    serviceAreas: ["Lucknow", "Gomti Nagar", "Hazratganj"],
    bio: "Helping families find premium homes and high-return investment properties in Lucknow.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    verificationStatus: "APPROVED",
    status: "ACTIVE",
    commissionRate: 2.5,
    rating: 4.8,
    totalReviews: 129,
  },
  {
    name: "Rahul Sharma",
    email: "rahul.agent2@example.com",
    phone: "+91 98123 45678",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    latitude: 28.6139,
    longitude: 77.209,
    roles: ["USER"],
    agencyName: "NorthStar Estates",
    licenseNumber: "DL-AG-204",
    yearsExperience: 10,
    specializations: ["Commercial", "Office Spaces", "Retail"],
    languages: ["Hindi", "English"],
    serviceAreas: ["Delhi", "Gurugram", "Noida"],
    bio: "Commercial property specialist with a strong network in NCR and business districts.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    verificationStatus: "APPROVED",
    status: "ACTIVE",
    commissionRate: 3,
    rating: 4.7,
    totalReviews: 214,
  },
  {
    name: "Meera Nair",
    email: "meera.agent3@example.com",
    phone: "+91 99887 66554",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    roles: ["USER"],
    agencyName: "Urban Nest Realty",
    licenseNumber: "KA-AG-312",
    yearsExperience: 6,
    specializations: ["Apartments", "Condos", "PG Accommodations"],
    languages: ["English", "Kannada", "Hindi"],
    serviceAreas: ["Bengaluru", "Koramangala", "Indiranagar"],
    bio: "Focused on city homes, rental strategy, and helping first-time buyers in Bengaluru.",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    verificationStatus: "APPROVED",
    status: "ACTIVE",
    commissionRate: 2.2,
    rating: 4.6,
    totalReviews: 86,
  },
  {
    name: "Vikram Patel",
    email: "vikram.agent4@example.com",
    phone: "+91 98989 11223",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    latitude: 23.0225,
    longitude: 72.5714,
    roles: ["USER"],
    agencyName: "Patel Horizon Homes",
    licenseNumber: "GJ-AG-442",
    yearsExperience: 12,
    specializations: ["Villa Sales", "Plots", "Luxury Homes"],
    languages: ["Gujarati", "Hindi", "English"],
    serviceAreas: ["Ahmedabad", "Satellite", "Prahladnagar"],
    bio: "Known for premium property advisory and strategic negotiation for high-value transactions.",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    verificationStatus: "APPROVED",
    status: "ACTIVE",
    commissionRate: 2.8,
    rating: 4.9,
    totalReviews: 178,
  },
  {
    name: "Sneha Verma",
    email: "sneha.agent5@example.com",
    phone: "+91 97444 88991",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    latitude: 17.385,
    longitude: 78.4867,
    roles: ["USER"],
    agencyName: "Skyline Property Advisors",
    licenseNumber: "TS-AG-505",
    yearsExperience: 7,
    specializations: ["Plot Deals", "Apartments", "Family Homes"],
    languages: ["Hindi", "Telugu", "English"],
    serviceAreas: ["Hyderabad", "Madhapur", "Gachibowli"],
    bio: "Specializes in family homes and plot investments for growing neighborhoods in Hyderabad.",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    isFeatured: false,
    verificationStatus: "PENDING",
    status: "ACTIVE",
    commissionRate: 2.4,
    rating: 4.5,
    totalReviews: 49,
  },
];

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const insertedAgents = [];

  for (const agent of agentSeedData) {
    const existingUser = await User.findOne({ email: agent.email.toLowerCase() });

    let user = existingUser;
    if (!user) {
      user = await User.create({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        roles: agent.roles,
        passwordHash: "dummy-seed-user",
        city: agent.city,
        state: agent.state,
        country: agent.country,
        latitude: agent.latitude,
        longitude: agent.longitude,
        emailVerified: true,
      });
    }

    const profilePayload = {
      user: user._id,
      fullName: agent.name,
      agencyName: agent.agencyName,
      licenseNumber: agent.licenseNumber,
      yearsExperience: agent.yearsExperience,
      phone: agent.phone,
      email: agent.email,
      specializations: agent.specializations,
      languages: agent.languages,
      serviceAreas: agent.serviceAreas,
      bio: agent.bio,
      profileImage: agent.profileImage,
      isFeatured: agent.isFeatured,
      verificationStatus: agent.verificationStatus,
      status: agent.status,
      rating: agent.rating,
      totalReviews: agent.totalReviews,
      city: agent.city,
      state: agent.state,
      country: agent.country,
      location: {
        type: "Point",
        coordinates: [agent.longitude, agent.latitude],
      },
      commissionRate: agent.commissionRate,
    };

    const profile = await AgentProfile.findOneAndUpdate(
      { user: user._id },
      { $set: profilePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    insertedAgents.push(profile);
  }

  console.log(`Inserted/updated ${insertedAgents.length} agent profiles.`);
  console.log(JSON.stringify(insertedAgents.map((agent) => ({
    id: agent._id,
    name: agent.fullName,
    agency: agent.agencyName,
    status: agent.status,
  })), null, 2));
} catch (error) {
  console.error("Seed failed:", error);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
