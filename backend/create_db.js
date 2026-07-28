const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });
  await client.connect();
  try {
    await client.query('CREATE DATABASE whaticket_afcode;');
    console.log('Database whaticket_afcode created!');
  } catch (e) {
    console.log('Database notice:', e.message);
  }
  await client.end();
}
createDb();
