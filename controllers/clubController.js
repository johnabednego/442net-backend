const Club = require('../models/Club');
const User = require('../models/User');

exports.createClub = async (req, res, next) => {
  try {
    const { name, contactEmail, country, stateOrRegion, city, website, logoUrl, } = req.body;
    const club = await Club.create({ name, contactEmail, country, stateOrRegion, city, website, logoUrl,  admin: req.user._id, personnel: [req.user._id] });
    res.status(201).json(club);
  } catch (err) { next(err); }
};

exports.getClubs = async (req, res, next) => {
  const clubs = await Club.find().populate('admin', 'name email').populate('personnel', 'name email');
  res.json(clubs);
};

exports.getClub = async (req, res, next) => {
  const club = await Club.findById(req.params.id).populate('admin', 'name email').populate('personnel', 'name email');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json(club);
};

exports.updateClub = async (req, res, next) => {
  const updates = (({ name, location, logoUrl, contactEmail }) => ({ name, location, logoUrl, contactEmail }))(req.body);
  const club = await Club.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(club);
};

exports.deleteClub = async (req, res, next) => {
  await Club.findByIdAndDelete(req.params.id);
  res.json({ message: 'Club deleted' });
};

exports.addPersonnel = async (req, res, next) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const club = await Club.findById(req.params.id);
  club.personnel.addToSet(user._id);
  await club.save();
  res.json(club);
};

exports.removePersonnel = async (req, res, next) => {
  const club = await Club.findById(req.params.id);
  club.personnel.pull(req.params.userId);
  await club.save();
  res.json(club);
};
