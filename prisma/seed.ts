import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';


const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding payment gateways...');

  const gateways = [
    {
      name: 'razorpay',
      display_name: 'Razorpay',
      is_active: true,
      success_rate: 0.96,
      base_latency_ms: 320,
      supported_methods: ['UPI', 'CARD', 'NETBANKING', 'WALLET'],
      method_affinity: { UPI: 0.95, CARD: 0.88, NETBANKING: 0.9, WALLET: 0.85 },
      bank_affinity: {
        HDFC: 0.9,
        ICICI: 0.88,
        SBI: 0.8,
        AXIS: 0.85,
        KOTAK: 0.82,
      },
    },
    {
      name: 'stripe',
      display_name: 'Stripe',
      is_active: true,
      success_rate: 0.98,
      base_latency_ms: 280,
      supported_methods: ['CARD'],
      method_affinity: { UPI: 0.1, CARD: 0.98, NETBANKING: 0.2, WALLET: 0.3 },
      bank_affinity: {
        HDFC: 0.92,
        ICICI: 0.9,
        SBI: 0.75,
        AXIS: 0.88,
        KOTAK: 0.87,
      },
    },
    {
      name: 'paytm',
      display_name: 'Paytm',
      is_active: true,
      success_rate: 0.91,
      base_latency_ms: 410,
      supported_methods: ['UPI', 'CARD', 'NETBANKING', 'WALLET'],
      method_affinity: {
        UPI: 0.88,
        CARD: 0.75,
        NETBANKING: 0.82,
        WALLET: 0.95,
      },
      bank_affinity: {
        HDFC: 0.78,
        ICICI: 0.8,
        SBI: 0.85,
        AXIS: 0.77,
        KOTAK: 0.74,
      },
    },
    {
      name: 'phonepe',
      display_name: 'PhonePe',
      is_active: true,
      success_rate: 0.94,
      base_latency_ms: 350,
      supported_methods: ['UPI', 'WALLET'],
      method_affinity: { UPI: 0.97, CARD: 0.2, NETBANKING: 0.3, WALLET: 0.92 },
      bank_affinity: {
        HDFC: 0.85,
        ICICI: 0.83,
        SBI: 0.9,
        AXIS: 0.81,
        KOTAK: 0.79,
      },
    },
    {
      name: 'hdfc',
      display_name: 'HDFC Payment Gateway',
      is_active: true,
      success_rate: 0.95,
      base_latency_ms: 290,
      supported_methods: ['CARD', 'NETBANKING'],
      method_affinity: { UPI: 0.4, CARD: 0.94, NETBANKING: 0.96, WALLET: 0.2 },
      bank_affinity: {
        HDFC: 0.99,
        ICICI: 0.6,
        SBI: 0.55,
        AXIS: 0.58,
        KOTAK: 0.57,
      },
    },
    {
      name: 'sbi',
      display_name: 'SBI Payment Gateway',
      is_active: true,
      success_rate: 0.88,
      base_latency_ms: 480,
      supported_methods: ['CARD', 'NETBANKING', 'UPI'],
      method_affinity: { UPI: 0.82, CARD: 0.78, NETBANKING: 0.93, WALLET: 0.1 },
      bank_affinity: {
        HDFC: 0.5,
        ICICI: 0.52,
        SBI: 0.99,
        AXIS: 0.48,
        KOTAK: 0.47,
      },
    },
  ];
// Upsert function to avoid duplicates if already exist
  for (const gateway of gateways) {
    const result = await prisma.gateway.upsert({
      where: { name: gateway.name },
      update: gateway,
      create: gateway,
    });
    console.log(
      `  Upserted gateway: ${result.display_name} (id: ${result.id})`,
    );
  }

  console.log(`\nSeeding complete. ${gateways.length} gateways seeded.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
