const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const usersPath = path.join(__dirname, '../data/users.json');
const SECRET_KEY = 'supersecretkey'; // for dev only

//  Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  const users = JSON.parse(fs.readFileSync(usersPath));

  const userExists = users.find(u => u.email === email);
  if (userExists)
    return res.status(409).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.status(201).json({ message: 'User registered successfully' });
});

//  Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users.find(u => u.email === email);

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '1h',
  });

  res.json({ message: 'Login successful', token });
});

//  Middleware: Verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

//  Protected Route
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.email}` });
});

module.exports = router;
