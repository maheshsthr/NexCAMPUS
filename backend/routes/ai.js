import { Router } from 'express';
import { summarizeNotice, eventAssistant } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/ai/summarize
 * @desc    Summarize notice text using Gemini (Admin only)
 * @access  Private/Admin
 * @body    { text: "notice content" }
 * @return  { analysis: { summary, important_dates, deadlines, venue, key_instructions } }
 */
router.post('/summarize', protect, authorize('Admin'), summarizeNotice);

/**
 * @route   POST /api/ai/event-assistant
 * @desc    Ask questions about events using Gemini
 * @access  Private
 * @body    { message: "user question" }
 * @return  { answer: "AI response" }
 */
router.post('/event-assistant', protect, eventAssistant);

export default router;
