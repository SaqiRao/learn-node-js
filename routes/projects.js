const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/projects.json');

// 🟢 Read all projects
router.get('/', (req, res) => {
  const data = fs.readFileSync(dataPath);
  const projects = JSON.parse(data);
  res.json(projects);
});

// 🟢 Add new project
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const data = fs.readFileSync(dataPath);
  const projects = JSON.parse(data);

  const newProject = {
    id: projects.length + 1,
    title,
    description
  };

  projects.push(newProject);

  fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2)); // pretty print
  res.status(201).json(newProject);
});

module.exports = router;
