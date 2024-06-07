const express = require('express');
const { body } = require('express-validator');
const TourPackagesrouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const tourPackagesController = require('../Controllers/TourPackagesController');

TourPackagesrouter.post('/addTourPackage',
    validate([
        body('Name').isString().withMessage('Name must be a string'),
        body('Description').isString().withMessage('Description must be a string'),
        body('Price').isFloat().withMessage('Price must be a number'),
        body('Itinerary').isString().withMessage('Itinerary must be a string'),
        body('NoOfDates').isInt().withMessage('NoOfDates must be an integer'),
    ]), 
    tourPackagesController.addTourPackage
);

TourPackagesrouter.get('/getAllTourPackages', tourPackagesController.getAllTourPackages);

TourPackagesrouter.get('/getTourPackage/:PackageID', tourPackagesController.getTourPackageById);

TourPackagesrouter.put('/updateTourPackage/:PackageID', 
    validate([
        body('Name').isString().withMessage('Name must be a string'),
        body('Description').isString().withMessage('Description must be a string'),
        body('Price').isFloat().withMessage('Price must be a number'),
        body('Itinerary').isString().withMessage('Itinerary must be a string'),
        body('NoOfDates').isInt().withMessage('NoOfDates must be an integer'),
    ]), 
    tourPackagesController.updateTourPackage
);

TourPackagesrouter.delete('/deleteTourPackage/:PackageID', tourPackagesController.deleteTourPackage);

module.exports = TourPackagesrouter;
