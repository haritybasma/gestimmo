import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Organisation --------------------------------------------------------
  const org = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: { id: "demo-org", name: "Groupe Démo" },
  });
  console.log(`✓ Organisation : ${org.name}`);

  // --- Compte administrateur ----------------------------------------------
  const adminEmail = "admin@gestimmo.local";
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrateur",
      role: "ADMIN",
      passwordHash,
      organizationId: org.id,
    },
  });
  console.log(`✓ Utilisateur admin : ${adminEmail} / admin123`);

  // --- Sociétés ------------------------------------------------------------
  const alpha = await prisma.company.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Société Alpha" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Société Alpha",
      country: "MA",
      currency: "MAD",
      legalId: "ICE 001122334455667",
      isDefault: true,
    },
  });
  const beta = await prisma.company.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Société Beta" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Société Beta",
      country: "FR",
      currency: "EUR",
      legalId: "SIREN 123 456 789",
    },
  });
  console.log(`✓ 2 sociétés : ${alpha.name} (MAD), ${beta.name} (EUR)`);

  // --- Catégories (partagées) ---------------------------------------------
  const categories = [
    { code: "MAT-INFO", name: "Matériel informatique", defaultDuration: 3, defaultMethod: "DEGRESSIVE" },
    { code: "MOB-BUR", name: "Mobilier de bureau", defaultDuration: 10, defaultMethod: "LINEAR" },
    { code: "MAT-TRANS", name: "Matériel de transport", defaultDuration: 5, defaultMethod: "LINEAR" },
    { code: "MAT-IND", name: "Matériel industriel", defaultDuration: 7, defaultMethod: "DEGRESSIVE" },
    { code: "AGENC", name: "Agencements & installations", defaultDuration: 10, defaultMethod: "LINEAR" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { organizationId_code: { organizationId: org.id, code: c.code } },
      update: {},
      create: { ...c, organizationId: org.id },
    });
  }
  console.log(`✓ ${categories.length} catégories`);

  // --- Localisations (partagées) ------------------------------------------
  const locations = [
    { code: "SIEGE", name: "Siège social" },
    { code: "SIEGE-R1", name: "Siège - 1er étage" },
    { code: "SIEGE-R2", name: "Siège - 2e étage" },
    { code: "ENTREPOT", name: "Entrepôt" },
    { code: "AGENCE-C", name: "Agence Casablanca" },
  ];
  for (const l of locations) {
    await prisma.location.upsert({
      where: { organizationId_code: { organizationId: org.id, code: l.code } },
      update: {},
      create: { ...l, organizationId: org.id },
    });
  }
  console.log(`✓ ${locations.length} localisations`);

  // --- Immobilisations d'exemple (réparties sur les 2 sociétés) -----------
  const catInfo = await prisma.category.findUnique({ where: { organizationId_code: { organizationId: org.id, code: "MAT-INFO" } } });
  const catMob = await prisma.category.findUnique({ where: { organizationId_code: { organizationId: org.id, code: "MOB-BUR" } } });
  const locR1 = await prisma.location.findUnique({ where: { organizationId_code: { organizationId: org.id, code: "SIEGE-R1" } } });

  const sampleAssets = [
    // Société Alpha (MAD)
    { code: "IMMO-000001", companyId: alpha.id, designation: "Ordinateur portable Dell Latitude", categoryId: catInfo?.id, locationId: locR1?.id, acquisitionDate: new Date("2024-01-15"), acquisitionValue: 12000, duration: 3, method: "DEGRESSIVE" },
    { code: "IMMO-000002", companyId: alpha.id, designation: "Bureau direction bois", categoryId: catMob?.id, locationId: locR1?.id, acquisitionDate: new Date("2022-06-01"), acquisitionValue: 8000, duration: 10, method: "LINEAR" },
    // Société Beta (EUR) — même localisation (SIEGE-R1) que des biens Alpha
    { code: "IMMO-000003", companyId: beta.id, designation: "Imprimante multifonction HP", categoryId: catInfo?.id, locationId: locR1?.id, acquisitionDate: new Date("2023-09-10"), acquisitionValue: 450, duration: 3, method: "DEGRESSIVE" },
    { code: "IMMO-000004", companyId: beta.id, designation: "Armoire de rangement métal", categoryId: catMob?.id, locationId: locR1?.id, acquisitionDate: new Date("2021-03-01"), acquisitionValue: 600, duration: 10, method: "LINEAR" },
  ];
  for (const a of sampleAssets) {
    await prisma.asset.upsert({
      where: { organizationId_code: { organizationId: org.id, code: a.code } },
      update: {},
      create: { ...a, organizationId: org.id },
    });
  }
  console.log(`✓ ${sampleAssets.length} immobilisations (2 par société, même localisation)`);
}

main()
  .then(() => console.log("Seed terminé."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
