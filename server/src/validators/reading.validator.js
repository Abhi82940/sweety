const db = require('../config/db');

const ALLOWED_TIME_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner'
];

/**
 * Helper to get local date string YYYY-MM-DD
 */
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validate reading input fields (Value, Date, Time Slot)
 */
const validateReadingInput = (req, res, next) => {
  const { reading_date, time_slot, glucose_value } = req.body;

  // RULE 1: Value is required
  if (
    glucose_value === undefined ||
    glucose_value === null ||
    (typeof glucose_value === 'string' && glucose_value.trim() === '')
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a glucose value.'
    });
  }

  // RULE 2: Value must be a whole number between 40 and 600
  const numValue = Number(glucose_value);
  const isWholeNumber =
    !isNaN(numValue) &&
    Number.isInteger(numValue) &&
    !(typeof glucose_value === 'string' && glucose_value.includes('.'));

  if (!isWholeNumber || numValue < 40 || numValue > 600) {
    return res.status(400).json({
      success: false,
      message: 'Value must be between 40 and 600 mg/dl.'
    });
  }

  // Validate Date presence and format
  if (!reading_date || !/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid date in YYYY-MM-DD format.'
    });
  }

  // RULE 5: Date cannot be in the future
  const today = getTodayDateString();
  if (reading_date > today) {
    return res.status(400).json({
      success: false,
      message: 'Date cannot be in the future.'
    });
  }

  // Validate time slot
  if (!time_slot || !ALLOWED_TIME_SLOTS.includes(time_slot)) {
    return res.status(400).json({
      success: false,
      message: `Invalid time slot. Allowed slots: ${ALLOWED_TIME_SLOTS.join(', ')}`
    });
  }

  req.validatedReading = {
    reading_date,
    time_slot,
    glucose_value: numValue
  };

  next();
};

/**
 * Middleware to check slot uniqueness and max 4 readings for CREATE
 */
const validateReadingConstraintsOnCreate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reading_date, time_slot } = req.validatedReading;

    // Check existing readings for this date
    const existing = await db.query(
      'SELECT id, time_slot FROM sweety.readings WHERE user_id = $1 AND reading_date = $2',
      [userId, reading_date]
    );

    // RULE 4: Maximum four readings per day
    if (existing.rows.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'You can add only 4 readings per day.'
      });
    }

    // RULE 3: Only one reading per slot per day
    const duplicateSlot = existing.rows.find((r) => r.time_slot === time_slot);
    if (duplicateSlot) {
      const article = ['After', 'A', 'E', 'I', 'O', 'U'].some((p) =>
        time_slot.startsWith(p)
      )
        ? 'an'
        : 'a';
      return res.status(400).json({
        success: false,
        message: `You already have ${article} ${time_slot} reading for this date.`
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check slot uniqueness and ownership for UPDATE
 */
const validateReadingConstraintsOnUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const readingId = parseInt(req.params.id, 10);

    if (isNaN(readingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reading ID.'
      });
    }

    // Check ownership
    const currentReadingResult = await db.query(
      'SELECT * FROM sweety.readings WHERE id = $1 AND user_id = $2',
      [readingId, userId]
    );

    if (currentReadingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found or unauthorized.'
      });
    }

    const { reading_date, time_slot } = req.validatedReading;

    // Check other readings on that date excluding current reading id
    const otherReadings = await db.query(
      'SELECT id, time_slot FROM sweety.readings WHERE user_id = $1 AND reading_date = $2 AND id != $3',
      [userId, reading_date, readingId]
    );

    // RULE 3: Only one reading per slot per day (allowing current reading to retain its own time slot)
    const duplicateSlot = otherReadings.rows.find((r) => r.time_slot === time_slot);
    if (duplicateSlot) {
      const article = ['After', 'A', 'E', 'I', 'O', 'U'].some((p) =>
        time_slot.startsWith(p)
      )
        ? 'an'
        : 'a';
      return res.status(400).json({
        success: false,
        message: `You already have ${article} ${time_slot} reading for this date.`
      });
    }

    // Note: Since this is an update of 1 existing reading, total count on this date cannot exceed 4
    if (otherReadings.rows.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'You can add only 4 readings per day.'
      });
    }

    req.currentReading = currentReadingResult.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ALLOWED_TIME_SLOTS,
  validateReadingInput,
  validateReadingConstraintsOnCreate,
  validateReadingConstraintsOnUpdate
};
