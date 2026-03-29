const express = require('express');
const router = express.Router();
const DailyTest = require('../models/DailyTest');

// Publish Daily Test
router.post('/publish', async (req, res) => {
  try {
    const test = new DailyTest(req.body);
    await test.save();
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Active Tests (last 24 hours)
router.get('/active', async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tests = await DailyTest.find({
      publishedAt: { $gte: since },
      active: true
    }).sort({ publishedAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Tests (Teacher)
router.get('/all', async (req, res) => {
  try {
    const tests = await DailyTest.find()
      .sort({ publishedAt: -1 })
      .select('-questions');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Test
router.delete('/:id', async (req, res) => {
  try {
    await DailyTest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear All Tests
router.delete('/clear/all', async (req, res) => {
  try {
    await DailyTest.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;