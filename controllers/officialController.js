const Official = require('../models/Official');
const Booking  = require('../models/Booking');

// Create or update own Official profile
exports.upsertOfficial = async (req, res, next) => {
  try {
    const data = { user: req.user._id, ...req.body };
    let official = await Official.findOne({ user: req.user._id });
    if (official) {
      Object.assign(official, data);
    } else {
      official = new Official(data);
    }
    await official.save();
    res.json(official);
  } catch (err) { next(err); }
};

// List all officials (browse)
exports.getOfficials = async (req, res) => {
  const officials = await Official.find()
    .populate('user', 'name email')
    .sort('-rating.average');
  res.json(officials);
};

// Get single official by ID
exports.getOfficial = async (req, res) => {
  const official = await Official.findById(req.params.id)
    .populate('user', 'name email');
  if (!official) return res.status(404).json({ message: 'Official not found' });
  res.json(official);
};

// Delete Official profile (Admin only)
exports.deleteOfficial = async (req, res, next) => {
  try {
    await Official.findByIdAndDelete(req.params.id);
    res.json({ message: 'Official profile deleted' });
  } catch (err) { next(err); }
};

// Book an official for a match
exports.bookOfficial = async (req, res, next) => {
  try {
    const { matchId, officialId } = req.body;
    const booking = await Booking.create({
      match: matchId,
      official: officialId,
      bookedBy: req.user._id
    });
    res.status(201).json(booking);
  } catch (err) { next(err); }
};

// List bookings for an official (Admin or the official themselves)
exports.getBookingsForOfficial = async (req, res) => {
  const officialId = req.user.role==='Admin' ? req.params.officialId : 
                     req.user._id;
  const bookings = await Booking.find({ official: officialId })
    .populate('match')
    .populate('bookedBy','name email');
  res.json(bookings);
};

// Cancel a booking (booker or Admin)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role!=='Admin' && !booking.bookedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
};
