const express = require('express');
const { body } = require('express-validator');
const DailyDistanceRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const dailyDistanceController = require('../Controllers/DailyDistanceController');

DailyDistanceRouter.post('/addDailyDistance', 
    authGuard, 
    validate([
        body('TripID').isInt().withMessage('TripID must be an integer'),
        body('Date').isDate().withMessage('Date must be a valid date'),
        body('StartPlace').isString().withMessage('StartPlace must be a string'),
        body('EndPlace').isString().withMessage('EndPlace must be a string'),
        body('Distance').isString().withMessage('Distance must be a string'),
    ]), 
    dailyDistanceController.addDailyDistance
);

DailyDistanceRouter.get('/getAllDailyDistances', authGuard, dailyDistanceController.getAllDailyDistances);

DailyDistanceRouter.get('/getDailyDistance/:DailyDistanceID', authGuard, dailyDistanceController.getDailyDistanceById);

DailyDistanceRouter.put('/updateDailyDistance/:DailyDistanceID', 
    authGuard, 
    validate([
        body('TripID').isInt().withMessage('TripID must be an integer'),
        body('Date').isDate().withMessage('Date must be a valid date'),
        body('StartPlace').isString().withMessage('StartPlace must be a string'),
        body('EndPlace').isString().withMessage('EndPlace must be a string'),
        body('Distance').isString().withMessage('Distance must be a string'),
    ]), 
    dailyDistanceController.updateDailyDistance
);

DailyDistanceRouter.delete('/deleteDailyDistance/:DailyDistanceID', authGuard, dailyDistanceController.deleteDailyDistance);

DailyDistanceRouter.get('/getDailyDistancesByGuide/:GuideID', authGuard, dailyDistanceController.getDailyDistancesByGuide);

module.exports = DailyDistanceRouter;
