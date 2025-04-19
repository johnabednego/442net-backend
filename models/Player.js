const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  fullName:        { type: String, required: true },
  age:             { type: Number },
  position:        { type: String, enum: ['Goalkeeper','Defender','Midfielder','Forward'], required: true },
  club:            { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  jerseyNumber:    { type: Number },
  stats: {
    appearances:   { type: Number, default: 0 },
    goals:         { type: Number, default: 0 },
    assists:       { type: Number, default: 0 }
  },
  photoUrl:        { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
