const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const cors = require('cors');

const app = express();
const PORT = 3001;

const connection = require('./Config/db');

const UserControllers = require('./Controllers/userController');
const HotelRouter = require('./Routes/Hotel.route');
const AuthControl = require('./Controllers/authController');
const FeedbackRouter = require('./Routes/FeedbackRoute');
const TourPackagesrouter = require('./Routes/TourPackagesRouter');
const GuideAvailabilityRouter = require('./Routes/GuideAvailability.route');
const DailyDistanceRouter = require('./Routes/DailyDistance.route');
const CustomerPaymentRouter = require('./Routes/CustomerPayment.route');
const VehicleRouter = require('./Routes/Vehicle.route');
const TripRouter = require('./Routes/Trip.route');
const InquiryRouter = require('./Routes/Inquiry.route');
const ChatRouter = require('./Routes/Chat.Router');
const guidedocumnet = require('./Controllers/guideDocumentController');



app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT' , 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED') {
        res.status(500).json({ error: 'Database connection refused' });
    } else {
        console.error(err.stack);
        res.status(500).json({ error: err.message || 'Something went wrong!' });
    }
});

app.use('/packageimages', express.static(path.join(__dirname, '/PackageImages')));
app.use('/ChatFiles', express.static(path.join(__dirname, '/ChatFiles')));
// app.use(express.static(path.join(__dirname, '/ChatFiles')));
app.use('/guideuploads', express.static(path.join(__dirname, '/guideuploads')));

app.use('/user', UserControllers);
app.use('/hotel', HotelRouter);
app.use('/auth', AuthControl);
app.use('/feedback', FeedbackRouter);
app.use('/tourPackages', TourPackagesrouter);
app.use('/guideAvailability', GuideAvailabilityRouter);
app.use('/dailyDistance', DailyDistanceRouter);
app.use('/customerPayment' , CustomerPaymentRouter);
app.use('/vehicle', VehicleRouter);
app.use('/trip' , TripRouter);
app.use('/inquiry', InquiryRouter);
app.use('/chat', ChatRouter);
app.use('/guide',guidedocumnet);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



