const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function resetUser() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'whaticket_afcode'
  });

  await client.connect();

  const passwordHash = await bcrypt.hash('123456', 8);

  // Update existing admin user
  await client.query(`
    UPDATE "Users" SET "passwordHash" = '${passwordHash}' WHERE email IN ('admin@admin.com', 'admin@whaticket.com');
  `);

  // Insert admin@whaticket.com if not exists
  const res = await client.query(`SELECT id FROM "Users" WHERE email = 'admin@whaticket.com';`);
  if (res.rows.length === 0) {
    await client.query(`
      INSERT INTO "Users" (name, email, profile, "passwordHash", "companyId", "createdAt", "updatedAt", super)
      VALUES ('Admin Whaticket', 'admin@whaticket.com', 'admin', '${passwordHash}', 1, NOW(), NOW(), true);
    `);
  }

  console.log('Admin users updated successfully! Both admin@admin.com and admin@whaticket.com have password: 123456');
  await client.end();
}

resetUser().catch(console.error);
