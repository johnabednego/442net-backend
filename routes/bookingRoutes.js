const express = require('express');
const { 
  bookOfficial, getBookingsForOfficial, cancelBooking
} = require('../controllers/officialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Book an official for a match
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matchId, officialId]
 *             properties:
 *               matchId:
 *                 type: string
 *               officialId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json: { schema: { $ref:'#/components/schemas/Booking' } }
 *       400:
 *         description: Validation errors
 */
router.post(
    '/bookings',
    [ body('matchId').isMongoId(), body('officialId').isMongoId() ],
    validate,
    bookOfficial
  );
  
  /**
   * @swagger
   * /bookings/official/{officialId}:
   *   get:
   *     tags: [Bookings]
   *     summary: List bookings for an official
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: officialId
   *         schema: { type: string }
   *         required: true
   *     responses:
   *       200:
   *         description: Array of bookings
   *         content:
   *           application/json: { schema: { type: array, items: { $ref:'#/components/schemas/Booking' } } }
   */
  router.get(
    '/bookings/official/:officialId',
    param('officialId').isMongoId(),
    validate,
    getBookingsForOfficial
  );
  
  /**
   * @swagger
   * /bookings/{id}:
   *   delete:
   *     tags: [Bookings]
   *     summary: Cancel a booking (booker or Admin)
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string }
   *         required: true
   *     responses:
   *       200:
   *         description: Booking cancelled
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Booking not found
   */
  router.delete(
    '/bookings/:id',
    param('id').isMongoId(),
    validate,
    cancelBooking
  );
  
  module.exports = router;
  