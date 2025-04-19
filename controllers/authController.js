const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const emailService = require('../services/emailService');
const tokenService = require('../services/tokenService');

exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, country, stateOrRegion, city, role } = req.body;
    const user = await User.create({ firstName, lastName, email, phoneNumber, password, country, stateOrRegion, city, role });
    const token = tokenService.generateAccessToken(user);
    res.status(201).json({ token });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = tokenService.generateAccessToken(user);
    res.json({ token });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOTP();
    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await emailService.sendOTP(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+password resetOTP otpExpiry');
    if (!user || user.resetOTP !== otp || Date.now() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP invalid or expired' });
    user.password = newPassword;
    user.resetOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) { next(err); }
};
