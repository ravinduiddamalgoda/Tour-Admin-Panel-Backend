const express = require('express');
const { body } = require('express-validator');
const FeedbackRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const feedbackController = require('../Controllers/feedbackController');

FeedbackRouter.post('/addFeedback',
    feedbackController.addFeedback
);

FeedbackRouter.get('/getAllFeedback', authGuard, feedbackController.getAllFeedback);

FeedbackRouter.get('/getFeedback/:FeedbackID', authGuard, feedbackController.getFeedbackById);

FeedbackRouter.delete('/deleteFeedback/:FeedbackID', authGuard, feedbackController.getCurrentUser, feedbackController.deleteFeedback);

module.exports = FeedbackRouter;
