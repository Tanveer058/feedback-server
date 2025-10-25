const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  deleteFeedback,
  getFeedbackStats,

} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

//pubblic route
router.route('/')
  .post(createFeedback)
  .get(protect, getFeedbacks);

  //private route
  router.get('/stats', protect, getFeedbackStats);  //(Must be before /:id)
router.route('/:id').delete(protect, deleteFeedback);



module.exports = router;