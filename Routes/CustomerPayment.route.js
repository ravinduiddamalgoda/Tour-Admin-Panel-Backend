const express = require('express');
const { body } = require('express-validator');
const CustomerPaymentRouter = express.Router();
const { validate, authGuard } = require('../utils/validator');
const customerPaymentController = require('../Controllers/CustomerPaymentController');

CustomerPaymentRouter.post('/addPayment', 
    authGuard, 
    validate([
        body('TripID').isInt().withMessage('TripID must be an integer'),
        body('Amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
        body('Date').isDate().withMessage('Date must be a valid date'),
        body('PaymentType').isString().withMessage('PaymentType must be a string'),
    ]), 
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

module.exports = CustomerPaymentRouter;
