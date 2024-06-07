const connection = require('../Config/db');

// Middleware to get current user
const getCurrentUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    req.senderId = req.user.UserID;
    next();
};

// Add feedback
const addFeedback = (req, res) => {
    const { UserID ,TripID, Rating, Comment, Status } = req.body;
    // const SenderID = req.senderId;
    const Date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    connection.query(
        'INSERT INTO Feedback (SenderID, TripID, Rating, Comment, Date, Status) VALUES (?, ?, ?, ?, ?, ?)',
        [UserID, TripID, Rating, Comment, Date, Status],
        (err, result) => {
            if (err) {
                console.error('Error inserting feedback:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({ message: 'Feedback added successfully' });
        }
    );
};

// Get all feedbacks
const getAllFeedback = (req, res) => {
    connection.query('SELECT * FROM Feedback', (err, rows) => {
        if (err) {
            console.error('Error querying feedback:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json(rows);
    });
};

// Get feedback by FeedbackID
const getFeedbackById = (req, res) => {
    const { FeedbackID } = req.params;
    connection.query('SELECT * FROM Feedback WHERE FeedbackID = ?', [FeedbackID], (err, rows) => {
        if (err) {
            console.error('Error querying feedback:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (rows.length === 0) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).json(rows[0]);
    });
};

// Delete feedback by FeedbackID
const deleteFeedback = (req, res) => {
    const { FeedbackID } = req.params;
    const SenderID = req.senderId;

    // Check if feedback exists and belongs to the current user
    connection.query('SELECT * FROM Feedback WHERE FeedbackID = ? AND SenderID = ?', [FeedbackID, SenderID], (err, rows) => {
        if (err) {
            console.error('Error querying feedback:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (rows.length === 0) {
            return res.status(404).send('Feedback not found or unauthorized');
        }

        connection.query('DELETE FROM Feedback WHERE FeedbackID = ?', [FeedbackID], (err, result) => {
            if (err) {
                console.error('Error deleting feedback:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).json({ message: 'Feedback deleted successfully' });
        });
    });
};

module.exports = {
    getCurrentUser,
    addFeedback,
    getAllFeedback,
    getFeedbackById,
    deleteFeedback
};
