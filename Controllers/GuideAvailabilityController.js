const connection = require('../Config/db');

// Add a new availability record
const addAvailability = (req, res) => {
    const { GuideID, StartDate, EndDate } = req.body;

    connection.query(
        'INSERT INTO GuideAvailability (GuideID, StartDate, EndDate) VALUES (?, ?, ?)',
        [GuideID, StartDate, EndDate],
        (err, result) => {
            if (err) {
                console.error('Error inserting availability:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({ message: 'Availability added successfully' });
        }
    );
};

// Get all availability records
const getAllAvailability = (req, res) => {
    connection.query('SELECT * FROM GuideAvailability', (err, rows) => {
        if (err) {
            console.error('Error querying availability:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json(rows);
    });
};

// Get availability by AvailabilityID
const getAvailabilityById = (req, res) => {
    const { AvailabilityID } = req.params;

    connection.query('SELECT * FROM GuideAvailability WHERE AvailabilityID = ?', [AvailabilityID], (err, rows) => {
        if (err) {
            console.error('Error querying availability:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (rows.length === 0) {
            return res.status(404).send('Availability record not found');
        }
        res.status(200).json(rows[0]);
    });
};

// Update availability by AvailabilityID
const updateAvailability = (req, res) => {
    const { AvailabilityID } = req.params;
    const { GuideID, StartDate, EndDate } = req.body;

    connection.query(
        'UPDATE GuideAvailability SET GuideID = ?, StartDate = ?, EndDate = ? WHERE AvailabilityID = ?',
        [GuideID, StartDate, EndDate, AvailabilityID],
        (err, result) => {
            if (err) {
                console.error('Error updating availability:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Availability record not found');
            }
            res.status(200).json({ message: 'Availability updated successfully' });
        }
    );
};

// Delete availability by AvailabilityID
const deleteAvailability = (req, res) => {
    const { AvailabilityID } = req.params;

    connection.query('DELETE FROM GuideAvailability WHERE AvailabilityID = ?', [AvailabilityID], (err, result) => {
        if (err) {
            console.error('Error deleting availability:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Availability record not found');
        }
        res.status(200).json({ message: 'Availability deleted successfully' });
    });
};

module.exports = {
    addAvailability,
    getAllAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
};
