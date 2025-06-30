const express = require('express');
const app = express();
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const PORT = 5000;

app.use(express.json()); // Required for POST

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});