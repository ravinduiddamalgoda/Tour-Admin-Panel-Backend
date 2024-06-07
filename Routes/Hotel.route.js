const express = require('express');
const { addHotel , getALLHotels , deleteHotel , getHotelByID , updateHotel} = require('../Controllers/hotelController');
const HotelRouter = express.Router();


HotelRouter.post('/addHotel', addHotel);
HotelRouter.get('/', getALLHotels);
HotelRouter.delete('/deleteHotel/:HotelID', deleteHotel);
HotelRouter.get('/getHotelByID/:HotelID', getHotelByID);
HotelRouter.put('/updateHotel/:HotelID', updateHotel);  

module.exports = HotelRouter;