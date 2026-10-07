/**
 * Sample countries (dev only).
 * Idempotent: upserts on country_code, so it is safe to re-run.
 * Matches CountryCreateDto conventions: upper-case name, ISO 3166-1 alpha-2 code.
 *
 * Run: pnpm db:seed:countries
 */
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../core/db/mikro-orm.config.js';
import { Country } from '../modules/address/entities/country.entity.js';

const COUNTRIES: {
  countryName: string;
  countryCode: string;
  isActive?: boolean;
}[] = [
  { countryName: 'SRI LANKA', countryCode: 'LK' },
  { countryName: 'INDIA', countryCode: 'IN' },
  { countryName: 'MALDIVES', countryCode: 'MV' },
  { countryName: 'SINGAPORE', countryCode: 'SG' },
  { countryName: 'MALAYSIA', countryCode: 'MY' },
  { countryName: 'UNITED ARAB EMIRATES', countryCode: 'AE' },
  { countryName: 'SAUDI ARABIA', countryCode: 'SA' },
  { countryName: 'QATAR', countryCode: 'QA' },
  { countryName: 'AUSTRALIA', countryCode: 'AU' },
  { countryName: 'NEW ZEALAND', countryCode: 'NZ' },
  { countryName: 'UNITED KINGDOM', countryCode: 'GB' },
  { countryName: 'UNITED STATES', countryCode: 'US' },
  { countryName: 'CANADA', countryCode: 'CA' },
  { countryName: 'GERMANY', countryCode: 'DE' },
  { countryName: 'FRANCE', countryCode: 'FR' },
  { countryName: 'ITALY', countryCode: 'IT' },
  { countryName: 'JAPAN', countryCode: 'JP' },
  { countryName: 'CHINA', countryCode: 'CN' },
  // Inactive on purpose, to test isActive filtering
  { countryName: 'ANTARCTICA', countryCode: 'AQ', isActive: false },
];

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    const countries = await em.upsertMany(
      Country,
      COUNTRIES.map((c) => ({ ...c, isActive: c.isActive ?? true })),
      { onConflictFields: ['countryCode'] },
    );
    console.log(`Seeded ${countries.length} countries.`);
  } finally {
    await orm.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
