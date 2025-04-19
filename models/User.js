const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: {type: String, required: true},
  password: { type: String, required: true, select: false },
  country: {type: String, required: true},
  stateOrRegion: {type: String, required: true},
  city: {type: String, required: true},
  role: { type: String, required: true, enum: ['Admin','Coach','Referee','Player','Scout','Sponsor'], default: 'Player' },
  resetOTP: String,
  otpExpiry: Date
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);