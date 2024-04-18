const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  stateRegion: { type: String, required: true },
  city: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'registrar', 'consultant'],
    default: 'consultant'
  },
  tokenVersion: { type: Number, default: 0 },
  facialDescriptors: {
    type: [Number],
    required: true
},
});

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Used for logging in users, compares the entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
