const Match = require('../models/Match');

exports.createMatch = async (req, res, next) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (err) { next(err); }
};

exports.getMatches = async (req, res) => {
  const matches = await Match.find().populate('tournament').populate('homeTeam awayTeam', 'name').populate('referee', 'name');
  res.json(matches);
};

exports.getMatch = async (req, res) => {
  const match = await Match.findById(req.params.id).populate('tournament').populate('homeTeam awayTeam', 'name').populate('referee', 'name');
  if (!match) return res.status(404).json({ message: 'Match not found' });
  res.json(match);
};

exports.updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(match);
  } catch (err) { next(err); }
};

exports.deleteMatch = async (req, res, next) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (err) { next(err); }
};

// Get all upcoming matches (status = scheduled, scheduledAt ≥ now)
exports.getUpcomingMatches = async (req, res, next) => {
  try {
    const now = new Date();
    const matches = await Match.find({
      status: 'scheduled',
      scheduledAt: { $gte: now }
    })
      .sort('scheduledAt')
      .populate('tournament', 'name')
      .populate('homeTeam awayTeam', 'name')
      .populate('referee', 'name');
    res.json(matches);
  } catch (err) { next(err); }
};

// Get matches on a specific date (YYYY-MM-DD)
exports.getMatchesByDate = async (req, res, next) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const matches = await Match.find({
      scheduledAt: { $gte: date, $lt: nextDay }
    })
      .sort('scheduledAt')
      .populate('tournament', 'name')
      .populate('homeTeam awayTeam', 'name')
      .populate('referee', 'name');
    res.json(matches);
  } catch (err) { next(err); }
};
