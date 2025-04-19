const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  match:    { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  official: { type: mongoose.Schema.Types.ObjectId, ref: 'Official', required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:   { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
