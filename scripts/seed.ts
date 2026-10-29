import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Property, VerificationRecord } from "../src/lib/models";
import { PropertyType } from "../src/types";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/everlight_homes";

async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error("SECURITY BLOCK: Seeding demonstration listings is strictly prohibited in production databases.");
    console.error("Demonstration listings should only be seeded in local or staging development environments.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB for seeding...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  // Hash password
  const saltRounds = 12;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "EverlightAdmin2026!";
  const standardPassword = process.env.INITIAL_DEMO_PASSWORD || "Password123!";

  const adminHash = await bcrypt.hash(adminPassword, saltRounds);
  const userHash = await bcrypt.hash(standardPassword, saltRounds);

  // 1. Create or update Administrator
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@everlight.et";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: process.env.INITIAL_ADMIN_NAME || "Everlight Head Moderator",
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
      accountStatus: "active",
      isVerified: true,
      phone: "+251 911 000 001",
    });
    console.log(`Created administrator: ${adminEmail}`);
  } else {
    console.log(`Admin account ${adminEmail} already exists.`);
  }

  // 2. Create Landlords
  let landlord1 = await User.findOne({ email: "landlord1@everlight.et" });
  if (!landlord1) {
    landlord1 = await User.create({
      name: "Tewodros Kassahun",
      email: "landlord1@everlight.et",
      passwordHash: userHash,
      role: "landlord",
      accountStatus: "active",
      isVerified: true,
      phone: "+251 911 223 344",
    });
    console.log("Created Landlord: Tewodros Kassahun");
  }

  let landlord2 = await User.findOne({ email: "landlord2@everlight.et" });
  if (!landlord2) {
    landlord2 = await User.create({
      name: "Bethlehem Tilahun",
      email: "landlord2@everlight.et",
      passwordHash: userHash,
      role: "landlord",
      accountStatus: "active",
      isVerified: true,
      phone: "+251 922 556 677",
    });
    console.log("Created Landlord: Bethlehem Tilahun");
  }

  // 3. Create Tenant
  let tenant1 = await User.findOne({ email: "tenant1@everlight.et" });
  if (!tenant1) {
    tenant1 = await User.create({
      name: "Yonas Mekonnen",
      email: "tenant1@everlight.et",
      passwordHash: userHash,
      role: "tenant",
      accountStatus: "active",
      isVerified: true,
      phone: "+251 933 889 900",
    });
    console.log("Created Tenant: Yonas Mekonnen");
  }

  // 4. Seed Properties
  const existingProperties = await Property.countDocuments();
  if (existingProperties === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertiesData: Array<{ landlordId: any; title: string; description: string; propertyType: PropertyType; monthlyRent: number; deposit: number; city: string; neighborhood: string; addressDetails?: string; bedrooms: number; bathrooms: number; sizeM2: number; amenities: string[]; images: any[]; availabilityStatus: any; moderationStatus: any; verificationStatus: any; featured: boolean; }> = [
      {
        landlordId: landlord1._id,
        title: "The Azure Villa & Gardens",
        description:
          "Exceptional modern executive villa with manicured gardens, heavy-duty backup diesel generator, 10,000L water reservoir, and 24/7 security in Old Airport diplomatic enclave.",
        propertyType: "house",
        monthlyRent: 120000,
        deposit: 120000,
        city: "Addis Ababa",
        neighborhood: "Old Airport, Bisrate Gabriel",
        addressDetails: "Near Vatican Embassy, Villa 45",
        bedrooms: 4,
        bathrooms: 4,
        sizeM2: 320,
        amenities: ["backup_generator", "water_tank", "security", "parking", "garden", "furnished"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
            caption: "Exterior facade with evening lighting",
          },
          {
            url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
            caption: "Spacious contemporary salon",
          },
        ],
        availabilityStatus: "available",
        moderationStatus: "approved",
        verificationStatus: "fully_verified",
        featured: true,
      },
      {
        landlordId: landlord2._id,
        title: "Skyline Luxury Residences",
        description:
          "High-floor executive condominium overlooking Bole Medhanialem with floor-to-ceiling windows, imported European fitted kitchen, and high-speed elevator access.",
        propertyType: "apartment",
        monthlyRent: 85000,
        deposit: 85000,
        city: "Addis Ababa",
        neighborhood: "Bole Atlas, Medhanialem",
        addressDetails: "Tower B, 7th Floor, Atlas Road",
        bedrooms: 3,
        bathrooms: 3,
        sizeM2: 175,
        amenities: ["elevator", "backup_generator", "water_tank", "wifi", "parking", "security", "modern_kitchen"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
            caption: "Modern mid-rise building facade",
          },
        ],
        availabilityStatus: "available",
        moderationStatus: "approved",
        verificationStatus: "owner_verified",
        featured: true,
      },
      {
        landlordId: landlord1._id,
        title: "Serene Garden Bungalow",
        description:
          "Tranquil residential bungalow located in the secure Sarbet enclave. Includes sunny private garden, solar water heating, and guardhouse.",
        propertyType: "house",
        monthlyRent: 65000,
        deposit: 65000,
        city: "Addis Ababa",
        neighborhood: "Sarbet & South Africa Embassy Area",
        addressDetails: "Compound 12, Sarbet",
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 210,
        amenities: ["water_tank", "parking", "security", "garden"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
            caption: "Front lawn and veranda",
          },
        ],
        availabilityStatus: "available",
        moderationStatus: "approved",
        verificationStatus: "physically_inspected",
        featured: true,
      },
      {
        landlordId: landlord2._id,
        title: "Tana Lakeside View Villa",
        description:
          "Peaceful lakeside residence in Bahir Dar with panoramic views of Lake Tana, lush gardens, and quiet residential neighborhood.",
        propertyType: "house",
        monthlyRent: 45000,
        deposit: 45000,
        city: "Bahir Dar",
        neighborhood: "Kebele 01 (Lake View)",
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 190,
        amenities: ["water_tank", "parking", "garden", "balcony"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
          },
        ],
        availabilityStatus: "available",
        moderationStatus: "approved",
        verificationStatus: "fully_verified",
        featured: false,
      },
      {
        landlordId: landlord1._id,
        title: "Kazanchis Executive Apartment",
        description:
          "Steps from UNECA and Intercontinental, fully furnished 2-bedroom serviced apartment with backup power and fiber optic internet.",
        propertyType: "apartment",
        monthlyRent: 55000,
        deposit: 55000,
        city: "Addis Ababa",
        neighborhood: "Kazanchis & Bambis",
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 120,
        amenities: ["backup_generator", "wifi", "elevator", "parking", "furnished", "security"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
          },
        ],
        availabilityStatus: "available",
        moderationStatus: "approved",
        verificationStatus: "owner_verified",
        featured: false,
      },
      {
        landlordId: landlord2._id,
        title: "Hawassa Lakeside Retreat Condo",
        description:
          "Modern condominium with views towards Lake Hawassa, dedicated security, and modern amenities.",
        propertyType: "condo",
        monthlyRent: 28000,
        deposit: 28000,
        city: "Hawassa",
        neighborhood: "Lake View Residential",
        bedrooms: 2,
        bathrooms: 1,
        sizeM2: 95,
        amenities: ["water_tank", "parking", "balcony"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
          },
        ],
        availabilityStatus: "available",
        moderationStatus: "approved",
        verificationStatus: "unverified",
        featured: false,
      },
    ];

    for (const p of propertiesData) {
      const createdProp = await Property.create(p);
      await VerificationRecord.create({
        propertyId: createdProp._id,
        landlordId: createdProp.landlordId,
        ownerVerificationStatus:
          p.verificationStatus === "fully_verified" || p.verificationStatus === "owner_verified"
            ? "verified"
            : "pending",
        physicalInspectionStatus:
          p.verificationStatus === "fully_verified" || p.verificationStatus === "physically_inspected"
            ? "inspected"
            : "not_requested",
        inspectionDate: new Date(),
        inspectorName: "Everlight Field Officer",
        notes: "Initial seed verification record.",
      });
    }
    console.log(`Seeded ${propertiesData.length} properties with verification records.`);
  } else {
    console.log(`${existingProperties} properties already present in database.`);
  }

  await mongoose.disconnect();
  console.log("Database connection closed. Seeding complete.");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
