const express = require('express');
const TripRouter = express.Router();

const { 
    addTrip, 
    getAllTrips, 
    deleteTrip, 
    getTripByID,
    getTripByGuideID,
    getTripByCustomerIDNew, 
    onGoingTrips,
    getTripByCustomerIDOLD,  
    getOngoingTrips, 
    getPreviousTrips, 
    updateTripStatus,
    updateTripData,
    getTripByGuideIDCustomer
} = require('../Controllers/tripController');

TripRouter.post('/addTrip', addTrip);
TripRouter.get('/', getAllTrips);
TripRouter.delete('/:TripID', deleteTrip);
TripRouter.get('/:TripID', getTripByID);
TripRouter.get('/guide/:GuideID', getTripByGuideID);
TripRouter.get('/tripcustomer/:GuideID', getTripByGuideIDCustomer);
TripRouter.get('/customer/:CustomerID', getTripByCustomerIDNew);
TripRouter.get('/getPreviousTrips/:CustomerID', getTripByCustomerIDOLD);
// TripRouter.get('/get/getOngoingTrips', getOngoingTrips);
TripRouter.get('/get/getPreviousTripsAll', getPreviousTrips);
TripRouter.put('/updateTripStatus', updateTripStatus);
TripRouter.get('/get/onGoingTrips', onGoingTrips);
TripRouter.put('/updateTripData', updateTripData);

module.exports = TripRouter;
