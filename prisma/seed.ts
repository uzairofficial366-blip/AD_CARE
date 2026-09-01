import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding database...");

  // Clean all data in correct order (foreign key dependencies)
  await prisma.auditLog.deleteMany({});
  await prisma.loyaltyTransaction.deleteMany({});
  await prisma.loyaltyAccount.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.ticketMessage.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.refillReminder.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.stockAlert.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.deliveryAgent.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.prescriptionAuditLog.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("Pharmacy123!", 10);

  // ─── USERS ──────────────────────────────────────────────────
  const superadmin = await prisma.user.create({
    data: { name: "Super Admin", email: "superadmin@pharmacy.com", passwordHash, role: "SUPERADMIN", phone: "+1-800-555-0100" },
  });

  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@pharmacy.com", passwordHash, role: "ADMIN", phone: "+1-800-555-0199" },
  });

  const pharmacist = await prisma.user.create({
    data: { name: "Dr. Sarah Jenkins, PharmD", email: "pharmacist@pharmacy.com", passwordHash, role: "PHARMACIST", phone: "+1-800-555-0188" },
  });

  const customers = await Promise.all([
    prisma.user.create({ data: { name: "John Doe", email: "customer@pharmacy.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0142" } }),
    prisma.user.create({ data: { name: "Maria Garcia", email: "maria@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0201" } }),
    prisma.user.create({ data: { name: "Robert Chen", email: "robert@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0302" } }),
    prisma.user.create({ data: { name: "Emily Watson", email: "emily@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0403" } }),
    prisma.user.create({ data: { name: "James Johnson", email: "james@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0504" } }),
    prisma.user.create({ data: { name: "Aisha Patel", email: "aisha@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0605" } }),
    prisma.user.create({ data: { name: "David Kim", email: "david@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0706" } }),
    prisma.user.create({ data: { name: "Sarah Thompson", email: "sarah.t@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0807" } }),
    prisma.user.create({ data: { name: "Michael Brown", email: "michael@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-0908" } }),
    prisma.user.create({ data: { name: "Lisa Nguyen", email: "lisa@example.com", passwordHash, role: "CUSTOMER", phone: "+1-555-1009" } }),
  ]);

  const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10] = customers;

  // ─── ADDRESSES ──────────────────────────────────────────────
  const addresses = await Promise.all([
    prisma.address.create({ data: { userId: c1.id, fullName: "John Doe", phone: "+1-555-0142", street: "742 Evergreen Terrace", city: "Springfield", state: "IL", zipCode: "62704", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c2.id, fullName: "Maria Garcia", phone: "+1-555-0201", street: "1234 Oak Avenue, Apt 5B", city: "Los Angeles", state: "CA", zipCode: "90001", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c3.id, fullName: "Robert Chen", phone: "+1-555-0302", street: "567 Maple Drive", city: "San Francisco", state: "CA", zipCode: "94102", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c4.id, fullName: "Emily Watson", phone: "+1-555-0403", street: "89 Pine Street", city: "Austin", state: "TX", zipCode: "73301", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c5.id, fullName: "James Johnson", phone: "+1-555-0504", street: "210 Birch Lane", city: "Chicago", state: "IL", zipCode: "60601", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c6.id, fullName: "Aisha Patel", phone: "+1-555-0605", street: "456 Cedar Blvd", city: "Houston", state: "TX", zipCode: "77001", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c7.id, fullName: "David Kim", phone: "+1-555-0706", street: "789 Willow Way", city: "Seattle", state: "WA", zipCode: "98101", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c8.id, fullName: "Sarah Thompson", phone: "+1-555-0807", street: "321 Spruce Court", city: "Denver", state: "CO", zipCode: "80201", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c9.id, fullName: "Michael Brown", phone: "+1-555-0908", street: "654 Ash Road", city: "Miami", state: "FL", zipCode: "33101", country: "USA", isDefault: true } }),
    prisma.address.create({ data: { userId: c10.id, fullName: "Lisa Nguyen", phone: "+1-555-1009", street: "987 Elm Circle", city: "Portland", state: "OR", zipCode: "97201", country: "USA", isDefault: true } }),
  ]);

  // ─── CATEGORIES ─────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Prescription Medicines", slug: "prescription-medicines", description: "Requires valid physician prescription verified by a licensed pharmacist", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80" } }),
    prisma.category.create({ data: { name: "OTC Medicines", slug: "otc-medicines", description: "Over-the-counter pain relievers, cold & flu, digestive health", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Vitamins & Supplements", slug: "vitamins-supplements", description: "Multivitamins, minerals, herbal extracts, and immunity boosters", image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Skincare", slug: "skincare", description: "Dermatological cleansers, moisturizers, serums, and sun protection", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Personal Care", slug: "personal-care", description: "Body wash, soaps, deodorants, and daily essentials", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Hair Care", slug: "hair-care", description: "Shampoos, conditioners, anti-dandruff solutions, and scalp treatments", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Oral Care", slug: "oral-care", description: "Toothpaste, toothbrushes, mouthwash, and dental floss", image: "https://images.unsplash.com/photo-1559591937-e58af1009851?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Baby & Mother Care", slug: "baby-mother-care", description: "Infant formula, diapers, baby wipes, and maternal supplements", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Medical Devices", slug: "medical-devices", description: "Blood pressure monitors, thermometers, pulse oximeters", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Wellness", slug: "wellness", description: "Aromatherapy, massage oils, fitness recovery", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80" } }),
    prisma.category.create({ data: { name: "Hygiene Products", slug: "hygiene-products", description: "Hand sanitizers, wipes, antiseptic liquids, feminine care", image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&q=80" } }),
  ]);

  const [catRx, catOtc, catVitamins, catSkincare, catPersonal, catHair, catOral, catBaby, catDevices, catWellness, catHygiene] = categories;

  // ─── BRANDS ─────────────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "Pfizer", slug: "pfizer", description: "Global pharmaceutical leader" } }),
    prisma.brand.create({ data: { name: "Bayer", slug: "bayer", description: "Trusted consumer health & OTC remedies" } }),
    prisma.brand.create({ data: { name: "CeraVe", slug: "cerave", description: "Dermatologist-developed skincare" } }),
    prisma.brand.create({ data: { name: "Centrum", slug: "centrum", description: "World's #1 multivitamin brand" } }),
    prisma.brand.create({ data: { name: "Omron", slug: "omron", description: "Precision home medical monitoring equipment" } }),
    prisma.brand.create({ data: { name: "Johnson & Johnson", slug: "jnj", description: "Broad range of consumer health products" } }),
    prisma.brand.create({ data: { name: "GSK", slug: "gsk", description: "Science-led global healthcare company" } }),
    prisma.brand.create({ data: { name: "Nature Made", slug: "nature-made", description: "America's #1 pharmacist recommended vitamin brand" } }),
    prisma.brand.create({ data: { name: "Colgate", slug: "colgate", description: "World leader in oral care" } }),
    prisma.brand.create({ data: { name: "Philips", slug: "philips", description: "Innovative health technology" } }),
  ]);

  const [brandPfizer, brandBayer, brandCeraVe, brandCentrum, brandOmron, brandJnj, brandGsk, brandNatureMade, brandColgate, brandPhilips] = brands;

  // ─── PRODUCTS (35 total) ────────────────────────────────────
  const products = await Promise.all([
    // Prescription (4)
    prisma.product.create({ data: { name: "Amoxicillin 500mg Capsules (21s)", slug: "amoxicillin-500mg-capsules", description: "Broad-spectrum penicillin antibiotic for bacterial infections. Requires prescription.", sku: "RX-AMOX-500", price: 18.99, salePrice: 15.49, stockQuantity: 120, isPrescriptionRequired: true, dosageForm: "Capsule", activeIngredients: "Amoxicillin Trihydrate 500mg", usageInstructions: "Take 1 capsule every 8 hours as directed.", warnings: "Do not use if allergic to penicillins.", imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80", categoryId: catRx.id, brandId: brandPfizer.id, ratingAverage: 4.8, ratingCount: 42, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Lipitor (Atorvastatin) 20mg Tablets (30s)", slug: "lipitor-atorvastatin-20mg", description: "Statin medication to lower cholesterol and reduce cardiovascular risk.", sku: "RX-LIP-020", price: 34.50, stockQuantity: 85, isPrescriptionRequired: true, dosageForm: "Tablet", activeIngredients: "Atorvastatin Calcium 20mg", usageInstructions: "Take 1 tablet daily in the evening.", warnings: "Avoid grapefruit juice. Regular blood testing required.", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80", categoryId: catRx.id, brandId: brandPfizer.id, ratingAverage: 4.9, ratingCount: 56, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Metformin 500mg Tablets (60s)", slug: "metformin-500mg-tablets", description: "First-line medication for type 2 diabetes management.", sku: "RX-MET-500", price: 12.99, stockQuantity: 200, isPrescriptionRequired: true, dosageForm: "Tablet", activeIngredients: "Metformin Hydrochloride 500mg", usageInstructions: "Take 1 tablet twice daily with meals.", warnings: "Monitor kidney function. May cause GI side effects.", imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80", categoryId: catRx.id, brandId: brandGsk.id, ratingAverage: 4.6, ratingCount: 78, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Omeprazole 20mg Capsules (28s)", slug: "omeprazole-20mg-capsules", description: "Proton pump inhibitor for acid reflux and stomach ulcer treatment.", sku: "RX-OMP-020", price: 16.49, stockQuantity: 150, isPrescriptionRequired: true, dosageForm: "Capsule", activeIngredients: "Omeprazole 20mg", usageInstructions: "Take 1 capsule daily before breakfast for 14 days.", warnings: "Not for immediate heartburn relief. Consult doctor if symptoms persist.", imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80", categoryId: catRx.id, brandId: brandGsk.id, ratingAverage: 4.7, ratingCount: 95, isFeatured: false, isVisible: true } }),

    // OTC (6)
    prisma.product.create({ data: { name: "Bayer Extra Strength Aspirin 500mg (100s)", slug: "bayer-aspirin-500mg", description: "Fast relief for headache, minor arthritis pain, muscle ache, and fever.", sku: "OTC-BAY-500", price: 11.99, salePrice: 9.99, stockQuantity: 250, isPrescriptionRequired: false, dosageForm: "Caplet", activeIngredients: "Aspirin 500mg (NSAID)", usageInstructions: "Take 1-2 caplets every 4-6 hours. Max 8 in 24 hours.", warnings: "Stomach bleeding warning. Keep away from children.", imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80", categoryId: catOtc.id, brandId: brandBayer.id, ratingAverage: 4.7, ratingCount: 128, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Tylenol Extra Strength 500mg (100 Caplets)", slug: "tylenol-extra-strength-500mg", description: "Acetaminophen for fast pain relief and fever reduction.", sku: "OTC-TYL-500", price: 13.49, stockQuantity: 300, isPrescriptionRequired: false, dosageForm: "Caplet", activeIngredients: "Acetaminophen 500mg", usageInstructions: "Take 2 caplets every 6 hours. Max 6 in 24 hours.", warnings: "Do not exceed recommended dose. Liver damage warning.", imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80", categoryId: catOtc.id, brandId: brandJnj.id, ratingAverage: 4.8, ratingCount: 215, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Ibuprofen 200mg Tablets (200s)", slug: "ibuprofen-200mg-tablets", description: "Nonsteroidal anti-inflammatory for pain, swelling, and fever.", sku: "OTC-IBU-200", price: 14.99, salePrice: 12.99, stockQuantity: 180, isPrescriptionRequired: false, dosageForm: "Tablet", activeIngredients: "Ibuprofen 200mg", usageInstructions: "Take 1-2 tablets every 4-6 hours with food.", warnings: "Do not use with other NSAIDs. Stomach ulcer risk.", imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80", categoryId: catOtc.id, brandId: brandBayer.id, ratingAverage: 4.6, ratingCount: 190, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Claritin 24-Hour Allergy Relief (30 Tablets)", slug: "claritin-allergy-relief", description: "Non-drowsy 24-hour antihistamine for indoor and outdoor allergies.", sku: "OTC-CLR-24H", price: 18.99, stockQuantity: 130, isPrescriptionRequired: false, dosageForm: "Tablet", activeIngredients: "Loratadine 10mg", usageInstructions: "Take 1 tablet daily with water.", warnings: "Do not take with alcohol or sedatives.", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80", categoryId: catOtc.id, brandId: brandBayer.id, ratingAverage: 4.5, ratingCount: 165, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Pepto-Bismol Maximum Strength Liquid 236ml", slug: "pepto-bismol-liquid", description: "Relief for nausea, heartburn, indigestion, upset stomach, and diarrhea.", sku: "OTC-PBT-236", price: 9.99, stockQuantity: 160, isPrescriptionRequired: false, dosageForm: "Liquid", activeIngredients: "Bismuth Subsalicylate 525mg/15ml", usageInstructions: "Shake well. Take 30ml every 30 min as needed. Max 8 doses.", warnings: "Do not give to children or teenagers with flu symptoms.", imageUrl: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&q=80", categoryId: catOtc.id, brandId: brandPfizer.id, ratingAverage: 4.4, ratingCount: 88, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Zyrtec-D 12-Hour Allergy + Congestion (24 Tablets)", slug: "zyrtec-d-allergy", description: "Non-drowsy antihistamine with decongestant for allergies and sinus pressure.", sku: "OTC-ZYC-24", price: 22.99, stockQuantity: 90, isPrescriptionRequired: false, dosageForm: "Tablet", activeIngredients: "Cetirizine 5mg, Pseudoephedrine 120mg", usageInstructions: "Take 1 tablet every 12 hours with water.", warnings: "Behind pharmacy counter. ID required. May cause insomnia.", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80", categoryId: catOtc.id, brandId: brandPfizer.id, ratingAverage: 4.7, ratingCount: 142, isFeatured: false, isVisible: true } }),

    // Vitamins & Supplements (5)
    prisma.product.create({ data: { name: "Centrum Adults Complete Multivitamin (130 Tablets)", slug: "centrum-adults-multivitamin", description: "Formulated with 23 essential micronutrients for energy, immunity, and metabolism.", sku: "VIT-CEN-130", price: 19.49, salePrice: 16.99, stockQuantity: 180, isPrescriptionRequired: false, dosageForm: "Tablet", activeIngredients: "Vitamins A, C, D3, E, K, B6, B12, Zinc, Iron", usageInstructions: "Take 1 tablet daily with food.", warnings: "Keep away from children. Iron overdose risk.", imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80", categoryId: catVitamins.id, brandId: brandCentrum.id, ratingAverage: 4.9, ratingCount: 310, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Nature Made Vitamin D3 5000 IU (180 Softgels)", slug: "nature-made-vitamin-d3", description: "High-potency vitamin D3 for bone health and immune support.", sku: "VIT-NMD-D3", price: 14.99, stockQuantity: 220, isPrescriptionRequired: false, dosageForm: "Softgel", activeIngredients: "Cholecalciferol (Vitamin D3) 5000 IU", usageInstructions: "Take 1 softgel daily with a meal.", warnings: "Do not exceed recommended dose. Consult doctor if pregnant.", imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80", categoryId: catVitamins.id, brandId: brandNatureMade.id, ratingAverage: 4.8, ratingCount: 267, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Fish Oil Omega-3 1000mg (200 Softgels)", slug: "fish-oil-omega3-1000mg", description: "Supports heart, brain, and joint health with EPA and DHA.", sku: "VIT-OMG-1000", price: 17.99, salePrice: 14.99, stockQuantity: 145, isPrescriptionRequired: false, dosageForm: "Softgel", activeIngredients: "EPA 300mg, DHA 200mg", usageInstructions: "Take 2 softgels daily with meals.", warnings: "Fish allergy caution. May interact with blood thinners.", imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80", categoryId: catVitamins.id, brandId: brandNatureMade.id, ratingAverage: 4.6, ratingCount: 178, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Vitamin C 1000mg Timed-Release (100 Tablets)", slug: "vitamin-c-1000mg", description: "High-dose vitamin C with rose hips for immune support and antioxidant protection.", sku: "VIT-VC-1000", price: 11.99, stockQuantity: 200, isPrescriptionRequired: false, dosageForm: "Tablet", activeIngredients: "Ascorbic Acid 1000mg", usageInstructions: "Take 1 tablet daily with water.", warnings: "May cause diarrhea at high doses. Kidney stone risk.", imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80", categoryId: catVitamins.id, brandId: brandNatureMade.id, ratingAverage: 4.5, ratingCount: 145, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Zinc 50mg Tablets (100 Tablets)", slug: "zinc-50mg-tablets", description: "Essential mineral for immune function and wound healing.", sku: "VIT-ZNC-50", price: 8.99, stockQuantity: 170, isPrescriptionRequired: false, dosageForm: "Tablet", activeIngredients: "Zinc Gluconate 50mg", usageInstructions: "Take 1 tablet daily with food.", warnings: "May cause nausea on empty stomach. Do not exceed 40mg elemental zinc.", imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80", categoryId: catVitamins.id, brandId: brandNatureMade.id, ratingAverage: 4.4, ratingCount: 112, isFeatured: false, isVisible: true } }),

    // Skincare (4)
    prisma.product.create({ data: { name: "CeraVe Hydrating Facial Cleanser 473ml", slug: "cerave-hydrating-cleanser", description: "Non-foaming cleanser with 3 essential ceramides and hyaluronic acid.", sku: "SKIN-CER-473", price: 16.99, stockQuantity: 95, isPrescriptionRequired: false, dosageForm: "Lotion Cleanser", activeIngredients: "Ceramides 1, 3, 6-II, Hyaluronic Acid", usageInstructions: "Wet skin, massage cleanser gently, rinse.", warnings: "For external use only. Avoid eye contact.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", categoryId: catSkincare.id, brandId: brandCeraVe.id, ratingAverage: 4.9, ratingCount: 450, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "CeraVe Moisturizing Cream 340g", slug: "cerave-moisturizing-cream", description: "Rich cream with ceramides and MVE technology for 24-hour hydration.", sku: "SKIN-CER-CRM", price: 18.99, salePrice: 15.99, stockQuantity: 110, isPrescriptionRequired: false, dosageForm: "Cream", activeIngredients: "Ceramides 1, 3, 6-II, Hyaluronic Acid, Petrolatum", usageInstructions: "Apply liberally as often as needed on face and body.", warnings: "For external use only.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", categoryId: catSkincare.id, brandId: brandCeraVe.id, ratingAverage: 4.8, ratingCount: 380, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Neutrogena SPF 50+ Sunscreen Lotion 100ml", slug: "neutrogena-spf50-sunscreen", description: "Broad-spectrum UVA/UVB protection, water-resistant for 80 minutes.", sku: "SKIN-NEU-SPF", price: 13.99, stockQuantity: 85, isPrescriptionRequired: false, dosageForm: "Lotion", activeIngredients: "Avobenzone 3%, Octisalate 5%, Octocrylene 7%", usageInstructions: "Apply generously 15 minutes before sun exposure. Reapply every 2 hours.", warnings: "For external use only. May stain clothing.", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80", categoryId: catSkincare.id, brandId: brandJnj.id, ratingAverage: 4.6, ratingCount: 198, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "CeraVe SA Smoothing Cleanser 236ml", slug: "cerave-sa-cleanser", description: "Salicylic acid cleanser for rough, bumpy skin. Exfoliates and softens.", sku: "SKIN-CER-SA", price: 14.99, stockQuantity: 75, isPrescriptionRequired: false, dosageForm: "Gel Cleanser", activeIngredients: "Salicylic Acid 2%, Ceramides, Niacinamide", usageInstructions: "Massage onto wet skin. Rinse thoroughly. Use 1-2 times daily.", warnings: "Avoid eye contact. Use sunscreen with AHA products.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", categoryId: catSkincare.id, brandId: brandCeraVe.id, ratingAverage: 4.7, ratingCount: 165, isFeatured: false, isVisible: true } }),

    // Personal Care (3)
    prisma.product.create({ data: { name: "Dove Deep Moisture Body Wash 709ml", slug: "dove-deep-moisture-body-wash", description: "Gentle cleanser with NutriumMoisture for softer, smoother skin.", sku: "PC-DOV-BW709", price: 8.99, stockQuantity: 200, isPrescriptionRequired: false, dosageForm: "Liquid Wash", activeIngredients: "Gentle Surfactants, NutriumMoisture", usageInstructions: "Apply to wet skin, lather, rinse thoroughly.", warnings: "For external use only.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", categoryId: catPersonal.id, brandId: brandJnj.id, ratingAverage: 4.6, ratingCount: 230, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Old Spice Swagger Deodorant 106g", slug: "old-spice-swagger-deodorant", description: "48-hour odor protection with a classic masculine scent.", sku: "PC-OS-SWG", price: 7.49, stockQuantity: 180, isPrescriptionRequired: false, dosageForm: "Stick", activeIngredients: "Aluminum Zirconium 19.1%", usageInstructions: "Apply to underarms daily.", warnings: "Do not apply to broken skin. Discontinue if irritation occurs.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", categoryId: catPersonal.id, brandId: brandPfizer.id, ratingAverage: 4.3, ratingCount: 155, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Dettol Antiseptic Liquid 500ml", slug: "dettol-antiseptic-liquid", description: "Trusted protection against 99.9% of germs. Multi-purpose disinfectant.", sku: "PC-DET-ANT", price: 6.99, stockQuantity: 250, isPrescriptionRequired: false, dosageForm: "Liquid", activeIngredients: "Chloroxylenol 4.8%", usageInstructions: "For surface disinfection: dilute 1 cap in 500ml water. For first aid: dilute 2 caps in pint of water.", warnings: "Poison. Do not swallow. Keep away from eyes.", imageUrl: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=600&q=80", categoryId: catPersonal.id, brandId: brandJnj.id, ratingAverage: 4.7, ratingCount: 285, isFeatured: false, isVisible: true } }),

    // Hair Care (2)
    prisma.product.create({ data: { name: "Nizoral Anti-Dandruff Shampoo 120ml", slug: "nizoral-anti-dandruff-shampoo", description: "Clinically proven to control flaking, scaling, and itching from dandruff.", sku: "HC-NIZ-120", price: 12.99, stockQuantity: 85, isPrescriptionRequired: false, dosageForm: "Shampoo", activeIngredients: "Ketoconazole 1%", usageInstructions: "Use on affected areas 2-4 times weekly. Leave on 3-5 minutes before rinsing.", warnings: "For external use only. Avoid contact with eyes.", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", categoryId: catHair.id, brandId: brandJnj.id, ratingAverage: 4.6, ratingCount: 175, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Pantene Pro-V Smooth & Silky Shampoo 750ml", slug: "pantene-smooth-silky-shampoo", description: "Pro-Vitamin formula for deeply nourished, frizz-free hair.", sku: "HC-PAN-SS750", price: 9.99, stockQuantity: 160, isPrescriptionRequired: false, dosageForm: "Shampoo", activeIngredients: "Pro-Vitamin B5, Argan Oil", usageInstructions: "Lather on wet hair, rinse thoroughly. Follow with conditioner.", warnings: "For external use only.", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", categoryId: catHair.id, brandId: brandPfizer.id, ratingAverage: 4.4, ratingCount: 198, isFeatured: false, isVisible: true } }),

    // Oral Care (2)
    prisma.product.create({ data: { name: "Colgate Total Whitening Toothpaste 170g", slug: "colgate-total-whitening", description: "12-hour protection against bacteria with whitening power.", sku: "OC-COL-TW170", price: 6.49, stockQuantity: 300, isPrescriptionRequired: false, dosageForm: "Paste", activeIngredients: "Stannous Fluoride 0.243%, Hydrated Silica", usageInstructions: "Brush thoroughly for 2 minutes, twice daily.", warnings: "Do not swallow. Children under 6 use pea-sized amount.", imageUrl: "https://images.unsplash.com/photo-1559591937-e58af1009851?w=600&q=80", categoryId: catOral.id, brandId: brandColgate.id, ratingAverage: 4.7, ratingCount: 320, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Listine Cool Mint Mouthwash 500ml", slug: "listine-cool-mint-mouthwash", description: "Kills 99.9% of germs and reduces plaque for fresher breath.", sku: "OC-LIS-CM500", price: 7.99, stockQuantity: 170, isPrescriptionRequired: false, dosageForm: "Liquid", activeIngredients: "Eucalyptol, Menthol, Thymol, Methyl Salicylate", usageInstructions: "Rinse with 20ml for 30 seconds. Do not swallow.", warnings: "Do not swallow. Not suitable for children under 12.", imageUrl: "https://images.unsplash.com/photo-1559591937-e58af1009851?w=600&q=80", categoryId: catOral.id, brandId: brandJnj.id, ratingAverage: 4.5, ratingCount: 195, isFeatured: false, isVisible: true } }),

    // Medical Devices (3)
    prisma.product.create({ data: { name: "Omron 10 Series Blood Pressure Monitor", slug: "omron-10-series-bp", description: "Clinically validated wireless monitor with Bluetooth sync and irregular heartbeat detection.", sku: "DEV-OMR-10S", price: 89.99, salePrice: 74.99, stockQuantity: 40, isPrescriptionRequired: false, dosageForm: "Electronic Device", activeIngredients: "N/A", usageInstructions: "Wrap cuff at heart height. Press START. Sit quietly.", warnings: "Consult healthcare provider to interpret readings.", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80", categoryId: catDevices.id, brandId: brandOmron.id, ratingAverage: 4.8, ratingCount: 89, isFeatured: true, isVisible: true } }),
    prisma.product.create({ data: { name: "Braun ThermoScan 7 Ear Thermometer", slug: "braun-thermoscan-7", description: "Age Precision technology with pre-warmed tip for accurate readings.", sku: "DEV-BRA-T7", price: 49.99, stockQuantity: 55, isPrescriptionRequired: false, dosageForm: "Electronic Device", activeIngredients: "N/A", usageInstructions: "Insert into ear canal. Press button. Reading displays in seconds.", warnings: "Use new lens filter for each reading. Clean probe after use.", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80", categoryId: catDevices.id, brandId: brandPhilips.id, ratingAverage: 4.7, ratingCount: 72, isFeatured: false, isVisible: true } }),
    prisma.product.create({ data: { name: "Contour Next One Blood Glucose Meter Kit", slug: "contour-next-one-glucose-meter", description: "Smart glucose monitoring with Bluetooth and color range indicators.", sku: "DEV-CON-NX1", price: 39.99, stockQuantity: 65, isPrescriptionRequired: false, dosageForm: "Electronic Device", activeIngredients: "N/A", usageInstructions: "Insert test strip. Apply blood sample to strip tip. Read result in 5 seconds.", warnings: "For in-vitro diagnostic use. Use only Contour Next test strips.", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80", categoryId: catDevices.id, brandId: brandPhilips.id, ratingAverage: 4.6, ratingCount: 58, isFeatured: false, isVisible: true } }),

    // Wellness (1)
    prisma.product.create({ data: { name: "Biofreeze Professional Pain Relief Gel 113g", slug: "biofreeze-pain-relief-gel", description: "Topical analgesic for temporary relief of minor aches and pains.", sku: "WELL-BIO-113", price: 12.99, stockQuantity: 120, isPrescriptionRequired: false, dosageForm: "Gel", activeIngredients: "Menthol 5%", usageInstructions: "Apply to affected area up to 4 times daily. Massage gently.", warnings: "Do not use on broken skin or with heating pads.", imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80", categoryId: catWellness.id, brandId: brandNatureMade.id, ratingAverage: 4.5, ratingCount: 135, isFeatured: false, isVisible: true } }),

    // Baby (1)
    prisma.product.create({ data: { name: "Pampers Baby Dry Diapers Size 4 (180 Count)", slug: "pampers-baby-dry-size4", description: "Up to 12 hours of overnight dryness with 3 absorption channels.", sku: "BAB-PAM-D4", price: 44.99, salePrice: 39.99, stockQuantity: 70, isPrescriptionRequired: false, dosageForm: "Diaper", activeIngredients: "N/A", usageInstructions: "Secure diaper snugly around waist. Change every 3-4 hours or as needed.", warnings: "Discontinue use if rash develops. Dispose of properly.", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80", categoryId: catBaby.id, brandId: brandPfizer.id, ratingAverage: 4.8, ratingCount: 420, isFeatured: false, isVisible: true } }),
  ]);

  const p1 = products[0], p2 = products[1], p3 = products[2], p4 = products[3], p5 = products[4], p6 = products[5], p7 = products[6], p8 = products[7], p9 = products[8], p10 = products[9];
  const p11 = products[10], p12 = products[11], p13 = products[12], p14 = products[13], p15 = products[14], p16 = products[15], p17 = products[16], p18 = products[17], p19 = products[18], p20 = products[19];
  const p21 = products[20], p22 = products[21], p23 = products[22], p24 = products[23], p25 = products[24], p26 = products[25], p27 = products[26], p28 = products[27], p29 = products[28], p30 = products[29];
  const p31 = products[30], p32 = products[31], p33 = products[32], p34 = products[33], p35 = products[34];

  // ─── COUPONS ────────────────────────────────────────────────
  await Promise.all([
    prisma.coupon.create({ data: { code: "HEALTH10", discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: 30, expiresAt: daysFromNow(60), isActive: true, description: "10% off orders over $30" } }),
    prisma.coupon.create({ data: { code: "WELCOME5", discountType: "FIXED", discountValue: 5, minOrderAmount: 20, expiresAt: daysFromNow(30), isActive: true, description: "$5 off first order over $20" } }),
    prisma.coupon.create({ data: { code: "SUMMER20", discountType: "PERCENTAGE", discountValue: 20, minOrderAmount: 50, expiresAt: daysFromNow(15), isActive: true, description: "20% off summer health essentials" } }),
    prisma.coupon.create({ data: { code: "FREESHIP", discountType: "FIXED", discountValue: 5, minOrderAmount: 25, expiresAt: daysFromNow(90), isActive: true, description: "Free shipping on orders over $25" } }),
    prisma.coupon.create({ data: { code: "EXPIRED10", discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: 30, expiresAt: daysAgo(10), isActive: false, description: "Expired coupon" } }),
  ]);

  // ─── SUPPLIERS ──────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: "McKesson Corporation", contactPerson: "David Reeves", email: "orders@mckesson.com", phone: "+1-800-422-0280", address: "6555 Frisco Line, Irving, TX 75039" } }),
    prisma.supplier.create({ data: { name: "Cardinal Health", contactPerson: "Sarah Mitchell", email: "supply@cardinalhealth.com", phone: "+1-614-757-5000", address: "7000 Cardinal Pl, Dublin, OH 43017" } }),
    prisma.supplier.create({ data: { name: "AmerisourceBergen", contactPerson: "Tom Grant", email: "procurement@amerisourcebergen.com", phone: "+1-610-727-7000", address: "1 West First Avenue, Conshohocken, PA 19428" } }),
    prisma.supplier.create({ data: { name: "HealthWarehouse Direct", contactPerson: "Lisa Chang", email: "wholesale@healthwarehouse.com", phone: "+1-800-555-0177", address: "200 Commerce Way, Newark, NJ 07102" } }),
  ]);

  // ─── BATCHES ────────────────────────────────────────────────
  await Promise.all([
    prisma.batch.create({ data: { productId: p1.id, batchNumber: "BATCH-AMOX-2026-001", quantity: 100, costPrice: 8.50, sellingPrice: 15.49, expiryDate: daysFromNow(180), supplierId: suppliers[0].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p1.id, batchNumber: "BATCH-AMOX-2026-002", quantity: 50, costPrice: 8.50, sellingPrice: 15.49, expiryDate: daysFromNow(365), supplierId: suppliers[0].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p5.id, batchNumber: "BATCH-ASP-2026-001", quantity: 200, costPrice: 4.20, sellingPrice: 9.99, expiryDate: daysFromNow(400), supplierId: suppliers[1].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p6.id, batchNumber: "BATCH-TYL-2026-001", quantity: 250, costPrice: 5.00, sellingPrice: 13.49, expiryDate: daysFromNow(500), supplierId: suppliers[1].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p11.id, batchNumber: "BATCH-CEN-2026-001", quantity: 150, costPrice: 7.50, sellingPrice: 16.99, expiryDate: daysFromNow(300), supplierId: suppliers[2].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p15.id, batchNumber: "BATCH-CER-2026-001", quantity: 80, costPrice: 6.00, sellingPrice: 16.99, expiryDate: daysFromNow(270), supplierId: suppliers[3].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p2.id, batchNumber: "BATCH-LIP-2025-OLD", quantity: 5, costPrice: 15.00, sellingPrice: 34.50, expiryDate: daysAgo(30), supplierId: suppliers[0].id, status: "EXPIRED" } }),
    prisma.batch.create({ data: { productId: p3.id, batchNumber: "BATCH-MET-2026-001", quantity: 8, costPrice: 4.50, sellingPrice: 12.99, expiryDate: daysFromNow(20), supplierId: suppliers[2].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p29.id, batchNumber: "BATCH-OMR-2026-001", quantity: 35, costPrice: 45.00, sellingPrice: 74.99, expiryDate: daysFromNow(730), supplierId: suppliers[1].id, status: "ACTIVE" } }),
    prisma.batch.create({ data: { productId: p34.id, batchNumber: "BATCH-PAM-2026-001", quantity: 60, costPrice: 22.00, sellingPrice: 39.99, expiryDate: daysFromNow(600), supplierId: suppliers[3].id, status: "ACTIVE" } }),
  ]);

  // ─── DELIVERY AGENTS ────────────────────────────────────────
  const agents = await Promise.all([
    prisma.deliveryAgent.create({ data: { name: "Ahmad Hassan", phone: "+1-555-2001", email: "ahmad@courier.com", isActive: true } }),
    prisma.deliveryAgent.create({ data: { name: "Carlos Rodriguez", phone: "+1-555-2002", email: "carlos@courier.com", isActive: true } }),
    prisma.deliveryAgent.create({ data: { name: "Priya Sharma", phone: "+1-555-2003", email: "priya@courier.com", isActive: true } }),
  ]);

  // ─── ORDERS (15 orders across different statuses) ───────────
  const orderData = [
    { orderNumber: "ORD-2026-100001", userId: c1.id, addressId: addresses[0].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 51.48, discountAmount: 5.0, shippingFee: 4.99, totalAmount: 51.47, items: [{ productId: p1.id, productName: p1.name, unitPrice: 15.49, quantity: 1, isPrescriptionRequired: true, totalPrice: 15.49 }, { productId: p5.id, productName: p5.name, unitPrice: 9.99, quantity: 2, isPrescriptionRequired: false, totalPrice: 19.98 }, { productId: p15.id, productName: p15.name, unitPrice: 16.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 16.99 }], createdAt: daysAgo(14) },
    { orderNumber: "ORD-2026-100002", userId: c2.id, addressId: addresses[1].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 33.48, discountAmount: 0, shippingFee: 0, totalAmount: 33.48, items: [{ productId: p6.id, productName: p6.name, unitPrice: 13.49, quantity: 1, isPrescriptionRequired: false, totalPrice: 13.49 }, { productId: p12.id, productName: p12.name, unitPrice: 14.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 14.99 }, { productId: p30.id, productName: p30.name, unitPrice: 5.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 5.0 }], createdAt: daysAgo(12) },
    { orderNumber: "ORD-2026-100003", userId: c3.id, addressId: addresses[2].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 99.97, discountAmount: 10.0, shippingFee: 0, totalAmount: 89.97, items: [{ productId: p29.id, productName: p29.name, unitPrice: 74.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 74.99 }, { productId: p11.id, productName: p11.name, unitPrice: 16.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 16.99 }, { productId: p31.id, productName: p31.name, unitPrice: 8.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 8.0 }], createdAt: daysAgo(10) },
    { orderNumber: "ORD-2026-100004", userId: c4.id, addressId: addresses[3].id, status: "PROCESSING", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 62.97, discountAmount: 0, shippingFee: 4.99, totalAmount: 67.96, items: [{ productId: p4.id, productName: p4.name, unitPrice: 16.49, quantity: 2, isPrescriptionRequired: true, totalPrice: 32.98 }, { productId: p13.id, productName: p13.name, unitPrice: 17.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 17.99 }, { productId: p7.id, productName: p7.name, unitPrice: 12.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 12.0 }], createdAt: daysAgo(5) },
    { orderNumber: "ORD-2026-100005", userId: c5.id, addressId: addresses[4].id, status: "PENDING", paymentStatus: "PENDING", paymentMethod: "CASH_ON_DELIVERY", subtotal: 44.98, discountAmount: 0, shippingFee: 4.99, totalAmount: 49.97, items: [{ productId: p20.id, productName: p20.name, unitPrice: 12.99, quantity: 2, isPrescriptionRequired: false, totalPrice: 25.98 }, { productId: p30.id, productName: p30.name, unitPrice: 6.49, quantity: 2, isPrescriptionRequired: false, totalPrice: 12.98 }, { productId: p25.id, productName: p25.name, unitPrice: 6.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 6.0 }], createdAt: daysAgo(3) },
    { orderNumber: "ORD-2026-100006", userId: c6.id, addressId: addresses[5].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 29.98, discountAmount: 5.0, shippingFee: 0, totalAmount: 24.98, items: [{ productId: p34.id, productName: p34.name, unitPrice: 39.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 39.99 }], createdAt: daysAgo(8) },
    { orderNumber: "ORD-2026-100007", userId: c7.id, addressId: addresses[6].id, status: "SHIPPED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 56.97, discountAmount: 0, shippingFee: 4.99, totalAmount: 61.96, items: [{ productId: p16.id, productName: p16.name, unitPrice: 14.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 14.99 }, { productId: p22.id, productName: p22.name, unitPrice: 9.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 9.99 }, { productId: p27.id, productName: p27.name, unitPrice: 12.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 12.99 }, { productId: p32.id, productName: p32.name, unitPrice: 19.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 19.0 }], createdAt: daysAgo(4) },
    { orderNumber: "ORD-2026-100008", userId: c8.id, addressId: addresses[7].id, status: "PRESCRIPTION_REQUIRED", paymentStatus: "AUTHORIZED", paymentMethod: "CARD", subtotal: 47.49, discountAmount: 0, shippingFee: 4.99, totalAmount: 52.48, items: [{ productId: p2.id, productName: p2.name, unitPrice: 34.50, quantity: 1, isPrescriptionRequired: true, totalPrice: 34.50 }, { productId: p14.id, productName: p14.name, unitPrice: 12.5, quantity: 1, isPrescriptionRequired: false, totalPrice: 12.5 }], createdAt: daysAgo(2) },
    { orderNumber: "ORD-2026-100009", userId: c9.id, addressId: addresses[8].id, status: "CANCELLED", paymentStatus: "REFUNDED", paymentMethod: "CARD", subtotal: 25.98, discountAmount: 0, shippingFee: 4.99, totalAmount: 30.97, cancelReason: "Customer requested cancellation - found cheaper alternative", items: [{ productId: p8.id, productName: p8.name, unitPrice: 18.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 18.99 }, { productId: p23.id, productName: p23.name, unitPrice: 7.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 7.0 }], createdAt: daysAgo(7) },
    { orderNumber: "ORD-2026-100010", userId: c10.id, addressId: addresses[9].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 84.97, discountAmount: 8.50, shippingFee: 0, totalAmount: 76.47, items: [{ productId: p3.id, productName: p3.name, unitPrice: 12.99, quantity: 1, isPrescriptionRequired: true, totalPrice: 12.99 }, { productId: p10.id, productName: p10.name, unitPrice: 22.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 22.99 }, { productId: p21.id, productName: p21.name, unitPrice: 18.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 18.99 }, { productId: p33.id, productName: p33.name, unitPrice: 12.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 12.99 }, { productId: p35.id, productName: p35.name, unitPrice: 17.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 17.0 }], createdAt: daysAgo(6) },
    { orderNumber: "ORD-2026-100011", userId: c1.id, addressId: addresses[0].id, status: "PENDING", paymentStatus: "PENDING", paymentMethod: "CARD", subtotal: 19.99, discountAmount: 0, shippingFee: 4.99, totalAmount: 24.98, items: [{ productId: p6.id, productName: p6.name, unitPrice: 13.49, quantity: 1, isPrescriptionRequired: false, totalPrice: 13.49 }, { productId: p19.id, productName: p19.name, unitPrice: 6.5, quantity: 1, isPrescriptionRequired: false, totalPrice: 6.5 }], createdAt: daysAgo(1) },
    { orderNumber: "ORD-2026-100012", userId: c2.id, addressId: addresses[1].id, status: "PROCESSING", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 53.97, discountAmount: 0, shippingFee: 4.99, totalAmount: 58.96, items: [{ productId: p9.id, productName: p9.name, unitPrice: 14.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 14.99 }, { productId: p17.id, productName: p17.name, unitPrice: 13.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 13.99 }, { productId: p24.id, productName: p24.name, unitPrice: 11.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 11.99 }, { productId: p28.id, productName: p28.name, unitPrice: 13.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 13.0 }], createdAt: daysAgo(1) },
    { orderNumber: "ORD-2026-100013", userId: c3.id, addressId: addresses[2].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 24.98, discountAmount: 0, shippingFee: 4.99, totalAmount: 29.97, items: [{ productId: p5.id, productName: p5.name, unitPrice: 9.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 9.99 }, { productId: p18.id, productName: p18.name, unitPrice: 15.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 15.0 }], createdAt: daysAgo(20) },
    { orderNumber: "ORD-2026-100014", userId: c4.id, addressId: addresses[3].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "WALLET", subtotal: 35.48, discountAmount: 5.0, shippingFee: 0, totalAmount: 30.48, items: [{ productId: p7.id, productName: p7.name, unitPrice: 9.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 9.99 }, { productId: p26.id, productName: p26.name, unitPrice: 12.5, quantity: 1, isPrescriptionRequired: false, totalPrice: 12.5 }, { productId: p19.id, productName: p19.name, unitPrice: 13.0, quantity: 1, isPrescriptionRequired: false, totalPrice: 13.0 }], createdAt: daysAgo(16) },
    { orderNumber: "ORD-2026-100015", userId: c5.id, addressId: addresses[4].id, status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "CARD", subtotal: 109.98, discountAmount: 11.0, shippingFee: 0, totalAmount: 98.98, items: [{ productId: p1.id, productName: p1.name, unitPrice: 15.49, quantity: 2, isPrescriptionRequired: true, totalPrice: 30.98 }, { productId: p11.id, productName: p11.name, unitPrice: 16.99, quantity: 2, isPrescriptionRequired: false, totalPrice: 33.98 }, { productId: p29.id, productName: p29.name, unitPrice: 74.99, quantity: 1, isPrescriptionRequired: false, totalPrice: 74.99 }], createdAt: daysAgo(25) },
  ];

  const orders = await Promise.all(orderData.map(async (o) => {
    const shippingAddress = await prisma.address.findUnique({ where: { id: o.addressId } });
    return prisma.order.create({
      data: {
        orderNumber: o.orderNumber, userId: o.userId, addressId: o.addressId,
        shippingAddressJson: JSON.stringify(shippingAddress),
        status: o.status, paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod,
        subtotal: o.subtotal, discountAmount: o.discountAmount, shippingFee: o.shippingFee, totalAmount: o.totalAmount,
        cancelReason: (o as any).cancelReason || null,
        estimatedDelivery: o.status === "DELIVERED" ? "Delivered" : "3-5 business days",
        createdAt: o.createdAt,
        items: { create: o.items },
      },
    });
  }));

  // ─── PAYMENTS ───────────────────────────────────────────────
  await Promise.all(orders.filter((o) => o.paymentStatus === "PAID").map((o, i) =>
    prisma.payment.create({ data: { orderId: o.id, userId: o.userId, amount: o.totalAmount, paymentMethod: o.paymentMethod, status: "PAID", transactionId: `TXN-${Date.now()}-${i}`, createdAt: o.createdAt } })
  ));

  // ─── DELIVERIES ─────────────────────────────────────────────
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED");
  await Promise.all([
    ...deliveredOrders.map((o, i) =>
      prisma.delivery.create({ data: { orderId: o.id, agentId: agents[i % agents.length].id, status: "DELIVERED", trackingNumber: `TRK-${10000 + i}`, assignedAt: o.createdAt, deliveredAt: new Date(o.createdAt.getTime() + 3 * 86400000) } })
    ),
    ...shippedOrders.map((o, i) =>
      prisma.delivery.create({ data: { orderId: o.id, agentId: agents[i % agents.length].id, status: "OUT_FOR_DELIVERY", trackingNumber: `TRK-${20000 + i}`, assignedAt: o.createdAt, outForDeliveryAt: new Date() } })
    ),
  ]);

  // ─── PRESCRIPTIONS ──────────────────────────────────────────
  const prescriptions = await Promise.all([
    prisma.prescription.create({ data: { userId: c1.id, patientName: "John Doe", patientAge: 45, fileUrl: "/storage/prescriptions/rx-001.pdf", fileName: "John_Doe_Prescription.pdf", fileMimeType: "application/pdf", status: "APPROVED", pharmacistNotes: "Verified with Dr. Smith's office. Valid for 3 refills.", reviewedById: pharmacist.id, reviewedAt: daysAgo(16) } }),
    prisma.prescription.create({ data: { userId: c4.id, patientName: "Emily Watson", patientAge: 32, fileUrl: "/storage/prescriptions/rx-002.pdf", fileName: "Emily_Watson_Prescription.pdf", fileMimeType: "application/pdf", status: "APPROVED", pharmacistNotes: "Valid prescription from Dr. Williams. Approved.", reviewedById: pharmacist.id, reviewedAt: daysAgo(6) } }),
    prisma.prescription.create({ data: { userId: c8.id, patientName: "Sarah Thompson", patientAge: 58, fileUrl: "/storage/prescriptions/rx-003.pdf", fileName: "Sarah_Thompson_Prescription.pdf", fileMimeType: "application/pdf", status: "PENDING_REVIEW", pharmacistNotes: null, reviewedById: null, reviewedAt: null } }),
    prisma.prescription.create({ data: { userId: c5.id, patientName: "James Johnson", patientAge: 41, fileUrl: "/storage/prescriptions/rx-004.pdf", fileName: "James_Johnson_Rx.pdf", fileMimeType: "application/pdf", status: "APPROVED", pharmacistNotes: "Valid. 30-day supply approved.", reviewedById: pharmacist.id, reviewedAt: daysAgo(26) } }),
    prisma.prescription.create({ data: { userId: c1.id, patientName: "John Doe", patientAge: 45, fileUrl: "/storage/prescriptions/rx-005.pdf", fileName: "John_Doe_FollowUp.pdf", fileMimeType: "application/pdf", status: "REJECTED", pharmacistNotes: "Image is blurry and unreadable. Please resubmit a clear photo.", reviewedById: pharmacist.id, reviewedAt: daysAgo(2) } }),
    prisma.prescription.create({ data: { userId: c7.id, patientName: "David Kim", patientAge: 29, fileUrl: "/storage/prescriptions/rx-006.pdf", fileName: "David_Kim_Prescription.pdf", fileMimeType: "application/pdf", status: "CLARIFICATION_REQUESTED", pharmacistNotes: "Please confirm dosage with your physician and resubmit.", reviewedById: pharmacist.id, reviewedAt: daysAgo(1) } }),
  ]);

  // ─── REVIEWS ────────────────────────────────────────────────
  const reviewData = [
    { userId: c1.id, productId: p1.id, rating: 5, title: "Fast and effective", comment: "Started feeling better within 24 hours. Pharmacist verified my prescription quickly.", isApproved: true, isVerifiedPurchase: true },
    { userId: c2.id, productId: p5.id, rating: 5, title: "Best aspirin brand", comment: "Bayer never disappoints. Fast headache relief every time.", isApproved: true, isVerifiedPurchase: true },
    { userId: c3.id, productId: p15.id, rating: 5, title: "Holy grail cleanser", comment: "My dermatologist recommended CeraVe and my skin has never been better. Gentle and effective.", isApproved: true, isVerifiedPurchase: true },
    { userId: c4.id, productId: p11.id, rating: 4, title: "Great multivitamin", comment: "Easy to swallow. I feel more energetic since starting Centrum. Taking off 1 star because of the size.", isApproved: true, isVerifiedPurchase: true },
    { userId: c5.id, productId: p29.id, rating: 5, title: "Accurate and reliable", comment: "Matches my doctor's office readings within 1-2 points. Bluetooth sync to phone is a great feature.", isApproved: true, isVerifiedPurchase: true },
    { userId: c6.id, productId: p34.id, rating: 5, title: "Best diapers for overnight", comment: "No more leaky mornings! My baby sleeps through the night with these.", isApproved: true, isVerifiedPurchase: true },
    { userId: c7.id, productId: p30.id, rating: 4, title: "Good toothpaste", comment: "Keeps my teeth clean and white. Taste is nice. Nothing groundbreaking but solid choice.", isApproved: true, isVerifiedPurchase: true },
    { userId: c8.id, productId: p20.id, rating: 5, title: "Finally found relief", comment: "Tried many dandruff shampoos. Nizoral is the only one that actually works for me.", isApproved: true, isVerifiedPurchase: true },
    { userId: c9.id, productId: p6.id, rating: 4, title: "Reliable pain relief", comment: "Tylenol is my go-to for headaches. Works quickly and reliably.", isApproved: true, isVerifiedPurchase: true },
    { userId: c10.id, productId: p2.id, rating: 5, title: "Cholesterol under control", comment: "After 3 months my LDL dropped 30 points. This medication works.", isApproved: true, isVerifiedPurchase: true },
    { userId: c1.id, productId: p21.id, rating: 4, title: "Good moisturizer", comment: "Very hydrating, a little goes a long way. Takes a minute to absorb but skin feels great after.", isApproved: true, isVerifiedPurchase: false },
    { userId: c2.id, productId: p12.id, rating: 5, title: "Excellent vitamin D", comment: "Doctor said I was deficient. These are high potency and affordable.", isApproved: true, isVerifiedPurchase: true },
    { userId: c3.id, productId: p27.id, rating: 3, title: "Decent fish oil", comment: "No fishy burps which is good. Not sure if I notice a difference yet. Need more time.", isApproved: true, isVerifiedPurchase: true },
    { userId: c5.id, productId: p33.id, rating: 5, title: "Works like a charm", comment: "Use this for post-workout muscle soreness. The cooling sensation is instant relief.", isApproved: true, isVerifiedPurchase: true },
    { userId: c7.id, productId: p16.id, rating: 4, title: "Smooth skin", comment: "Love the Dove body wash. Gentle, no irritation, skin feels soft.", isApproved: true, isVerifiedPurchase: true },
    { userId: c9.id, productId: p31.id, rating: 5, title: "Clear picture", comment: "Got a fever reading in 3 seconds. Love the color-coded display for kids.", isApproved: true, isVerifiedPurchase: true },
    { userId: c1.id, productId: p8.id, rating: 2, title: "Made me drowsy", comment: "Works for allergies but made me very sleepy. Can't take during work hours.", isApproved: true, isVerifiedPurchase: false, isReported: true, reportReason: "Verified purchase customer reported drowsiness side effect" },
    { userId: c4.id, productId: p22.id, rating: 5, title: "Great mouthwash", comment: "Fresh breath all day. Love the cool mint flavor.", isApproved: true, isVerifiedPurchase: true },
    { userId: c6.id, productId: p35.id, rating: 4, title: "Good formula", comment: "My baby seems comfortable in these. Good absorbency.", isApproved: true, isVerifiedPurchase: true },
    { userId: c8.id, productId: p9.id, rating: 3, title: "Okay but average", comment: "Ibuprofen works fine but I prefer the brand-name version. These seem to take longer.", isApproved: false, isReported: false },
  ];

  await Promise.all(reviewData.map((r) => prisma.review.create({ data: { ...r, createdAt: daysAgo(Math.floor(Math.random() * 20) + 1) } })));

  // ─── SUPPORT TICKETS ────────────────────────────────────────
  const ticketData = [
    { userId: c1.id, orderId: orders[0].id, subject: "Delivery arrived damaged", category: "Order Delivery", status: "RESOLVED", priority: "High", messages: [
      { senderId: c1.id, message: "My package arrived with the outer box crushed. Some items were damaged." },
      { senderId: pharmacist.id, message: "I'm sorry to hear that. Could you send photos of the damage? We'll arrange a replacement." },
      { senderId: c1.id, message: "Sure, I've attached the photos. The aspirin box was crushed." },
      { senderId: pharmacist.id, message: "We've processed a replacement order. You'll receive a new shipment within 2 business days at no charge." },
    ]},
    { userId: c3.id, orderId: orders[2].id, subject: "Wrong item received", category: "Order Issue", status: "IN_PROGRESS", priority: "Urgent", messages: [
      { senderId: c3.id, message: "I ordered the Omron BP monitor but received a different product." },
      { senderId: pharmacist.id, message: "I apologize for the mix-up. Can you provide your order number and the item you received?" },
      { senderId: c3.id, message: "Order ORD-2026-100003. I received what looks like a generic thermometer instead." },
    ]},
    { userId: c5.id, orderId: orders[4].id, subject: "How to track my order?", category: "Order Delivery", status: "OPEN", priority: "Normal", messages: [
      { senderId: c5.id, message: "I placed an order 3 days ago and haven't received any tracking information. How can I track it?" },
    ]},
    { userId: c8.id, orderId: orders[7].id, subject: "Prescription upload failed", category: "Prescription", status: "RESOLVED", priority: "Normal", messages: [
      { senderId: c8.id, message: "I'm trying to upload my prescription but the file keeps failing. It's a PDF under 5MB." },
      { senderId: pharmacist.id, message: "Please try uploading again. Make sure the file is a valid PDF, JPG, or PNG. If the issue persists, email it to prescriptions@adcare.com." },
      { senderId: c8.id, message: "It worked on the second try. Thanks!" },
    ]},
    { userId: c2.id, orderId: orders[1].id, subject: "Request for refund", category: "Refund", status: "IN_PROGRESS", priority: "High", messages: [
      { senderId: c2.id, message: "I'd like a refund for item #2 in my order. The product was expired when I received it." },
      { senderId: pharmacist.id, message: "We take expired products very seriously. Please provide the batch number from the packaging and we'll process a full refund immediately." },
      { senderId: c2.id, message: "Batch number is BATCH-CEV-2025-OLD. Expiry date was last month." },
    ]},
    { userId: c10.id, orderId: orders[9].id, subject: "Loyalty points not credited", category: "Account", status: "OPEN", priority: "Normal", messages: [
      { senderId: c10.id, message: "I placed order ORD-2026-100010 three days ago but haven't received any loyalty points." },
    ]},
    { userId: c6.id, subject: "Bulk order inquiry for clinic", category: "General", status: "OPEN", priority: "Low", messages: [
      { senderId: c6.id, message: "I run a small clinic. Do you offer bulk pricing for medical supplies and OTC medicines?" },
    ]},
  ];

  const tickets = await Promise.all(ticketData.map(async (t) => {
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: `TCK-${String(99200 + Math.floor(Math.random() * 800))}`,
        userId: t.userId, orderId: t.orderId || null,
        subject: t.subject, category: t.category, status: t.status, priority: t.priority,
        messages: { create: t.messages.map((m) => ({ senderId: m.senderId, message: m.message })) },
      },
    });
    return ticket;
  }));

  // ─── REFILL REMINDERS ───────────────────────────────────────
  await Promise.all([
    prisma.refillReminder.create({ data: { userId: c1.id, productId: p2.id, frequencyDays: 30, nextRefillDate: daysFromNow(10), notes: "Take 1 pill nightly for cholesterol", isActive: true } }),
    prisma.refillReminder.create({ data: { userId: c4.id, productId: p4.id, frequencyDays: 30, nextRefillDate: daysFromNow(20), notes: "Omeprazole for acid reflux - 14 day course", isActive: true } }),
    prisma.refillReminder.create({ data: { userId: c5.id, productId: p3.id, frequencyDays: 60, nextRefillDate: daysAgo(5), notes: "Metformin - check blood sugar monthly", isActive: true } }),
    prisma.refillReminder.create({ data: { userId: c1.id, productId: p1.id, frequencyDays: 90, nextRefillDate: daysFromNow(60), notes: "Amoxicillin course - as needed", isActive: false } }),
  ]);

  // ─── WISHLIST ITEMS ─────────────────────────────────────────
  await Promise.all([
    prisma.wishlistItem.create({ data: { userId: c1.id, productId: p29.id } }),
    prisma.wishlistItem.create({ data: { userId: c1.id, productId: p16.id } }),
    prisma.wishlistItem.create({ data: { userId: c2.id, productId: p21.id } }),
    prisma.wishlistItem.create({ data: { userId: c3.id, productId: p11.id } }),
    prisma.wishlistItem.create({ data: { userId: c6.id, productId: p35.id } }),
    prisma.wishlistItem.create({ data: { userId: c7.id, productId: p27.id } }),
  ]);

  // ─── NOTIFICATIONS ──────────────────────────────────────────
  await Promise.all([
    ...customers.slice(0, 5).map((c) =>
      prisma.notification.create({ data: { userId: c.id, title: "Welcome to AD CARE!", message: "Thank you for joining. Use code WELCOME5 for $5 off your first order.", type: "system", isRead: false } })
    ),
    prisma.notification.create({ data: { userId: c1.id, title: "Order Shipped", message: "Your order ORD-2026-100011 has been confirmed and is being processed.", type: "order", link: "/account/orders", isRead: false } }),
    prisma.notification.create({ data: { userId: c4.id, title: "Prescription Required", message: "Your order ORD-2026-100008 requires a valid prescription. Please upload one to continue.", type: "prescription", isRead: false } }),
    prisma.notification.create({ data: { userId: c1.id, title: "Refill Reminder", message: "Time to refill your Lipitor (Atorvastatin) 20mg. Reorder now for uninterrupted supply.", type: "system", isRead: true } }),
  ]);

  // ─── SITE SETTINGS ──────────────────────────────────────────
  await Promise.all([
    prisma.siteSetting.create({ data: { key: "show_hero_banner", value: "true", label: "Show Hero Banner", group: "general" } }),
    prisma.siteSetting.create({ data: { key: "show_featured_products", value: "true", label: "Show Featured Products Section", group: "general" } }),
    prisma.siteSetting.create({ data: { key: "show_promotional_banner", value: "true", label: "Show Promotional Banner", group: "general" } }),
    prisma.siteSetting.create({ data: { key: "show_newsletter_signup", value: "true", label: "Show Newsletter Signup", group: "general" } }),
    prisma.siteSetting.create({ data: { key: "show_categories_section", value: "true", label: "Show Categories Section", group: "general" } }),
    prisma.siteSetting.create({ data: { key: "show_testimonials", value: "false", label: "Show Testimonials", group: "general" } }),
    prisma.siteSetting.create({ data: { key: "maintenance_mode", value: "false", label: "Maintenance Mode", group: "security" } }),
  ]);

  console.log(`
✅ Seeding complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Users:      ${3 + customers.length} (1 SuperAdmin, 1 Admin, 1 Pharmacist, ${customers.length} Customers)
  Categories: ${categories.length}
  Brands:     ${brands.length}
  Products:   ${products.length} (4 Rx, 6 OTC, 5 Vitamins, 4 Skincare, 3 Personal, 2 Hair, 2 Oral, 3 Devices, 1 Wellness, 1 Baby)
  Orders:     ${orders.length} (various statuses)
  Reviews:    ${reviewData.length}
  Tickets:    ${ticketData.length}
  Prescriptions: ${prescriptions.length}
  Coupons:    5
  Suppliers:  ${suppliers.length}
  Batches:    10
  Notifications: ${customers.length + 3}
  Site Settings: 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Login credentials: any email above + "Pharmacy123!"
`);
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
