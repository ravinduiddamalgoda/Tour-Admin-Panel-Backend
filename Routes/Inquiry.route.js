const express = require('express');
const InquiryRouter = express.Router();
const {addInquiry, getAllInquiries, deleteInquiry, getInquiryByID , addInquiryNewUser , updateInquiryStatus, getInquiryByUserID} = require('../Controllers/inquiryController');

InquiryRouter.post('/addInquiry', addInquiry);
InquiryRouter.get('/', getAllInquiries);
InquiryRouter.delete('/:InquiryID', deleteInquiry);
InquiryRouter.get('/:InquiryID', getInquiryByID);
InquiryRouter.post('/addInquiryNewUser', addInquiryNewUser);
InquiryRouter.put('/updateInquiryStatus/:InquiryID', updateInquiryStatus);
InquiryRouter.get('/getInquiryByUserID/:UserID', getInquiryByUserID);

module.exports = InquiryRouter;


