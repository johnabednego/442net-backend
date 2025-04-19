const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contactEmail: { type: String, required: true, unique: true },
  country: {type: String, required: true},
  stateOrRegion: {type: String, required: true},
  city: {type: String, required: true},
  website: String,
  logoUrl: String,
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personnel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Club', ClubSchema);