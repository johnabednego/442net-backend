const mongoose = require('mongoose');

const OfficialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  qualifications: { type: String, required: true },
  bio:            { type: String },
  rating:        {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 }
  },
  availability: [{                // ISO weekday numbers: 0 (Sun)–6 (Sat)
    dayOfWeek: { type: Number, min: 0, max: 6 },
    timeSlots: [String]           // e.g. ["09:00-12:00","14:00-17:00"]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Official', OfficialSchema);
