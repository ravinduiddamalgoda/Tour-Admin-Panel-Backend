const express = require('express');
const TripRouter = express.Router();

const { addTrip, getAllTrips, deleteTrip, getTripByID ,getTripByGuideID,getTripByCustomerIDNew , getTripByCustomerIDOLD ,  getOngoingTrips , getPreviousTrips, updateTripStatus, getTripByGuideIDCustomer  } = require('../Controllers/tripController');

TripRouter.post('/addTrip', addTrip);
TripRouter.get('/', getAllTrips);
TripRouter.delete('/:TripID', deleteTrip);
TripRouter.get('/:TripID', getTripByID);
TripRouter.get('/guide/:GuideID', getTripByGuideID);
TripRouter.get('/tripcustomer/:GuideID', getTripByGuideIDCustomer);
TripRouter.get('/customer/:CustomerID', getTripByCustomerIDNew);
TripRouter.get('/getPreviousTrips', getTripByCustomerIDOLD);
TripRouter.get('/getOngoingTrips', getOngoingTrips);
TripRouter.get('/getPreviousTripsAll', getPreviousTrips);
TripRouter.put('/updateTripStatus', updateTripStatus);

module.exports = TripRouter;



