const express = require('express');
const Document = require('../models/Document');
const { generateNotes, generateFlashcards } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/notes/:doc_id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.doc_id, user_id: req.user.id });
    if (!doc) {
      return errorResponse(res, "Document not found.", 404);
    }
    return successResponse(res, { notes: doc.notes || "", file_name: doc.file_name });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching notes.", 500);
  }
});

router.post('/notes/:doc_id/regenerate', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.doc_id, user_id: req.user.id });
    if (!doc) {
      return errorResponse(res, "Document not found.", 404);
    }
    try {
      doc.notes = await generateNotes(doc.extracted_text);
      await doc.save();
      return successResponse(res, { notes: doc.notes, file_name: doc.file_name }, "Notes regenerated.");
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error regenerating notes.", 500);
  }
});

router.post('/flashcards/generate/:doc_id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.doc_id, user_id: req.user.id });
    if (!doc) {
      return errorResponse(res, "Document not found.", 404);
    }
    try {
      const cards = await generateFlashcards(doc.extracted_text);
      return successResponse(res, { flashcards: cards, file_name: doc.file_name }, "Flashcards generated successfully.", 201);
    } catch (err) {
      return errorResponse(res, err.message, 422);
    }
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error generating flashcards.", 500);
  }
});

module.exports = router;
