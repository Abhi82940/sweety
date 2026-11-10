const db = require('../config/db');

/**
 * Format reading date helper to avoid UTC offset shifting
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
 * Create a new glucose reading
 */
const createReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reading_date, time_slot, glucose_value } = req.validatedReading;

    const result = await db.query(
      `INSERT INTO sweety.readings (user_id, reading_date, time_slot, glucose_value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at`,
      [userId, reading_date, time_slot, glucose_value]
    );

    const reading = formatReadingRow(result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Reading recorded successfully.',
      reading
    });
  } catch (error) {
    // Handle unique constraint violation (code 23505)
    if (error.code === '23505') {
      const article = ['After', 'A', 'E', 'I', 'O', 'U'].some((p) =>
        req.body.time_slot.startsWith(p)
      )
        ? 'an'
        : 'a';
      return res.status(400).json({
        success: false,
        message: `You already have ${article} ${req.body.time_slot} reading for this date.`
      });
    }
    next(error);
  }
};

/**
 * Get all readings for authenticated user with optional pagination and filters
 */
const getReadings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, startDate, endDate, page, limit } = req.query;

    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (date) {
      conditions.push(`reading_date = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    } else {
      if (startDate) {
        conditions.push(`reading_date >= $${paramIndex}`);
        params.push(startDate);
        paramIndex++;
      }
      if (endDate) {
        conditions.push(`reading_date <= $${paramIndex}`);
        params.push(endDate);
        paramIndex++;
      }
    }

    const whereClause = conditions.join(' AND ');

    // Total count for pagination
    const countResult = await db.query(
      `SELECT COUNT(*)::int AS total FROM sweety.readings WHERE ${whereClause}`,
      params
    );
    const total = countResult.rows[0].total;

    let queryText = `
      SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
      FROM sweety.readings
      WHERE ${whereClause}
      ORDER BY reading_date DESC, 
        CASE time_slot 
          WHEN 'Morning (fasting)' THEN 1 
          WHEN 'After breakfast' THEN 2 
          WHEN 'After lunch' THEN 3 
          WHEN 'After dinner' THEN 4 
          ELSE 5 
        END ASC
    `;

    // Pagination support
    const currentPage = parseInt(page, 10) || 1;
    const currentLimit = parseInt(limit, 10) || (page ? 10 : 100);

    if (page || limit) {
      const offset = (currentPage - 1) * currentLimit;
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(currentLimit, offset);
    }

    const result = await db.query(queryText, params);
    const readings = result.rows.map(formatReadingRow);

    res.status(200).json({
      success: true,
      readings,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single reading by ID
 */
const getReadingById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const readingId = parseInt(req.params.id, 10);

    if (isNaN(readingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reading ID.'
      });
    }

    const result = await db.query(
      `SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
       FROM sweety.readings
       WHERE id = $1 AND user_id = $2`,
      [readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      reading: formatReadingRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reading by ID
 */
const updateReading = async (req, res, next) => {
  try {
    const readingId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { reading_date, time_slot, glucose_value } = req.validatedReading;

    const result = await db.query(
      `UPDATE sweety.readings
       SET reading_date = $1, time_slot = $2, glucose_value = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at`,
      [reading_date, time_slot, glucose_value, readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reading updated successfully.',
      reading: formatReadingRow(result.rows[0])
    });
  } catch (error) {
    if (error.code === '23505') {
      const article = ['After', 'A', 'E', 'I', 'O', 'U'].some((p) =>
        req.body.time_slot.startsWith(p)
      )
        ? 'an'
        : 'a';
      return res.status(400).json({
        success: false,
        message: `You already have ${article} ${req.body.time_slot} reading for this date.`
      });
    }
    next(error);
  }
};

/**
 * Delete reading by ID
 */
const deleteReading = async (req, res, next) => {
  try {
    const readingId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(readingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reading ID.'
      });
    }

    const result = await db.query(
      'DELETE FROM sweety.readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reading deleted successfully.',
      deletedId: readingId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading
};
