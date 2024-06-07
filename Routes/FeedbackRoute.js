const express = require('express');
const { body } = require('express-validator');
const FeedbackRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const feedbackController = require('../Controllers/feedbackController');

FeedbackRouter.post('/addFeedback', 
    authGuard, 
    feedbackController.getCurrentUser, 
    validate([
        body('TripID').isInt().withMessage('TripID must be an integer'),
        body('Rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('Comment').isString().withMessage('Comment must be a string'),
        body('Status').isString().withMessage('Status must be a string'),
    ]), 
    feedbackController.addFeedback
);

FeedbackRouter.get('/getAllFeedback', authGuard, feedbackController.getAllFeedback);

FeedbackRouter.get('/getFeedback/:FeedbackID', authGuard, feedbackController.getFeedbackById);

FeedbackRouter.delete('/deleteFeedback/:FeedbackID', authGuard, feedbackController.getCurrentUser, feedbackController.deleteFeedback);

module.exports = FeedbackRouter;
