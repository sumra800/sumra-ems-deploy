import { config } from 'dotenv';
config();

import { DataSource, ILike } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { Constituency } from '../constituencies/entities/constituency.entity';
import { User } from '../users/entities/user.entity';
import { Party } from '../parties/entities/party.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Election } from '../elections/entities/election.entity';
import { Vote } from '../votes/entities/vote.entity';

const cities = [
  { name: 'Lahore', province: 'Punjab' },
  { name: 'Faisalabad', province: 'Punjab' },
  { name: 'Rawalpindi', province: 'Punjab' },
  { name: 'Gujranwala', province: 'Punjab' },
  { name: 'Multan', province: 'Punjab' },
  { name: 'Sargodha', province: 'Punjab' },
  { name: 'Bahawalpur', province: 'Punjab' },
  { name: 'Sialkot', province: 'Punjab' },
  { name: 'Sheikhupura', province: 'Punjab' },
  { name: 'Rahim Yar Khan', province: 'Punjab' },
  { name: 'Jhelum', province: 'Punjab' },

  { name: 'Hyderabad', province: 'Sindh' },
  { name: 'Sukkur', province: 'Sindh' },
  { name: 'Larkana', province: 'Sindh' },
  { name: 'Nawabshah', province: 'Sindh' },
  { name: 'Mirpurkhas', province: 'Sindh' },
  { name: 'Khairpur', province: 'Sindh' },
  { name: 'Jacobabad', province: 'Sindh' },
  { name: 'Shikarpur', province: 'Sindh' },

  { name: 'Peshawar', province: 'KPK' },
  { name: 'Mardan', province: 'KPK' },
  { name: 'Swat', province: 'KPK' },
  { name: 'Abbottabad', province: 'KPK' },
  { name: 'Dera Ismail Khan', province: 'KPK' },
  { name: 'Kohat', province: 'KPK' },
  { name: 'Bannu', province: 'KPK' },
  { name: 'Lakki Marwat', province: 'KPK' },
  { name: 'Karak', province: 'KPK' },
  { name: 'Hangu', province: 'KPK' },
  { name: 'Haripur', province: 'KPK' },
  { name: 'Mansehra', province: 'KPK' },
  { name: 'Battagram', province: 'KPK' },
  { name: 'Buner', province: 'KPK' },
  { name: 'Charsadda', province: 'KPK' },
  { name: 'Chitral', province: 'KPK' },
  { name: 'Lower Dir', province: 'KPK' },
  { name: 'Malakand', province: 'KPK' },
  { name: 'Nowshera', province: 'KPK' },
  { name: 'Shangla', province: 'KPK' },
  { name: 'Swabi', province: 'KPK' },
  { name: 'Tank', province: 'KPK' },
  { name: 'Torghar', province: 'KPK' },
  { name: 'Upper Dir', province: 'KPK' },

  { name: 'Quetta', province: 'Balochistan' },
  { name: 'Turbat', province: 'Balochistan' },
  { name: 'Khuzdar', province: 'Balochistan' },
  { name: 'Panjgur', province: 'Balochistan' },
  { name: 'Chaman', province: 'Balochistan' },
  { name: 'Loralai', province: 'Balochistan' },
  { name: 'Pishin', province: 'Balochistan' },
  { name: 'Kharan', province: 'Balochistan' },
  { name: 'Sui', province: 'Balochistan' },

  { name: 'Skardu', province: 'Gilgit-Baltistan' },
  { name: 'Khaplu', province: 'Gilgit-Baltistan' },
  { name: 'Shigar', province: 'Gilgit-Baltistan' },
];

async function seedCities() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required.');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [City, Constituency, User, Party, Candidate, Election, Vote],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  const cityRepository = dataSource.getRepository(City);

  for (const city of cities) {
    const existing = await cityRepository.findOne({
      where: { name: ILike(city.name) },
    });

    if (existing) {
      if (existing.province !== city.province) {
        existing.province = city.province;
        await cityRepository.save(existing);
      }
      continue;
    }

    const newCity = cityRepository.create(city);
    await cityRepository.save(newCity);
    console.log(`Seeded city: ${city.name} (${city.province})`);
  }

  console.log(`Seed complete. Total seeded or updated: ${cities.length}`);
  await dataSource.destroy();
}

seedCities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('City seed failed:', error);
    process.exit(1);
  });
