const express = require('express');
const { body } = require('express-validator');
const TourPackagesrouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const { upload } = require('../Controllers/TourPackagesController');
const tourPackagesController = require('../Controllers/TourPackagesController');

TourPackagesrouter.post('/addTourPackage', upload.single('image'),tourPackagesController.addTourPackage);

TourPackagesrouter.get('/getAllTourPackages', tourPackagesController.getAllTourPackages);

TourPackagesrouter.get('/getTourPackage/:PackageID', tourPackagesController.getTourPackageById);

TourPackagesrouter.put('/updateTourPackage/:PackageID', upload.single('image'), tourPackagesController.updateTourPackage
);

TourPackagesrouter.delete('/deleteTourPackage/:PackageID', tourPackagesController.deleteTourPackage);

module.exports = TourPackagesrouter;
