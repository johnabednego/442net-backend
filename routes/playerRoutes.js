const express = require('express');
const {
  createPlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer
} = require('../controllers/playerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { isClubOwnerOrAdmin } = require('../middleware/ownershipMiddleware');
const { body, param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60e5f92a3b5e8c2f346a7890
 *         fullName:
 *           type: string
 *           example: John Doe
 *         age:
 *           type: number
 *           example: 22
 *         position:
 *           type: string
 *           enum: [Goalkeeper, Defender, Midfielder, Forward]
 *           example: Forward
 *         club:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *         jerseyNumber:
 *           type: number
 *           example: 9
 *         stats:
 *           type: object
 *           properties:
 *             appearances:
 *               type: number
 *               example: 10
 *             goals:
 *               type: number
 *               example: 5
 *             assists:
 *               type: number
 *               example: 3
 *         photoUrl:
 *           type: string
 *           example: https://cdn.442net.com/players/johndoe.png
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
 *   name: Players
 *   description: Player profiles and management
 */

router.use(protect);

/**
 * @swagger
 * /players:
 *   post:
 *     tags: [Players]
 *     summary: Create a new player (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, position, club]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               age:
 *                 type: number
 *                 example: 22
 *               position:
 *                 type: string
 *                 enum: [Goalkeeper, Defender, Midfielder, Forward]
 *               club:
 *                 type: string
 *                 example: 60c72b2f9b1e8c0f005d7a3b
 *               jerseyNumber:
 *                 type: number
 *                 example: 9
 *               photoUrl:
 *                 type: string
 *                 example: https://cdn.442net.com/players/johndoe.png
 *     responses:
 *       201:
 *         description: Player created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Validation errors
 */
router.post(
  '/',
  authorize('Admin'),
  [
    body('fullName').notEmpty(),
    body('position').isIn(['Goalkeeper','Defender','Midfielder','Forward']),
    body('club').isMongoId(),
    body('age').optional().isInt({ min: 0 }),
    body('jerseyNumber').optional().isInt({ min: 0 }),
    body('photoUrl').optional().isURL()
  ],
  validate,
  createPlayer
);

/**
 * @swagger
 * /players:
 *   get:
 *     tags: [Players]
 *     summary: List all players
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of player objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 */
router.get('/', getPlayers);

/**
 * @swagger
 * /players/{id}:
 *   get:
 *     tags: [Players]
 *     summary: Get a player by ID
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
 *         description: Player object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player not found
 */
router.get('/:id', param('id').isMongoId(), validate, getPlayer);

/**
 * @swagger
 * /players/{id}:
 *   put:
 *     tags: [Players]
 *     summary: Update player (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:   { type: string }
 *               age:        { type: number }
 *               position:   { type: string, enum: [Goalkeeper, Defender, Midfielder, Forward] }
 *               jerseyNumber: { type: number }
 *               photoUrl:   { type: string }
 *     responses:
 *       200:
 *         description: Updated player
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Validation errors
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  isClubOwnerOrAdmin,
  [
    param('id').isMongoId(),
    body('fullName').optional(),
    body('position').optional().isIn(['Goalkeeper','Defender','Midfielder','Forward']),
    body('age').optional().isInt({ min: 0 }),
    body('jerseyNumber').optional().isInt({ min: 0 }),
    body('photoUrl').optional().isURL()
  ],
  validate,
  updatePlayer
);

/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     tags: [Players]
 *     summary: Delete player (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Confirmation message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Player deleted }
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Player not found
 */
router.delete('/:id', isClubOwnerOrAdmin, param('id').isMongoId(), validate, deletePlayer);

module.exports = router;
