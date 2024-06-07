const express = require('express');
const { body } = require('express-validator');
const GuideAvailabilityRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const guideAvailabilityController = require('../Controllers/GuideAvailabilityController');

GuideAvailabilityRouter.post('/addAvailability', 
    authGuard, 
    validate([
        body('GuideID').isInt().withMessage('GuideID must be an integer'),
        body('StartDate').isDate().withMessage('StartDate must be a valid date'),
        body('EndDate').isDate().withMessage('EndDate must be a valid date'),
    ]), 
    guideAvailabilityController.addAvailability
);

GuideAvailabilityRouter.get('/getAllAvailability', authGuard, guideAvailabilityController.getAllAvailability);

GuideAvailabilityRouter.get('/getAvailability/:AvailabilityID', authGuard, guideAvailabilityController.getAvailabilityById);

GuideAvailabilityRouter.put('/updateAvailability/:AvailabilityID', 
    authGuard, 
    validate([
        body('GuideID').isInt().withMessage('GuideID must be an integer'),
        body('StartDate').isDate().withMessage('StartDate must be a valid date'),
        body('EndDate').isDate().withMessage('EndDate must be a valid date'),
    ]), 
    guideAvailabilityController.updateAvailability
);

GuideAvailabilityRouter.delete('/deleteAvailability/:AvailabilityID', authGuard, guideAvailabilityController.deleteAvailability);

module.exports = GuideAvailabilityRouter;
