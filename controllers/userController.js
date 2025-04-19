const User = require('../models/User');

exports.getMe = async (req, res, next) => {
  res.json(req.user);
};

exports.updateMe = async (req, res, next) => {
  const updates = (({ name, email }) => ({ name, email }))(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(user);
};

exports.getUsers = async (req, res, next) => {
  const users = await User.find();
  res.json(users);
};

exports.getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.deleteUser = async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};
