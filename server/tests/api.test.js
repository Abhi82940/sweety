const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Sweety API - Blood Glucose Tracking and Reporting System', () => {
  let testUserToken;
  let testUserId;
  const testUserEmail = `testuser_${Date.now()}@sweety.com`;
  const testPassword = 'Password@123';
  let createdReadingId;

  // Use fixed past dates that won't conflict
  const testDate = '2026-10-15'; // A past date relative to current time
  const prevMonthDate = '2026-09-15';

  afterAll(async () => {
    // Clean up only test user's data (preserving demo user)
    if (testUserId) {
      await db.query('DELETE FROM sweety.readings WHERE user_id = $1', [testUserId]);
      await db.query('DELETE FROM sweety.users WHERE id = $1', [testUserId]);
    }
    await db.pool.end();
  });

  // TEST 1: Successful registration
  test('1. Successful registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Tester',
        email: testUserEmail,
        password: testPassword
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUserEmail.toLowerCase());
    expect(res.body.user.password).toBeUndefined();

    testUserToken = res.body.token;
    testUserId = res.body.user.id;
  });

  // TEST 2: Duplicate email registration
  test('2. Duplicate email registration should fail', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Tester',
        email: testUserEmail,
        password: testPassword
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // TEST 3: Successful login
  test('3. Successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUserEmail.toLowerCase());
  });

  // TEST 4: Incorrect password
  test('4. Incorrect password should fail login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: 'WrongPassword!999'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  // TEST 5: Unauthorized reading access
  test('5. Unauthorized reading access should fail without token', async () => {
    const res = await request(app).get('/api/readings');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // TEST 6: Add valid reading
  test('6. Add valid reading', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'Morning (fasting)',
        glucose_value: 95
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reading).toBeDefined();
    expect(res.body.reading.glucose_value).toBe(95);
    expect(res.body.reading.time_slot).toBe('Morning (fasting)');

    createdReadingId = res.body.reading.id;
  });

  // TEST 7: Missing glucose value
  test('7. Missing glucose value validation', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'After lunch'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please enter a glucose value.');
  });

  // TEST 8: Value below 40
  test('8. Value below 40 validation', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'After lunch',
        glucose_value: 35
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  // TEST 9: Value above 600
  test('9. Value above 600 validation', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'After lunch',
        glucose_value: 650
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  // TEST 10: Decimal glucose value
  test('10. Decimal glucose value validation', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'After lunch',
        glucose_value: 120.5
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  // TEST 11: Duplicate time slot
  test('11. Duplicate time slot on same day validation', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'Morning (fasting)',
        glucose_value: 110
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/You already have a Morning \(fasting\) reading for this date\./i);
  });

  // TEST 12: More than four readings per day
  test('12. More than four readings per day validation', async () => {
    // Add slot 2
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ reading_date: testDate, time_slot: 'After breakfast', glucose_value: 130 });

    // Add slot 3
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ reading_date: testDate, time_slot: 'After lunch', glucose_value: 140 });

    // Add slot 4
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ reading_date: testDate, time_slot: 'After dinner', glucose_value: 125 });

    // Attempt 5th reading on same date
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'Morning (fasting)', // Even if slot repeated or another
        glucose_value: 105
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('You can add only 4 readings per day.');
  });

  // TEST 13: Future date
  test('13. Future date validation', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: '2099-01-01',
        time_slot: 'Morning (fasting)',
        glucose_value: 100
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Date cannot be in the future.');
  });

  // TEST 14: Edit reading
  test('14. Edit reading', async () => {
    const res = await request(app)
      .put(`/api/readings/${createdReadingId}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: testDate,
        time_slot: 'Morning (fasting)', // retain its own slot
        glucose_value: 102
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reading.glucose_value).toBe(102);
  });

  // TEST 15: Delete reading
  test('15. Delete reading', async () => {
    // Delete slot 4 (After dinner) to test deletion
    const getRes = await request(app)
      .get(`/api/readings?date=${testDate}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    const dinnerReading = getRes.body.readings.find((r) => r.time_slot === 'After dinner');
    expect(dinnerReading).toBeDefined();

    const delRes = await request(app)
      .delete(`/api/readings/${dinnerReading.id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify it is gone
    const verifyRes = await request(app)
      .get(`/api/readings/${dinnerReading.id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(verifyRes.status).toBe(404);
  });

  // TEST 16: Daily report calculations
  test('16. Daily report calculations', async () => {
    // Currently on testDate we have:
    // Morning (fasting): 102
    // After breakfast: 130
    // After lunch: 140
    // Total = 3 readings. Highest = 140, Lowest = 102, Avg = (102 + 130 + 140) / 3 = 372 / 3 = 124.0
    const res = await request(app)
      .get(`/api/reports/daily?date=${testDate}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.highest).toBe(140);
    expect(res.body.lowest).toBe(102);
    expect(res.body.average).toBe(124);
  });

  // TEST 17: Month-to-date report calculations
  test('17. Month-to-date report calculations', async () => {
    // Add one more reading earlier in October (2026-10-05)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: '2026-10-05',
        time_slot: 'Morning (fasting)',
        glucose_value: 88
      });

    // MTD for 2026-10-15 includes 2026-10-01 to 2026-10-15:
    // Values: 88, 102, 130, 140. Total = 4. Highest = 140, Lowest = 88.
    // Sum = 460. Avg = 460 / 4 = 115.0
    const res = await request(app)
      .get(`/api/reports/month-to-date?date=${testDate}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.highest).toBe(140);
    expect(res.body.lowest).toBe(88);
    expect(res.body.average).toBe(115);
  });

  // TEST 18: Previous month report calculations
  test('18. Previous month report calculations', async () => {
    // Add a reading in September 2026
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: '2026-09-12',
        time_slot: 'Morning (fasting)',
        glucose_value: 94
      });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        reading_date: '2026-09-20',
        time_slot: 'After lunch',
        glucose_value: 146
      });

    // When querying monthly report with date = 2026-10-15, previous month is September 2026
    // Values: 94, 146. Total = 2. Highest = 146, Lowest = 94. Avg = (94+146)/2 = 120.0
    const res = await request(app)
      .get(`/api/reports/monthly?date=${testDate}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.highest).toBe(146);
    expect(res.body.lowest).toBe(94);
    expect(res.body.average).toBe(120);
  });

  // TEST 19: Empty report
  test('19. Empty report handling without errors', async () => {
    const res = await request(app)
      .get('/api/reports/daily?date=1995-01-01')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.highest).toBeNull();
    expect(res.body.lowest).toBeNull();
    expect(res.body.average).toBeNull();
    expect(res.body.readings).toEqual([]);
  });
});
