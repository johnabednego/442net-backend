const express = require('express');
const { 
  upsertOfficial, getOfficials, getOfficial, deleteOfficial,
} = require('../controllers/officialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Official:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             _id: { type: string }
 *             name: { type: string }
 *             email: { type: string }
 *         qualifications:
 *           type: string
 *         bio:
 *           type: string
 *         rating:
 *           type: object
 *           properties:
 *             average: { type: number }
 *             count:   { type: number }
 *         availability:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dayOfWeek: { type: number }
 *               timeSlots:
 *                 type: array
 *                 items: { type: string }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         match: { type: string }
 *         official: { type: string }
 *         bookedBy: { type: string }
 *         status: { type: string, enum: [pending,confirmed,cancelled] }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * tags:
 *   - name: Officials
 *     description: Referee/Linesman profiles & marketplace
 *   - name: Bookings
 *     description: Official booking workflows
 */

router.use(protect);

/**
 * @swagger
 * /officials:
 *   post:
 *     tags: [Officials]
 *     summary: Create or update own official profile
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qualifications]
 *             properties:
 *               qualifications:
 *                 type: string
 *                 example: FIFA Certified Referee, Level 2
 *               bio:
 *                 type: string
 *                 example: Experienced official with 10+ years…
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek: { type: number, example: 6 }
 *                     timeSlots: 
 *                       type: array
 *                       items: { type: string }
 *     responses:
 *       200:
 *         description: Official profile created/updated
 *         content:
 *           application/json: { schema: { $ref:'#/components/schemas/Official' } }
 */
router.post(
  '/',
  [ body('qualifications').notEmpty() ],
  validate,
  upsertOfficial
);

/**
 * @swagger
 * /officials:
 *   get:
 *     tags: [Officials]
 *     summary: Browse all officials
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Array of officials
 *         content:
 *           application/json: { schema: { type: array, items: { $ref:'#/components/schemas/Official' } } }
 */
router.get('/', getOfficials);

/**
 * @swagger
 * /officials/{id}:
 *   get:
 *     tags: [Officials]
 *     summary: Get a single official
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: Official object
 *         content:
 *           application/json: { schema: { $ref:'#/components/schemas/Official' } }
 *       404:
 *         description: Official not found
 */
router.get(
  '/:id',
  param('id').isMongoId(),
  validate,
  getOfficial
);

/**
 * @swagger
 * /officials/{id}:
 *   delete:
 *     tags: [Officials]
 *     summary: Delete an official profile (Admin only)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: Confirmation message
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authorize('Admin'), param('id').isMongoId(), validate, deleteOfficial);

module.exports = router;
