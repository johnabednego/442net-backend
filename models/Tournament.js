const mongoose = require('mongoose');
const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  format: { type: String, enum: ['single-elimination','double-elimination','round-robin'], default: 'round-robin' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
module.exports = mongoose.model('Tournament', TournamentSchema);