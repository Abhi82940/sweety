const db = require('../config/db');

/**
 * Helper to format date object to YYYY-MM-DD
 */
const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format reading date helper
 */
const formatReadingRow = (row) => {
  if (!row) return null;
  let dateStr = row.reading_date;
  if (row.reading_date instanceof Date) {
    const y = row.reading_date.getFullYear();
    const m = String(row.reading_date.getMonth() + 1).padStart(2, '0');
    const d = String(row.reading_date.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }
  return {
    ...row,
    reading_date: dateStr
  };
};

/**
 * Helper to compute report statistics
 */
const computeStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      total: 0
    };
  }

  const values = readings.map((r) => r.glucose_value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const average = Number((sum / values.length).toFixed(1));

  return {
    highest,
    lowest,
    average,
    total: readings.length
  };
};

/**
 * Helper to generate daily breakdown / trend points for charts
 */
const groupReadingsByDate = (readings) => {
  const map = {};
  for (const r of readings) {
    const d = r.reading_date;
    if (!map[d]) {
      map[d] = {
        date: d,
        readings: [],
        values: []
      };
    }
    map[d].readings.push(r);
    map[d].values.push(r.glucose_value);
  }

  const dates = Object.keys(map).sort();
  return dates.map((date) => {
    const item = map[date];
    const sum = item.values.reduce((a, b) => a + b, 0);
    return {
      date,
      count: item.values.length,
      average: Number((sum / item.values.length).toFixed(1)),
      highest: Math.max(...item.values),
      lowest: Math.min(...item.values),
      readings: item.readings
    };
  });
};

/**
 * GET /api/reports/daily?date=YYYY-MM-DD
 */
const getDailyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const targetDate = req.query.date || formatDate(new Date());

    const result = await db.query(
      `SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
       FROM sweety.readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY 
        CASE time_slot 
          WHEN 'Morning (fasting)' THEN 1 
          WHEN 'After breakfast' THEN 2 
          WHEN 'After lunch' THEN 3 
          WHEN 'After dinner' THEN 4 
          ELSE 5 
        END ASC`,
      [userId, targetDate]
    );

    const readings = result.rows.map(formatReadingRow);
    const stats = computeStats(readings);

    res.status(200).json({
      success: true,
      reportType: 'daily',
      date: targetDate,
      ...stats,
      readings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/month-to-date?date=YYYY-MM-DD
 * From 1st of selected month to selected date inclusive.
 */
const getMonthToDateReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const targetDateStr = req.query.date || formatDate(new Date());

    const parts = targetDateStr.split('-');
    if (parts.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.'
      });
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDateStr = targetDateStr;

    const result = await db.query(
      `SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
       FROM sweety.readings
       WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
       ORDER BY reading_date ASC, 
        CASE time_slot 
          WHEN 'Morning (fasting)' THEN 1 
          WHEN 'After breakfast' THEN 2 
          WHEN 'After lunch' THEN 3 
          WHEN 'After dinner' THEN 4 
          ELSE 5 
        END ASC`,
      [userId, startDateStr, endDateStr]
    );

    const readings = result.rows.map(formatReadingRow);
    const stats = computeStats(readings);
    const trend = groupReadingsByDate(readings);

    res.status(200).json({
      success: true,
      reportType: 'month-to-date',
      selectedDate: targetDateStr,
      startDate: startDateStr,
      endDate: endDateStr,
      ...stats,
      trend,
      readings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/monthly?date=YYYY-MM-DD
 * Complete previous calendar month
 */
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const targetDateStr = req.query.date || formatDate(new Date());

    const parts = targetDateStr.split('-');
    if (parts.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.'
      });
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12

    let prevYear = year;
    let prevMonth = month - 1;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    // Number of days in prevMonth
    const lastDayOfMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();

    const startDateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const endDateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(
      lastDayOfMonth
    ).padStart(2, '0')}`;

    const result = await db.query(
      `SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
       FROM sweety.readings
       WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
       ORDER BY reading_date ASC, 
        CASE time_slot 
          WHEN 'Morning (fasting)' THEN 1 
          WHEN 'After breakfast' THEN 2 
          WHEN 'After lunch' THEN 3 
          WHEN 'After dinner' THEN 4 
          ELSE 5 
        END ASC`,
      [userId, startDateStr, endDateStr]
    );

    const readings = result.rows.map(formatReadingRow);
    const stats = computeStats(readings);
    const trend = groupReadingsByDate(readings);

    res.status(200).json({
      success: true,
      reportType: 'monthly-previous',
      selectedDate: targetDateStr,
      startDate: startDateStr,
      endDate: endDateStr,
      previousMonth: `${prevYear}-${String(prevMonth).padStart(2, '0')}`,
      ...stats,
      trend,
      readings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport
};
