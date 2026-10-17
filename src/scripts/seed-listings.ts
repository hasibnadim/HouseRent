// Seeds 1,000 listings across Bangladesh, owned by Nadim Owner.
// Run from the repo root:  node src/scripts/seed-listings.ts
// (Node 24+ strips types natively; DATABASE_URL comes from .env.)
// Idempotent: exits early once the owner already has 1,000 listings.

import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "../prisma/db.ts";

const TARGET_COUNT = 16002;
const OWNER_EMAIL = "nadimshah206@gmail.com";
const BATCH_SIZE = 40;

type Area = { area: string; city: string; baseRent: number };

const AREAS: Area[] = [
  { area: "Gulshan", city: "Dhaka", baseRent: 55000 },
  { area: "Banani", city: "Dhaka", baseRent: 52000 },
  { area: "Baridhara", city: "Dhaka", baseRent: 60000 },
  { area: "Dhanmondi", city: "Dhaka", baseRent: 42000 },
  { area: "Bashundhara", city: "Dhaka", baseRent: 35000 },
  { area: "Uttara", city: "Dhaka", baseRent: 30000 },
  { area: "Mohammadpur", city: "Dhaka", baseRent: 26000 },
  { area: "Mirpur", city: "Dhaka", baseRent: 22000 },
  { area: "Motijheel", city: "Dhaka", baseRent: 24000 },
  { area: "Wari", city: "Dhaka", baseRent: 23000 },
  { area: "Banasree", city: "Dhaka", baseRent: 25000 },
  { area: "Khilgaon", city: "Dhaka", baseRent: 21000 },
  { area: "GEC Circle", city: "Chattogram", baseRent: 32000 },
  { area: "Khulshi", city: "Chattogram", baseRent: 35000 },
  { area: "Agrabad", city: "Chattogram", baseRent: 24000 },
  { area: "Nasirabad", city: "Chattogram", baseRent: 22000 },
  { area: "Halishahar", city: "Chattogram", baseRent: 18000 },
  { area: "Zindabazar", city: "Sylhet", baseRent: 22000 },
  { area: "Ambarkhana", city: "Sylhet", baseRent: 20000 },
  { area: "Shibganj", city: "Sylhet", baseRent: 17000 },
  { area: "Sonadanga", city: "Khulna", baseRent: 16000 },
  { area: "Khalishpur", city: "Khulna", baseRent: 14000 },
  { area: "Shaheb Bazar", city: "Rajshahi", baseRent: 15000 },
  { area: "Uposhohor", city: "Rajshahi", baseRent: 13000 },
  { area: "Sadar Road", city: "Barishal", baseRent: 13000 },
  { area: "Nathullabad", city: "Barishal", baseRent: 11000 },
  { area: "Jahaj Company Mor", city: "Rangpur", baseRent: 12000 },
  { area: "Dhap", city: "Rangpur", baseRent: 10000 },
  { area: "Ganginar Par", city: "Mymensingh", baseRent: 12000 },
  { area: "Charpara", city: "Mymensingh", baseRent: 10000 },
];

const PHOTOS = [
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600047509807-ba8f99d2cdde",
  "photo-1568605114967-8130f3a36994",
  "photo-1570129477492-45c003edd2be",
  "photo-1564013799919-ab600027ffc6",
  "photo-1580587771525-78b9dba3b914",
  "photo-1512917774080-9991f1c4c750",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600566752355-35792bedcfea",
  "photo-1600573472592-401b489a3cdc",
  "photo-1600585154526-990dced4db0d",
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`);

const ADJECTIVES = ["Sunny", "Spacious", "Modern", "Cozy", "Bright", "Family", "Newly built", "Airy", "Elegant", "Peaceful"];
const AMENITIES = ["WiFi", "Lift", "Generator", "Parking", "Gas", "CCTV", "Caretaker", "Balcony", "AC", "Geyser", "Dining space", "Rooftop access"];
const TYPES = ["APARTMENT", "APARTMENT", "APARTMENT", "APARTMENT", "HOUSE", "HOUSE", "ROOM", "VILLA", "OTHER"] as const;
const RULES = [
  "No smoking inside. Quiet hours after 10pm.",
  "Small family preferred. No pets.",
  "Bachelor tenants welcome with prior approval.",
  "No subletting. Keep common areas clean.",
  "Guests allowed with prior notice to the caretaker.",
];

// Deterministic RNG so re-runs produce the same catalogue.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261016);
const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)]!;
const int = (min: number, max: number): number => min + Math.floor(rand() * (max - min + 1));

function sampleAmenities(): string[] {
  const count = int(2, 6);
  const pool = [...AMENITIES];
  const chosen: string[] = [];
  while (chosen.length < count && pool.length > 0) {
    const index = Math.floor(rand() * pool.length);
    chosen.push(pool.splice(index, 1)[0]!);
  }
  return chosen;
}

async function ensureOwner() {
  const existing = await db.orm.liveBnb.User.where({ email: OWNER_EMAIL }).first();
  if (existing) {
    if (existing.role !== "OWNER") {
      await db.orm.liveBnb.User.where({ email: OWNER_EMAIL }).update({ role: "OWNER" });
    }
    return { id: existing.id, created: false, password: null as string | null };
  }
  const password = randomBytes(9).toString("base64url");
  const created = await db.orm.liveBnb.User.create({
    name: "Nadim Owner",
    email: OWNER_EMAIL,
    passwordHash: await hash(password, 12),
    phone: "+8801700000001",
    role: "OWNER",
  });
  return { id: created.id, created: true, password };
}

async function seedOne(ownerId: string, index: number) {
  const place = AREAS[index % AREAS.length]!;
  const propertyType = pick(TYPES);
  const bedrooms = propertyType === "ROOM" ? int(1, 2) : int(1, 5);
  const bathrooms = Math.min(4, Math.max(1, bedrooms - (rand() < 0.3 ? 1 : 0)));
  const sizeSqft = Math.round((bedrooms * int(380, 520) + int(0, 300)) / 10) * 10;
  const noise = 0.85 + rand() * 0.35;
  const monthlyRent = Math.round(((place.baseRent * (0.55 + (sizeSqft / 1200) * 0.55) * noise) / 500)) * 500;
  const furnished = rand() < 0.4;
  const roll = rand();
  const status = roll < 0.88 ? "PUBLISHED" : roll < 0.95 ? "DRAFT" : roll < 0.98 ? "UNPUBLISHED" : "ARCHIVED";
  const adjective = pick(ADJECTIVES);
  const typeLabel = propertyType.charAt(0) + propertyType.slice(1).toLowerCase();
  const photoCount = int(1, 4);
  const photoOffset = Math.floor(rand() * PHOTOS.length);
  const urls = Array.from({ length: photoCount }, (_, i) => PHOTOS[(photoOffset + i * 3) % PHOTOS.length]!);

  const listing = await db.orm.liveBnb.Listing.create({
    ownerId: ownerId as never,
    title: `${adjective} ${bedrooms}-bed ${typeLabel} in ${place.area}`,
    description:
      `${adjective} ${bedrooms}-bedroom ${typeLabel.toLowerCase()} for rent in ${place.area}, ${place.city}. ` +
      `Offers ${sizeSqft.toLocaleString()} sqft of living space with ${bathrooms} bathroom${bathrooms === 1 ? "" : "s"}${furnished ? ", fully furnished" : ""}. ` +
      `Close to schools, markets and main-road transport. Serious tenants only — contact for a viewing.`,
    city: place.city,
    area: place.area,
    addressNote: `House ${int(1, 60)}, Road ${int(1, 25)}`,
    sizeSqft,
    bedrooms,
    bathrooms,
    propertyType,
    furnished,
    amenities: sampleAmenities(),
    monthlyRent,
    advanceAmount: monthlyRent * (rand() < 0.7 ? 2 : 1),
    serviceChargeNote: rand() < 0.5 ? "Service charge included" : null,
    houseRules: rand() < 0.7 ? pick(RULES) : null,
    availableFrom: null,
    availableTo: null,
    status: status as never,
  });

  for (const [sortOrder, url] of urls.entries()) {
    await db.orm.liveBnb.ListingPhoto.create({ listingId: listing.id, url, sortOrder });
  }
}

async function main() {
  const owner = await ensureOwner();
  console.log(`Owner: Nadim Owner <${OWNER_EMAIL}>${owner.created ? " (created)" : ""}`);
  if (owner.password) {
    console.log(`Demo password (change it after first login): ${owner.password}`);
  }

  const existing = await db.orm.liveBnb.Listing.where({ ownerId: owner.id }).select("id").all();
  console.log(`Existing listings by owner: ${existing.length}`);
  if (existing.length >= TARGET_COUNT) {
    console.log("Target already reached — nothing to seed.");
    await db.close();
    return;
  }

  let done = 0;
  let failed = 0;
  for (let start = existing.length; start < TARGET_COUNT; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, TARGET_COUNT);
    const results = await Promise.allSettled(
      Array.from({ length: end - start }, (_, i) => seedOne(String(owner.id), start + i)),
    );
    for (const result of results) {
      if (result.status === "fulfilled") done += 1;
      else {
        failed += 1;
        console.error(`Seed failed: ${String(result.reason)}`);
      }
    }
    console.log(`Progress: ${existing.length + done}/${TARGET_COUNT} (failed: ${failed})`);
    if (failed > 50) throw new Error("Too many failures — aborting.");
  }

  const sample = await db.orm.liveBnb.Listing.where({ ownerId: owner.id })
    .orderBy((listing) => listing.createdAt.desc())
    .limit(1)
    .all();
  console.log(`Done. Seeded ${done} listings (${failed} failed). Sample: ${sample[0]?.title ?? "n/a"}`);
  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});
