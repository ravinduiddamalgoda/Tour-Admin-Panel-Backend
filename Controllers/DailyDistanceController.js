const connection = require('../Config/db');

// Add a new daily distance record
const addDailyDistance = (req, res) => {
    const { TripID, Date, StartPlace, EndPlace, Distance } = req.body;

    connection.query(
        'INSERT INTO DailyDistance (TripID, Date, StartPlace, EndPlace, Distance) VALUES (?, ?, ?, ?, ?)',
        [TripID, Date, StartPlace, EndPlace, Distance],
        (err, result) => {
            if (err) {
                console.error('Error inserting daily distance:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({ message: 'Daily distance added successfully' });
        }
    );
};

// Get all daily distance records
const getAllDailyDistances = (req, res) => {
    connection.query('SELECT * FROM DailyDistance', (err, rows) => {
        if (err) {
            console.error('Error querying daily distances:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json(rows);
    });
};

// Get daily distance by DailyDistanceID
const getDailyDistanceById = (req, res) => {
    const { DailyDistanceID } = req.params;

    connection.query('SELECT * FROM DailyDistance WHERE DailyDistanceID = ?', [DailyDistanceID], (err, rows) => {
        if (err) {
            console.error('Error querying daily distance:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (rows.length === 0) {
            return res.status(404).send('Daily distance record not found');
        }
        res.status(200).json(rows[0]);
    });
};

// Update daily distance by DailyDistanceID
const updateDailyDistance = (req, res) => {
    const { DailyDistanceID } = req.params;
    const { TripID, Date, StartPlace, EndPlace, Distance } = req.body;

    connection.query(
        'UPDATE DailyDistance SET TripID = ?, Date = ?, StartPlace = ?, EndPlace = ?, Distance = ? WHERE DailyDistanceID = ?',
        [TripID, Date, StartPlace, EndPlace, Distance, DailyDistanceID],
        (err, result) => {
            if (err) {
                console.error('Error updating daily distance:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Daily distance record not found');
            }
            res.status(200).json({ message: 'Daily distance updated successfully' });
        }
    );
};

// Delete daily distance by DailyDistanceID
const deleteDailyDistance = (req, res) => {
    const { DailyDistanceID } = req.params;

    connection.query('DELETE FROM DailyDistance WHERE DailyDistanceID = ?', [DailyDistanceID], (err, result) => {
        if (err) {
            console.error('Error deleting daily distance:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Daily distance record not found');
        }
        res.status(200).json({ message: 'Daily distance deleted successfully' });
    });
};

// Get daily distances for a specific guide
const getDailyDistancesByGuide = (req, res) => {
    const { GuideID } = req.params;

    connection.query(
        `SELECT dd.*
         FROM DailyDistance dd
         JOIN Trip t ON dd.TripID = t.TripID
         WHERE t.GuideID = ?`,
        [GuideID],
        (err, rows) => {
            if (err) {
                console.error('Error querying daily distances for guide:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).json(rows);
        }
    );
};

module.exports = {
    addDailyDistance,
    getAllDailyDistances,
    getDailyDistanceById,
    updateDailyDistance,
    deleteDailyDistance,
    getDailyDistancesByGuide
};
