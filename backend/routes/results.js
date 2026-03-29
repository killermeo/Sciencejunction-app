const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

router.post('/save', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/clear', async (req, res) => {
  try {
    await Result.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;