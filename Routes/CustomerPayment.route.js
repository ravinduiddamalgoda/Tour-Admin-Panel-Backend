const express = require('express');
const { body } = require('express-validator');
const CustomerPaymentRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const customerPaymentController = require('../Controllers/CustomerPaymentController');
const { uploadPDF } = require('../utils/upload');

CustomerPaymentRouter.post('/addPayment', 
    authGuard, 
    uploadPDF.single('bill'),
    customerPaymentController.addPayment
);

CustomerPaymentRouter.get('/getAllPayments', authGuard, customerPaymentController.getAllPayments);

CustomerPaymentRouter.get('/getPayment/:PaymentID', authGuard, customerPaymentController.getPaymentById);

CustomerPaymentRouter.put('/updatePayment/:PaymentID', 
    authGuard, 
    validate([
        body('TripID').isInt().withMessage('TripID must be an integer'),
        body('Amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
        body('Date').isDate().withMessage('Date must be a valid date'),
        body('PaymentType').isString().withMessage('PaymentType must be a string'),
    ]), 
    customerPaymentController.updatePayment
);

CustomerPaymentRouter.delete('/deletePayment/:PaymentID', authGuard, customerPaymentController.deletePayment);
CustomerPaymentRouter.get('/getTotalPaymentByTripID/:TripID', authGuard, customerPaymentController.getTtalPaymentByTripID);

module.exports = CustomerPaymentRouter;
