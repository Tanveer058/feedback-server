const Feedback = require('../models/feedbackModel');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    const feedback = await Feedback.create({
      name,
      email,
      rating,
      message,
    });

    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully!'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private (Admin)
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    const totalRatings = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = feedbacks.length > 0 ? (totalRatings / feedbacks.length).toFixed(1) : 0;

    res.json({
      success: true,
      data: feedbacks,
      averageRating,
      totalFeedbacks: feedbacks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    
    const avgRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFeedbacks,
        averageRating: avgRating[0]?.averageRating.toFixed(2) || 0,
        ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
const deleteFeedback = async (req, res) => {
  try {
    console.log('DELETE request id:', req.params.id); // debug log
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  deleteFeedback,
  getFeedbackStats,
};