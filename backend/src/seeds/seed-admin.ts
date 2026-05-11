import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { City } from '../cities/entities/city.entity';
import { Constituency } from '../constituencies/entities/constituency.entity';
import { Party } from '../parties/entities/party.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Election } from '../elections/entities/election.entity';
import { Vote } from '../votes/entities/vote.entity';

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_CNIC = process.env.ADMIN_CNIC || '10000-0000000-0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'meowmeow'; // Default password if not set, but should be overridden in production
const RESET_PASSWORD = process.env.ADMIN_PASSWORD !== undefined;

async function seedAdmin() {
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
  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({ where: { cnic: ADMIN_CNIC } });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existingAdmin) {
    let updated = false;

    if (existingAdmin.role !== UserRole.ADMIN) {
      existingAdmin.role = UserRole.ADMIN;
      updated = true;
    }

    if (RESET_PASSWORD) {
      existingAdmin.password = hashedPassword;
      updated = true;
    }

    if (updated) {
      await userRepository.save(existingAdmin);
      console.log(`Updated existing user ${ADMIN_CNIC} to ADMIN${RESET_PASSWORD ? ' and reset password' : ''}.`);
    } else {
      console.log(`Admin user already exists with CNIC ${ADMIN_CNIC}. No changes made.`);
    }
  } else {
    const adminUser = userRepository.create({
      name: ADMIN_NAME,
      cnic: ADMIN_CNIC,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepository.save(adminUser);
    console.log(`Seeded admin user: ${ADMIN_NAME} (${ADMIN_CNIC})`);
  }

  console.log('Admin seed complete.');
  await dataSource.destroy();
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exit(1);
  });
