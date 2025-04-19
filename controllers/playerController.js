const Player = require('../models/Player');

// Create a new player (Club owner or Admin)
exports.createPlayer = async (req, res, next) => {
  try {
    const player = await Player.create({ ...req.body, club: req.body.club });
    res.status(201).json(player);
  } catch (err) { next(err); }
};

// Get all players (public)
exports.getPlayers = async (req, res) => {
  const players = await Player.find().populate('club', 'name');
  res.json(players);
};

// Get a single player
exports.getPlayer = async (req, res) => {
  const player = await Player.findById(req.params.id).populate('club', 'name');
  if (!player) return res.status(404).json({ message: 'Player not found' });
  res.json(player);
};

// Update player (Club owner or Admin)
exports.updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(player);
  } catch (err) { next(err); }
};

// Delete player (Club owner or Admin)
exports.deletePlayer = async (req, res, next) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.json({ message: 'Player deleted' });
  } catch (err) { next(err); }
};
