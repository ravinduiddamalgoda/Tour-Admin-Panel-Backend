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
    updateTripData
} = require('../Controllers/tripController');

TripRouter.post('/addTrip', addTrip);
TripRouter.get('/', getAllTrips);
TripRouter.delete('/:TripID', deleteTrip);
TripRouter.get('/:TripID', getTripByID);
TripRouter.get('/guide/:GuideID', getTripByGuideID);
TripRouter.get('/customer/:CustomerID', getTripByCustomerIDNew);
TripRouter.get('/getPreviousTrips/:CustomerID', getTripByCustomerIDOLD);
// TripRouter.get('/get/getOngoingTrips', getOngoingTrips);
TripRouter.get('/get/getPreviousTripsAll', getPreviousTrips);
TripRouter.put('/updateTripStatus', updateTripStatus);
TripRouter.get('/get/onGoingTrips', onGoingTrips);
TripRouter.put('/updateTripData', updateTripData);

module.exports = TripRouter;
