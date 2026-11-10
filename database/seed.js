const path = require('path');
const serverNodeModules = path.resolve(__dirname, '../server/node_modules');

// Helper to require dependencies from server/node_modules
const req = (mod) => {
  try {
    return require(mod);
  } catch (e) {
    return require(path.join(serverNodeModules, mod));
  }
};

const dotenv = req('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const bcrypt = req('bcryptjs');
const { Pool } = req('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', (client) => {
  client.query('SET search_path TO sweety, public');
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding Sweety database...');
    await client.query('SET search_path TO sweety, public');

    // 1. Create or fetch Demo User
    const demoEmail = 'demo@sweety.com';
    const demoName = 'Sweety Demo';
    const demoPlainPassword = 'SweetyDemo@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoPlainPassword, salt);

    let userRes = await client.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [demoEmail]
    );

    let userId;
    if (userRes.rows.length === 0) {
      const insertUserRes = await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [demoName, demoEmail, hashedPassword]
      );
      userId = insertUserRes.rows[0].id;
      console.log(`Created demo user: ${demoEmail} (ID: ${userId})`);
    } else {
      userId = userRes.rows[0].id;
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
      console.log(`Demo user already exists: ${demoEmail} (ID: ${userId})`);
    }

    // Helper to format YYYY-MM-DD
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const now = new Date();

    const sampleReadings = [];

    // Today readings (3 slots)
    const todayStr = formatDate(now);
    sampleReadings.push(
      { date: todayStr, slot: 'Morning (fasting)', value: 98 },
      { date: todayStr, slot: 'After breakfast', value: 135 },
      { date: todayStr, slot: 'After lunch', value: 142 }
    );

    // Past 7 days in current month
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      sampleReadings.push(
        { date: dStr, slot: 'Morning (fasting)', value: 92 + (i % 8) * 3 },
        { date: dStr, slot: 'After breakfast', value: 128 + (i % 6) * 4 },
        { date: dStr, slot: 'After lunch', value: 136 + (i % 7) * 5 },
        { date: dStr, slot: 'After dinner', value: 122 + (i % 5) * 4 }
      );
    }

    // Previous calendar month readings
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    const daysInPrevMonth = [3, 6, 9, 12, 15, 18, 21, 24, 27, 29];
    for (const day of daysInPrevMonth) {
      const d = new Date(prevYear, prevMonth, day);
      const dStr = formatDate(d);
      sampleReadings.push(
        { date: dStr, slot: 'Morning (fasting)', value: 88 + (day % 7) * 3 },
        { date: dStr, slot: 'After breakfast', value: 125 + (day % 5) * 5 },
        { date: dStr, slot: 'After lunch', value: 138 + (day % 6) * 4 },
        { date: dStr, slot: 'After dinner', value: 120 + (day % 4) * 6 }
      );
    }

    console.log(`Seeding ${sampleReadings.length} readings for demo user...`);

    let insertedCount = 0;
    for (const item of sampleReadings) {
      await client.query(
        `INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot)
         DO UPDATE SET glucose_value = EXCLUDED.glucose_value, updated_at = CURRENT_TIMESTAMP`,
        [userId, item.date, item.slot, item.value]
      );
      insertedCount++;
    }

    console.log(`Successfully seeded ${insertedCount} readings!`);
    console.log('--- SEED COMPLETED ---');
    console.log(`Demo User: ${demoEmail}`);
    console.log(`Password: ${demoPlainPassword}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
