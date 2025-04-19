const express = require('express');
const { getStandings } = require('../controllers/standingController');
const { protect } = require('../middleware/authMiddleware');
const { param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Standing:
 *       type: object
 *       properties:
 *         club:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 60c72b2f9b1e8c0f005d7a3b
 *             name:
 *               type: string
 *               example: Accra Lions FC
 *         played:
 *           type: number
 *           example: 5
 *         wins:
 *           type: number
 *           example: 3
 *         draws:
 *           type: number
 *           example: 1
 *         losses:
 *           type: number
 *           example: 1
 *         goalsFor:
 *           type: number
 *           example: 8
 *         goalsAgainst:
 *           type: number
 *           example: 4
 *         goalDifference:
 *           type: number
 *           example: 4
 *         points:
 *           type: number
 *           example: 10
 */

/**
 * @swagger
 * tags:
 *   name: Standings
 *   description: Tournament standings
 */

router.use(protect);

/**
 * @swagger
 * /standings/tournament/{tournamentId}:
 *   get:
 *     tags: [Standings]
 *     summary: Get standings for a tournament
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *           example: 60d8f8f2f2f4b12d4c123456
 *     responses:
 *       200:
 *         description: Ordered list of standings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Standing'
 *       404:
 *         description: Tournament not found / No completed matches
 */
router.get(
  '/tournament/:tournamentId',
  param('tournamentId').isMongoId(),
  validate,
  getStandings
);

module.exports = router;
