const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  getUpcomingMatches,
  getMatchesByDate
} = require('../controllers/matchController');

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Match:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60e5df3b5f1b2c0012345678
 *         tournament:
 *           type: string
 *           example: 60d8f8f2f2f4b12d4c123456
 *         homeTeam:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *         awayTeam:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3c
 *         referee:
 *           type: string
 *           example: 60c72b1e9b1e8c0f005d7a3d
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           example: '2025-07-10T15:00:00Z'
 *         venue:
 *           type: string
 *           example: 'Baba Yara Stadium'
 *         status:
 *           type: string
 *           enum: [scheduled, ongoing, completed]
 *           example: scheduled
 *         score:
 *           type: object
 *           properties:
 *             home:
 *               type: integer
 *               example: 0
 *             away:
 *               type: integer
 *               example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match scheduling and result management
 */

/**
 * @swagger
 * /matches:
 *   post:
 *     tags: [Matches]
 *     summary: Schedule a new match (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournament
 *               - homeTeam
 *               - awayTeam
 *               - scheduledAt
 *             properties:
 *               tournament:
 *                 type: string
 *                 example: 60d8f8f2f2f4b12d4c123456
 *               homeTeam:
 *                 type: string
 *                 example: 60c72b2f9b1e8c0f005d7a3b
 *               awayTeam:
 *                 type: string
 *                 example: 60c72b2f9b1e8c0f005d7a3c
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: '2025-07-10T15:00:00Z'
 *               venue:
 *                 type: string
 *                 example: 'Baba Yara Stadium'
 *     responses:
 *       201:
 *         description: Match scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Validation errors
 */
router.post(
  '/',
  authorize('Admin'),
  [
    body('tournament').notEmpty().isMongoId().withMessage('Valid tournament ID is required'),
    body('homeTeam').notEmpty().isMongoId().withMessage('Valid homeTeam ID is required'),
    body('awayTeam').notEmpty().isMongoId().withMessage('Valid awayTeam ID is required'),
    body('scheduledAt').isISO8601().withMessage('Valid scheduledAt datetime is required'),
    body('venue').optional().isString()
  ],
  validate,
  createMatch
);

/**
 * @swagger
 * /matches:
 *   get:
 *     tags: [Matches]
 *     summary: Retrieve all matches
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
router.get('/', getMatches);

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     tags: [Matches]
 *     summary: Get match by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60e5df3b5f1b2c0012345678
 *     responses:
 *       200:
 *         description: Match object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match not found
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Valid match ID is required')],
  validate,
  getMatch
);

/**
 * @swagger
 * /matches/{id}:
 *   put:
 *     tags: [Matches]
 *     summary: Update match details (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: '2025-07-10T17:00:00Z'
 *               venue:
 *                 type: string
 *                 example: 'Accra Sports Stadium'
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed]
 *                 example: completed
 *               score:
 *                 type: object
 *                 properties:
 *                   home:
 *                     type: integer
 *                     example: 2
 *                   away:
 *                     type: integer
 *                     example: 1
 *     responses:
 *       200:
 *         description: Updated match object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Match not found
 */
router.put(
  '/:id',
  authorize('Admin'),
  [
    param('id').isMongoId(),
    body('scheduledAt').optional().isISO8601(),
    body('venue').optional().isString(),
    body('status').optional().isIn(['scheduled','ongoing','completed']),
    body('score').optional().isObject()
  ],
  validate,
  updateMatch
);

/**
 * @swagger
 * /matches/{id}:
 *   delete:
 *     tags: [Matches]
 *     summary: Delete match (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Match deleted
 *       404:
 *         description: Match not found
 */
router.delete('/:id', authorize('Admin'), deleteMatch);

/**
 * @swagger
 * /matches/upcoming:
 *   get:
 *     tags: [Matches]
 *     summary: List all upcoming scheduled matches
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of upcoming matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
router.get('/upcoming', getUpcomingMatches);

/**
 * @swagger
 * /matches/date/{date}:
 *   get:
 *     tags: [Matches]
 *     summary: List matches on a given date (YYYY-MM-DD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-06-05
 *     responses:
 *       200:
 *         description: Matches scheduled for that date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *       400:
 *         description: Invalid date format
 */
router.get(
  '/date/:date',
  param('date').isISO8601().withMessage('Date must be YYYY-MM-DD'),
  validate,
  getMatchesByDate
);

module.exports = router;

module.exports = router;
