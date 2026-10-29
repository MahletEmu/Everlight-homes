export const BAHIR_DAR_NEIGHBORHOODS = [
  "Kebele 01 (Lake Tana Shore / ጣና ሐይቅ)",
  "Kebele 03 (Tana Subcity / ጣና ክፍለ ከተማ)",
  "Kebele 04 (Central Market / መሃል ገበያ)",
  "Kebele 05 (Gishe Abay / ግሼ አባይ)",
  "Kebele 06 (Residential Zone)",
  "Kebele 11 (Belay Zeleke / በላይ ዘለቀ)",
  "Kebele 13 (Diaspora Village / ዲያስፖራ)",
  "Kebele 14 (Ginbot 20 / ግንቦት 20)",
  "Kebele 16 (St. George / ጊዮርጊስ)",
  "Abay Mado (Blue Nile Bridge / አባይ ማዶ)",
  "Shimbit (ሽምቢት)",
  "Bezawit Hill (በዛዊት አካባቢ)",
  "Poly / BDU Campus (ፖሊ / ዩኒቨርሲቲ)",
  "Felege Hiwot (ፈlege ህይወት አካባቢ)",
] as const;

export const ETHIOPIAN_CITIES = [
  {
    name: "Bahir Dar",
    neighborhoods: [
      "Kebele 01 (Lake Tana Shore / ጣና ሐይቅ)",
      "Kebele 03 (Tana Subcity / ጣና ክፍለ ከተማ)",
      "Kebele 04 (Central Market / መሃል ገበያ)",
      "Kebele 05 (Gishe Abay / ግሼ አባይ)",
      "Kebele 06 (Residential Zone)",
      "Kebele 11 (Belay Zeleke / በላይ ዘለቀ)",
      "Kebele 13 (Diaspora Village / ዲያስፖራ)",
      "Kebele 14 (Ginbot 20 / ግንቦት 20)",
      "Kebele 16 (St. George / ጊዮርጊስ)",
      "Abay Mado (Blue Nile Bridge / አባይ ማዶ)",
      "Shimbit (ሽምቢት)",
      "Bezawit Hill (በዛዊት አካባቢ)",
      "Poly / BDU Campus (ፖሊ / ዩኒቨርሲቲ)",
      "Felege Hiwot (ፈlege ህይወት አካባቢ)",
    ],
  },
] as const;

export const PROPERTY_TYPES = [
  { id: "apartment", label: "Modern Apartment", icon: "Building2" },
  { id: "house", label: "Stand-Alone Villa / House", icon: "Home" },
  { id: "condo", label: "Condominium (G+)", icon: "Building" },
  { id: "private_room", label: "Private Room", icon: "DoorClosed" },
  { id: "shared", label: "Shared Accommodation", icon: "Users" },
  { id: "commercial", label: "Office / Commercial Space", icon: "Briefcase" },
] as const;

export const AMENITIES_LIST = [
  { id: "backup_generator", label: "Backup Generator", icon: "Zap" },
  { id: "water_tank", label: "Water Reservoir Tank", icon: "Droplets" },
  { id: "wifi", label: "High-Speed Internet / WiFi", icon: "Wifi" },
  { id: "parking", label: "Dedicated Parking Space", icon: "Car" },
  { id: "security", label: "24/7 Security & Guard", icon: "Shield" },
  { id: "furnished", label: "Fully Furnished", icon: "Sofa" },
  { id: "modern_kitchen", label: "Modern Fitted Kitchen", icon: "Utensils" },
  { id: "balcony", label: "Balcony / Scenic View", icon: "Sun" },
  { id: "elevator", label: "Elevator / Lift", icon: "ArrowUpDown" },
  { id: "garden", label: "Private Garden / Compound", icon: "Trees" },
] as const;

export const CURRENCY = {
  code: "ETB",
  symbol: "Br",
  name: "Ethiopian Birr",
};

export const VERIFICATION_TIERS = {
  unverified: {
    label: "Unverified",
    description: "Property listed without identity verification or physical inspection.",
    badgeClass: "bg-stone-100 text-stone-600 border-stone-200",
  },
  owner_verified: {
    label: "Owner ID Verified",
    description: "Landlord identity & ownership documents reviewed by Everlight moderators.",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
  },
  physically_inspected: {
    label: "Physically Inspected",
    description: "Property visited and inspected in-person by an Everlight field agent.",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  fully_verified: {
    label: "Fully Verified & Inspected",
    description: "Both owner identity and physical property inspection verified by Everlight.",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
};
