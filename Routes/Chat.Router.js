const express = require('express');
const ChatRouter = express.Router();
const { getChatByInquiry , sendMessageByInquiry , sendFileByInquiry } = require('../Controllers/chatController');
const {upload} = require('../utils/upload');



ChatRouter.get('/getChatByInquiry/:InquiryID', getChatByInquiry);
ChatRouter.post('/sendMessageByInquiry/:InquiryID', sendMessageByInquiry);
ChatRouter.post('/sendFileByInquiry/:InquiryID',upload.single('file') ,sendFileByInquiry);

module.exports = ChatRouter; 