const Tournament = require('../models/Tournament');

exports.createTournament = async (req, res, next) => {
  try {
    const { name, format, startDate, endDate, participants } = req.body;
    const tournament = await Tournament.create({ name, format, startDate, endDate, participants, createdBy: req.user._id });
    res.status(201).json(tournament);
  } catch (err) { next(err); }
};

exports.getTournaments = async (req, res) => {
  const tournaments = await Tournament.find().populate('participants', 'name').populate('createdBy', 'name');
  res.json(tournaments);
};

exports.getTournament = async (req, res) => {
  res.json(req.tournament);
};

exports.updateTournament = async (req, res, next) => {
  try {
    const updates = (({ name, format, startDate, endDate }) => ({ name, format, startDate, endDate }))(req.body);
    Object.assign(req.tournament, updates);
    await req.tournament.save();
    res.json(req.tournament);
  } catch (err) { next(err); }
};

exports.deleteTournament = async (req, res, next) => {
  try {
    await req.tournament.remove();
    res.json({ message: 'Tournament deleted' });
  } catch (err) { next(err); }
};

exports.addParticipant = async (req, res, next) => {
  try {
    const clubId = req.body.participantId;
    req.tournament.participants.addToSet(clubId);
    await req.tournament.save();
    res.json(req.tournament);
  } catch (err) { next(err); }
};

exports.removeParticipant = async (req, res, next) => {
  try {
    req.tournament.participants.pull(req.params.participantId);
    await req.tournament.save();
    res.json(req.tournament);
  } catch (err) { next(err); }
};
