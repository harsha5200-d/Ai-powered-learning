const express = require('express');
const multer = require('multer');
const Document = require('../models/Document');
const { extractTextFromPdf } = require('../services/pdfService');
const { generateNotes } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_CONTENT_LENGTH_MB || 50) * 1024 * 1024 }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return errorResponse(res, "No file selected.", 400);
    }

    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return errorResponse(res, "Only PDF files are allowed.", 400);
    }

    let extractedText;
    try {
      extractedText = await extractTextFromPdf(file.buffer);
    } catch (err) {
      return errorResponse(res, `Failed to process PDF: ${err.message}`, 422);
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return errorResponse(
        res,
        "The uploaded PDF does not contain enough readable text. Please ensure it is a text-based document and not just scanned images.",
        422
      );
    }

    let notes = null;
    try {
      notes = await generateNotes(extractedText);
    } catch (err) {
      // Notes are optional; won't block upload
    }

    const doc = new Document({
      user_id: req.user.id,
      file_name: file.originalname,
      extracted_text: extractedText,
      notes: notes
    });
    await doc.save();

    return successResponse(res, doc.toDict(false, 0), "Document uploaded successfully.", 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error during upload.", 500);
  }
});

router.get('/documents', authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({ user_id: req.user.id }).sort({ uploaded_at: -1 }).populate('quizzes');
    const responseData = docs.map(d => d.toDict(false, d.quizzes ? d.quizzes.length : 0));
    return successResponse(res, responseData);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching documents.", 500);
  }
});

router.get('/documents/:doc_id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.doc_id, user_id: req.user.id }).populate('quizzes');
    if (!doc) {
      return errorResponse(res, "Document not found.", 404);
    }
    return successResponse(res, doc.toDict(true, doc.quizzes ? doc.quizzes.length : 0));
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching document.", 500);
  }
});

module.exports = router;
