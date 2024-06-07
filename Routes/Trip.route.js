const express = require('express');
const TripRouter = express.Router();

const { addTrip, getAllTrips, deleteTrip, getTripByID ,getTripByGuideID,getTripByCustomerIDNew , getTripByCustomerIDOLD } = require('../Controllers/tripController');

TripRouter.post('/addTrip', addTrip);
TripRouter.get('/', getAllTrips);
TripRouter.delete('/:TripID', deleteTrip);
TripRouter.get('/:TripID', getTripByID);
TripRouter.get('/guide/:GuideID', getTripByGuideID);
TripRouter.get('/customer/:CustomerID', getTripByCustomerIDNew);
TripRouter.get('/getPreviousTrips', getTripByCustomerIDOLD);

module.exports = TripRouter;



