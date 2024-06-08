const express = require('express');
const { body } = require('express-validator');
const GuideAvailabilityRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const guideAvailabilityController = require('../Controllers/GuideAvailabilityController');

// GuideAvailabilityRouter.post('/addAvailability', 
//     authGuard, 
//     validate([
//         body('GuideID').isInt().withMessage('GuideID must be an integer'),
//         body('StartDate').isDate().withMessage('StartDate must be a valid date'),
//         body('EndDate').isDate().withMessage('EndDate must be a valid date'),
//     ]), 
//     guideAvailabilityController.addAvailability
// );

GuideAvailabilityRouter.get('/getAllAvailability', authGuard, guideAvailabilityController.getAllAvailability);

GuideAvailabilityRouter.get('/getAvailability/:GuideID', authGuard, guideAvailabilityController.getAvailabilityById);

GuideAvailabilityRouter.put('/updateAvailability/:GuideID', authGuard, guideAvailabilityController.updateAvailability);

//GuideAvailabilityRouter.delete('/deleteAvailability/:GuideID', authGuard, guideAvailabilityController.deleteAvailability);

module.exports = GuideAvailabilityRouter;
