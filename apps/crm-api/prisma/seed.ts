import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seeding...');

  // 1. Create Default Tenant (الشركة الأولى)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Alpha Company (HQ)',
    },
  });
  console.log('✅ Tenant Created:', tenant.name);

  // 2. Create Admin User
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('123456', salt); // كلمة مرور افتراضية

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alpha.com' },
    update: {},
    create: {
      email: 'admin@alpha.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });
  console.log('✅ Admin User Created:', admin.email);

  // 3. Populate Lookups (القوائم المنسدلة)
  const lookups = [
    // أنواع العملاء
    { category: 'CLIENT_TYPE', code: 'RETAIL', labelAr: 'تجزئة / محل', labelEn: 'Retail Store' },
    { category: 'CLIENT_TYPE', code: 'CORPORATE', labelAr: 'شركة / مؤسسة', labelEn: 'Corporate' },
    { category: 'CLIENT_TYPE', code: 'MEDICAL', labelAr: 'قطاع طبي', labelEn: 'Medical' },
    { category: 'CLIENT_TYPE', code: 'FOOD', labelAr: 'مطعم / كافيه', labelEn: 'F&B' },

    // أسباب الرفض
    { category: 'REJECTION_REASON', code: 'PRICE', labelAr: 'السعر مرتفع', labelEn: 'Price too high' },
    { category: 'REJECTION_REASON', code: 'COMPETITOR', labelAr: 'لديه منافس', labelEn: 'Has Competitor' },
    { category: 'REJECTION_REASON', code: 'NOT_INTERESTED', labelAr: 'غير مهتم حالياً', labelEn: 'Not Interested' },
    { category: 'REJECTION_REASON', code: 'DECISION_MAKER', labelAr: 'المدير غير موجود', labelEn: 'No Decision Maker' },
  ];

  for (const lookup of lookups) {
    await prisma.lookupValue.upsert({
      where: { category_code: { category: lookup.category, code: lookup.code } },
      update: {},
      create: lookup,
    });
  }
  console.log('✅ Lookups Populated');

  // 4. Populate Services (الخدمات)
  const services = [
    { nameAr: 'تصميم موقع تعريفي', nameEn: 'Landing Page', basePrice: 1500, minPrice: 1200 },
    { nameAr: 'متجر إلكتروني متكامل', nameEn: 'E-Commerce Store', basePrice: 4500, minPrice: 4000 },
    { nameAr: 'إدارة سوشيال ميديا (شهر)', nameEn: 'Social Media Mgt', basePrice: 2000, minPrice: 1800 },
    { nameAr: 'تحسين محركات البحث (SEO)', nameEn: 'SEO Package', basePrice: 3000, minPrice: 2500 },
  ];

  for (const service of services) {
    await prisma.serviceProduct.create({
      data: {
        ...service,
        tenantId: tenant.id,
      },
    });
  }
  console.log('✅ Services Populated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });