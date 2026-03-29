const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  fatherName: { type: String, default: '—' },
  studentId: { type: String, default: '—' },
  testTitle: { type: String, required: true },
  exam: { type: String, required: true },
  chapter: { type: String, required: true },
  total: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  skipped: { type: Number, required: true },
  pct: { type: Number, required: true },
  finalScore: { type: Number, default: 0 },
  negMarking: { type: Boolean, default: false },
  isDaily: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);