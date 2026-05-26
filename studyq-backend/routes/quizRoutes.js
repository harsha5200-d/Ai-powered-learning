const express = require('express');
const Document = require('../models/Document');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { generateMcqs } = require('../services/aiService');
const { calculateScore } = require('../services/scoringService');
const { successResponse, errorResponse } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/quiz/generate/:doc_id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.doc_id, user_id: req.user.id });
    if (!doc) {
      return errorResponse(res, "Document not found.", 404);
    }

    let questionsData;
    try {
      questionsData = await generateMcqs(doc.extracted_text);
    } catch (err) {
      return errorResponse(res, err.message, 422);
    }

    const quiz = new Quiz({ user_id: req.user.id, document_id: doc._id });
    await quiz.save();

    const questionsToInsert = questionsData.map(q => ({
      quiz_id: quiz._id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer.toUpperCase()
    }));

    await Question.insertMany(questionsToInsert);

    const fullQuiz = await Quiz.findById(quiz._id);
    return successResponse(res, await fullQuiz.toDict(true, true), "Quiz generated successfully.", 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error generating quiz.", 500);
  }
});

router.get('/quiz/:quiz_id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.quiz_id, user_id: req.user.id });
    if (!quiz) {
      return errorResponse(res, "Quiz not found.", 404);
    }
    return successResponse(res, await quiz.toDict(true, true));
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching quiz.", 500);
  }
});

router.get('/quizzes', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user_id: req.user.id }).sort({ created_at: -1 });
    const responseData = await Promise.all(quizzes.map(q => q.toDict(false, true)));
    return successResponse(res, responseData);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching quizzes.", 500);
  }
});

router.post('/quiz/:quiz_id/submit', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.quiz_id, user_id: req.user.id });
    if (!quiz) {
      return errorResponse(res, "Quiz not found.", 404);
    }

    const answers = req.body.answers;
    if (!answers || typeof answers !== 'object') {
      return errorResponse(res, "answers must be an object mapping question_id to option.", 400);
    }

    const result = await calculateScore(quiz._id, answers);

    const attempt = new Attempt({
      user_id: req.user.id,
      quiz_id: quiz._id,
      score: result.score,
      total_questions: result.total_questions
    });
    await attempt.save();

    result.attempt_id = attempt._id;
    return successResponse(res, result, "Quiz submitted successfully.");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error submitting quiz.", 500);
  }
});

module.exports = router;
