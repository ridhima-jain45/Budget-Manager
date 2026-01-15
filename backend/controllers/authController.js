import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ message: "Error registering", error: err.message });
  }
};

/*export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ message: "Wrong credentials." });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};*/


export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    console.log('Login attempt for:', email);

    // Ensure JWT_SECRET exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT secret is missing (process.env.JWT_SECRET is falsy)');
      return res.status(500).json({ message: 'Server configuration error: JWT secret is missing.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ message: 'Wrong credentials.' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Login error', error: err.message || 'unknown' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Find user by username
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    // Compare old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) return res.status(400).json({ message: "Old password is incorrect." });

    // Hash new password and save
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/*const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Reset password using email + oldPassword + newPassword
exports.resetPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Email, oldPassword and newPassword required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed', error: err.message });
  }
};*/