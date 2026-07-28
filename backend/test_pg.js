const { Client } = require('pg');

async function test(pass) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: pass,
    database: 'postgres'
  });
  try {
    await client.connect();
    console.log('SUCCESS_PASS:', pass);
    await client.end();
    return true;
  } catch (e) {
    console.log('ERR_PASS:', pass, e.message);
    return false;
  }
}

async function run() {
  const passes = ['postgres', 'root', '123456', 'admin', 'masterkey', ''];
  for (const p of passes) {
    if (await test(p)) break;
  }
}
run();
