const mongoose = require('mongoose');
const MatchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  venue: {type: String, required: true},
  status: { type: String, enum: ['scheduled','ongoing','completed'], default: 'scheduled' },
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  }
}, { timestamps: true });
module.exports = mongoose.model('Match', MatchSchema);