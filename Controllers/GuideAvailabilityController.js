const connection = require('../Config/db');

// Add a new availability record
// const addAvailability = (req, res) => {
//     const { GuideID, StartDate, EndDate } = req.body;

//     const query = `
//         INSERT INTO GuideAvailability (GuideID, StartDate, EndDate)
//         VALUES (?, ?, ?)
//         ON DUPLICATE KEY UPDATE
//         StartDate = VALUES(StartDate), EndDate = VALUES(EndDate)
//     `;

//     connection.query(query, [GuideID, StartDate, EndDate], (err, result) => {
//         if (err) {
//             console.error('Error inserting or updating availability:', err);
//             return res.status(500).send('Internal Server Error');
//         }
//         res.status(201).json({ message: 'Availability Updated successfully' });
//     });
// };


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
    const { GuideID } = req.params;

    connection.query('SELECT DATE_FORMAT(StartDate, "%Y-%m-%d") AS StartDate, DATE_FORMAT(EndDate, "%Y-%m-%d") AS EndDate FROM Guide WHERE GuideID = ?', [GuideID], (err, rows) => {
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
    const { GuideID } = req.params;
    const { StartDate, EndDate } = req.body;

    const formatDate = (dateString) => {
        if (!dateString) return null; // Return null if dateString is null or undefined
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
     const formattedStartDate = formatDate(StartDate);
     const formattedEndDate = formatDate(EndDate);

    connection.query(
        'UPDATE Guide SET StartDate = ?, EndDate = ? WHERE GuideID = ?',
        [formattedStartDate, formattedEndDate, GuideID],
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
// const deleteAvailability = (req, res) => {
//     const { AvailabilityID } = req.params;

//     connection.query('DELETE FROM GuideAvailability WHERE AvailabilityID = ?', [AvailabilityID], (err, result) => {
//         if (err) {
//             console.error('Error deleting availability:', err);
//             return res.status(500).send('Internal Server Error');
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).send('Availability record not found');
//         }
//         res.status(200).json({ message: 'Availability deleted successfully' });
//     });
// };

module.exports = {
    //addAvailability,
    getAllAvailability,
    getAvailabilityById,
    updateAvailability,
    //deleteAvailability
};
