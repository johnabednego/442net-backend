const express = require('express');
const {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
  addPersonnel,
  removePersonnel
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { isClubOwnerOrAdmin } = require('../middleware/ownershipMiddleware');
const { body, param } = require('express-validator');
const validate = require('../middleware/validateRequest');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Club:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *         name:
 *           type: string
 *           example: Accra Lions FC
 *         contactEmail:
 *           type: string
 *           format: email
 *           example: admin@lionsfc.com
 *         country:
 *           type: string
 *           example: Ghana
 *         stateOrRegion:
 *           type: string
 *           example: Greater Accra
 *         city:
 *           type: string
 *           example: Accra
 *         website:
 *           type: string
 *           example: https://www.lionsfc.com
 *         logoUrl:
 *           type: string
 *           example: https://cdn.442net.com/logos/lionsfc.png
 *         admin:
 *           type: string
 *           example: 60c72b1e9b1e8c0f005d7a3a
 *         personnel:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60c72b1e9b1e8c0f005d7a3a","60c72b1e9b1e8c0f005d7a3b"]
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
 *   name: Clubs
 *   description: Club registration and management
 */

router.use(protect);

/**
 * @swagger
 * /clubs:
 *   post:
 *     tags: [Clubs]
 *     summary: Create a new club
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
 *               - contactEmail
 *               - country
 *               - stateOrRegion
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *                 example: Accra Lions FC
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: admin@lionsfc.com
 *               country:
 *                 type: string
 *                 example: Ghana
 *               stateOrRegion:
 *                 type: string
 *                 example: Greater Accra
 *               city:
 *                 type: string
 *                 example: Accra
 *               website:
 *                 type: string
 *                 example: https://www.442fc.com
 *               logoUrl:
 *                 type: string
 *                 example: https://somewhere/442fc.png
 *     responses:
 *       201:
 *         description: Club created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       400:
 *         description: Validation errors
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('contactEmail').isEmail().withMessage('Valid contactEmail is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('stateOrRegion').notEmpty().withMessage('State or Region is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('logoUrl').optional().isURL().withMessage('logoUrl must be a valid URL'),
  ],
  validate,
  createClub
);

/**
 * @swagger
 * /clubs:
 *   get:
 *     tags: [Clubs]
 *     summary: Retrieve all clubs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of club objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Club'
 */
router.get('/', getClubs);

/**
 * @swagger
 * /clubs/{id}:
 *   get:
 *     tags: [Clubs]
 *     summary: Get a club by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *     responses:
 *       200:
 *         description: Club object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       404:
 *         description: Club not found
 */
router.get('/:id', getClub);

/**
 * @swagger
 * /clubs/{id}:
 *   put:
 *     tags: [Clubs]
 *     summary: Update club details (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Accra Lions United
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: contact@lionsunited.com
 *               country:
 *                 type: string
 *                 example: Ghana
 *               stateOrRegion:
 *                 type: string
 *                 example: Greater Accra
 *               city:
 *                 type: string
 *                 example: Accra
 *               website:
 *                 type: string
 *                 example: https://www.442united.com
 *               logoUrl:
 *                 type: string
 *                 example: https://somewhere/442united.png
 *     responses:
 *       200:
 *         description: Updated club object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       400:
 *         description: Validation errors
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  isClubOwnerOrAdmin,
  [
    param('id').isMongoId().withMessage('Valid club ID is required'),
    body('name').optional(),
    body('contactEmail').optional().isEmail(),
    body('country').optional(),
    body('stateOrRegion').optional(),
    body('city').optional(),
    body('website').optional().isURL(),
    body('logoUrl').optional().isURL(),
  ],
  validate,
  updateClub
);

/**
 * @swagger
 * /clubs/{id}:
 *   delete:
 *     tags: [Clubs]
 *     summary: Delete a club (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *     responses:
 *       200:
 *         description: Confirmation message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Club deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Club not found
 */
router.delete('/:id', isClubOwnerOrAdmin, deleteClub);

/**
 * @swagger
 * /clubs/{id}/personnel:
 *   post:
 *     tags: [Clubs]
 *     summary: Add a user to club personnel (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 60c72b1e9b1e8c0f005d7a3a
 *     responses:
 *       200:
 *         description: Updated club with new personnel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       400:
 *         description: Validation errors
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Club or User not found
 */
router.post(
  '/:id/personnel',
  isClubOwnerOrAdmin,
  [
    param('id').isMongoId(),
    body('userId').notEmpty().isMongoId().withMessage('Valid userId is required'),
  ],
  validate,
  addPersonnel
);

/**
 * @swagger
 * /clubs/{id}/personnel/{userId}:
 *   delete:
 *     tags: [Clubs]
 *     summary: Remove a user from club personnel (Club owner or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60c72b2f9b1e8c0f005d7a3b
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 60c72b1e9b1e8c0f005d7a3a
 *     responses:
 *       200:
 *         description: Updated club with personnel removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Club'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Club or User not found
 */
router.delete(
  '/:id/personnel/:userId',
  isClubOwnerOrAdmin,
  [
    param('id').isMongoId(),
    param('userId').isMongoId(),
  ],
  validate,
  removePersonnel
);

module.exports = router;
