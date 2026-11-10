const express = require('express');
const authenticate = require('../middleware/auth');
const {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading
} = require('../controllers/reading.controller');
const {
  validateReadingInput,
  validateReadingConstraintsOnCreate,
  validateReadingConstraintsOnUpdate
} = require('../validators/reading.validator');

const router = express.Router();

// Require authentication for all reading endpoints
router.use(authenticate);

router.post('/', validateReadingInput, validateReadingConstraintsOnCreate, createReading);
router.get('/', getReadings);
router.get('/:id', getReadingById);
router.put('/:id', validateReadingInput, validateReadingConstraintsOnUpdate, updateReading);
router.delete('/:id', deleteReading);

module.exports = router;
