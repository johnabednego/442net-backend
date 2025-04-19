const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const { protect, authorize } = require('../middleware/authMiddleware');
const { isTournamentOwnerOrAdmin } = require('../middleware/ownershipMiddleware');
const {
  createTournament,
  getTournaments,
  getTournament,
  updateTournament,
  deleteTournament,
  addParticipant,
  removeParticipant
} = require('../controllers/tournamentController');

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Tournament:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d8f8f2f2f4b12d4c123456
 *         name:
 *           type: string
 *           example: Summer Cup 2025
 *         format:
 *           type: string
 *           enum: [single-elimination, double-elimination, round-robin]
 *           example: round-robin
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2025-06-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2025-06-15
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60c72b2f9b1e8c0f005d7a3b"]
 *         createdBy:
 *           type: string
 *           example: 60c72b1e9b1e8c0f005d7a3a
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
 *   name: Tournaments
 *   description: Tournament management
 */

/**
 * @swagger
 * /tournaments:
 *   post:
 *     tags: [Tournaments]
 *     summary: Create a new tournament (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Summer Cup 2025
 *               format:
 *                 type: string
 *                 enum: [single-elimination, double-elimination, round-robin]
 *                 example: round-robin
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-15
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60c72b2f9b1e8c0f005d7a3b"]
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       400:
 *         description: Validation errors
 */
router.post(
  '/',
  authorize('Admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('format').optional().isIn(['single-elimination','double-elimination','round-robin']),
    body('startDate').isISO8601().withMessage('Valid startDate required'),
    body('endDate').isISO8601().withMessage('Valid endDate required'),
    body('participants').optional().isArray()
  ],
  validate,
  createTournament
);

/**
 * @swagger
 * /tournaments:
 *   get:
 *     tags: [Tournaments]
 *     summary: Retrieve all tournaments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 */
router.get('/', getTournaments);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     tags: [Tournaments]
 *     summary: Get tournament by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60d8f8f2f2f4b12d4c123456
 *     responses:
 *       200:
 *         description: Tournament object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Tournament not found
 */
router.get('/:id', 
  [param('id').isMongoId().withMessage('Valid tournament ID required')],
  validate,
  getTournament
);

/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     tags: [Tournaments]
 *     summary: Update tournament (Owner or Admin)
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
 *               name:
 *                 type: string
 *                 example: Summer Cup Updated
 *               format:
 *                 type: string
 *                 example: double-elimination
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-05
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-20
 *     responses:
 *       200:
 *         description: Tournament updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  isTournamentOwnerOrAdmin,
  [
    param('id').isMongoId(),
    body('name').optional(),
    body('format').optional().isIn(['single-elimination','double-elimination','round-robin']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
  ],
  validate,
  updateTournament
);

/**
 * @swagger
 * /tournaments/{id}:
 *   delete:
 *     tags: [Tournaments]
 *     summary: Delete tournament (Owner or Admin)
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
 *         description: Tournament deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', isTournamentOwnerOrAdmin, deleteTournament);

/**
 * @swagger
 * /tournaments/{id}/participants:
 *   post:
 *     tags: [Tournaments]
 *     summary: Add participant to tournament (Owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId]
 *             properties:
 *               participantId:
 *                 type: string
 *                 example: 60c72b2f9b1e8c0f005d7a3b
 *     responses:
 *       200:
 *         description: Participant added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 */
router.post(
  '/:id/participants',
  isTournamentOwnerOrAdmin,
  [
    param('id').isMongoId(),
    body('participantId').notEmpty().isMongoId()
  ],
  validate,
  addParticipant
);

/**
 * @swagger
 * /tournaments/{id}/participants/{participantId}:
 *   delete:
 *     tags: [Tournaments]
 *     summary: Remove participant (Owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: participantId
 *         required: true
 *     responses:
 *       200:
 *         description: Participant removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 */
router.delete(
  '/:id/participants/:participantId',
  isTournamentOwnerOrAdmin,
  [param('id').isMongoId(), param('participantId').isMongoId()],
  validate,
  removeParticipant
);

module.exports = router;
