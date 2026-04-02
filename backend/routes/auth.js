const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { id, studentId, password } = req.body;
    const loginId = (id || studentId || '').trim();

    if (!loginId || !password)
      return res.status(400).json({ error: 'ID और Password जरूरी है' });

    const student = await Student.findOne({ id: loginId.toUpperCase(), password });
    if (!student)
      return res.status(401).json({ error: 'ID या Password गलत है' });

    student.lastLogin = new Date();
    await student.save();

    res.json({ success: true, student: {
      name: student.name,
      father: student.father,
      id: student.id
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher Login
router.post('/teacher', (req, res) => {
  const { password } = req.body;
  if (password === process.env.TEACHER_PASSWORD)
    res.json({ success: true });
  else
    res.status(401).json({ error: 'Password गलत है' });
});

// Add Student (Teacher only)
router.post('/add-student', async (req, res) => {
  try {
    const { name, father, id, password } = req.body;
    if (!name || !id || !password)
      return res.status(400).json({ error: 'सभी fields जरूरी हैं' });

    const existing = await Student.findOne({ id: id.toUpperCase() });
    if (existing)
      return res.status(400).json({ error: 'यह ID already exists' });

    const student = new Student({
      name, father: father || '—',
      id: id.toUpperCase(), password
    });
    await student.save();
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Students (Teacher only)
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().select('-__v');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Student
router.delete('/student/:id', async (req, res) => {
  try {
    await Student.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;