/**
 * Sample addresses (dev only). Requires countries: run `pnpm db:seed:countries` first.
 * address has no natural unique key, so each row uses a fixed id and is upserted on it,
 * which keeps the seed idempotent.
 * Values are upper-case to match AddressCreateDto's transforms.
 *
 * Run: pnpm db:seed:addresses
 */
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../core/db/mikro-orm.config.js';
import { Address } from '../modules/address/entities/address.entity.js';
import { Country } from '../modules/address/entities/country.entity.js';

const ADDRESSES: {
  id: string;
  countryCode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode: string;
  isActive?: boolean;
}[] = [
  {
    id: '00000000-0000-4000-a000-000000000001',
    countryCode: 'LK',
    addressLine1: 'NO. 25, GALLE ROAD',
    addressLine2: 'COLPETTY',
    city: 'COLOMBO 03',
    region: 'WESTERN PROVINCE',
    postalCode: '00300',
  },
  {
    id: '00000000-0000-4000-a000-000000000002',
    countryCode: 'LK',
    addressLine1: '142, DALADA VEEDIYA',
    city: 'KANDY',
    region: 'CENTRAL PROVINCE',
    postalCode: '20000',
  },
  {
    id: '00000000-0000-4000-a000-000000000003',
    countryCode: 'LK',
    addressLine1: '18, CHURCH STREET',
    addressLine2: 'GALLE FORT',
    city: 'GALLE',
    region: 'SOUTHERN PROVINCE',
    postalCode: '80000',
  },
  {
    id: '00000000-0000-4000-a000-000000000004',
    countryCode: 'LK',
    addressLine1: '7, NEGOMBO ROAD',
    city: 'WATTALA',
    region: 'WESTERN PROVINCE',
    postalCode: '11300',
  },
  {
    id: '00000000-0000-4000-a000-000000000005',
    countryCode: 'IN',
    addressLine1: '12, MG ROAD',
    addressLine2: 'ASHOK NAGAR',
    city: 'BENGALURU',
    region: 'KARNATAKA',
    postalCode: '560001',
  },
  {
    id: '00000000-0000-4000-a000-000000000006',
    countryCode: 'SG',
    addressLine1: '1 RAFFLES PLACE',
    addressLine2: '#20-01',
    city: 'SINGAPORE',
    postalCode: '048616',
  },
  {
    id: '00000000-0000-4000-a000-000000000007',
    countryCode: 'AE',
    addressLine1: 'OFFICE 1204, BAY SQUARE',
    addressLine2: 'BUSINESS BAY',
    city: 'DUBAI',
    region: 'DUBAI',
    postalCode: '00000',
  },
  {
    id: '00000000-0000-4000-a000-000000000008',
    countryCode: 'GB',
    addressLine1: '221B BAKER STREET',
    city: 'LONDON',
    region: 'GREATER LONDON',
    postalCode: 'NW1 6XE',
  },
  {
    id: '00000000-0000-4000-a000-000000000009',
    countryCode: 'AU',
    addressLine1: '100 GEORGE STREET',
    city: 'SYDNEY',
    region: 'NEW SOUTH WALES',
    postalCode: '2000',
  },
  // Inactive on purpose, to test isActive filtering
  {
    id: '00000000-0000-4000-a000-000000000010',
    countryCode: 'LK',
    addressLine1: '45, OLD MOOR STREET',
    city: 'COLOMBO 12',
    region: 'WESTERN PROVINCE',
    postalCode: '01200',
    isActive: false,
  },
];

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    const codes = [...new Set(ADDRESSES.map((a) => a.countryCode))];
    const countries = await em.find(Country, { countryCode: { $in: codes } });
    const countryIdByCode = new Map(
      countries.map((c) => [c.countryCode, c.id]),
    );

    const missing = codes.filter((code) => !countryIdByCode.has(code));
    if (missing.length > 0) {
      throw new Error(
        `Missing countries: ${missing.join(', ')}. Run "pnpm db:seed:countries" first.`,
      );
    }

    const addresses = await em.upsertMany(
      Address,
      ADDRESSES.map(({ countryCode, ...a }) => ({
        ...a,
        addressLine2: a.addressLine2 ?? null,
        region: a.region ?? null,
        isActive: a.isActive ?? true,
        countryId: countryIdByCode.get(countryCode)!,
      })),
      { onConflictFields: ['id'] },
    );
    console.log(`Seeded ${addresses.length} addresses.`);
  } finally {
    await orm.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
