const Club = require('../models/Club');
const Tournament = require('../models/Tournament');

// Ensure user is either Admin or the owner (admin) of the club
exports.isClubOwnerOrAdmin = async (req, res, next) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  if (req.user.role === 'Admin' || club.admin.equals(req.user._id)) {
    req.club = club;
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Not club owner or admin' });
};

// Ensure user is either Admin or referring to themselves
exports.isSelfOrAdmin = (req, res, next) => {
  if (req.user.role === 'Admin' || req.user._id.equals(req.params.id)) return next();
  return res.status(403).json({ message: 'Forbidden: Can only modify own account' });
};


exports.isTournamentOwnerOrAdmin = async (req, res, next) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
  if (req.user.role === 'Admin' || tournament.createdBy.equals(req.user._id)) { req.tournament = tournament; return next(); }
  return res.status(403).json({ message: 'Forbidden: Not tournament owner or admin' });
};
