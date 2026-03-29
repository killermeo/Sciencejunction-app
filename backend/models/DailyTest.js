const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  q: String,
  opts: [String],
  ans: Number,
  exp: String
});

const DailyTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  exam: { type: String, required: true },
  chapter: { type: String, required: true },
  timeLimit: { type: Number, default: 30 },
  questions: [QuestionSchema],
  negMarking: { type: Boolean, default: false },
  negPattern: {
    pos: { type: Number, default: 1 },
    neg: { type: Number, default: 0 },
    label: { type: String, default: '+1 / No Neg' }
  },
  publishedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('DailyTest', DailyTestSchema);