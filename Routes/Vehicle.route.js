const express = require('express');
const VehicleRouter = express.Router();
const { addVehicle, getAllVehicles, deleteVehicle, getVehicleByID, updateVehicle } = require('../Controllers/vehicleController');

VehicleRouter.post('/addVehicle', addVehicle);
VehicleRouter.get('/', getAllVehicles);
VehicleRouter.delete('/:VehicleID', deleteVehicle);
VehicleRouter.get('/:VehicleID', getVehicleByID);
VehicleRouter.put('/:VehicleID', updateVehicle);

module.exports = VehicleRouter;

