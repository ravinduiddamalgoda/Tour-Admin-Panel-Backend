const express = require('express');
const multer = require('multer');
const path = require('path');
const { signToken } = require('../services/auth.service');
const { authGuard } = require('../utils/validator');
const connection = require('../Config/db');
const fs = require('fs');
const router = express.Router();

const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { TripID } = req.body;

        if (!TripID) {
            return cb(new Error('TripID is required'), null);
        }

        const baseDir = 'guideuploads/';
        const tripDir = path.join(baseDir, TripID);

        // Ensure directories exist
        ensureDirExists(baseDir);
        ensureDirExists(tripDir);

        cb(null, tripDir);
    },
    filename: (req, file, cb) => {
        const { TripID } = req.body;
        cb(null, TripID + Date.now() + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const { GuideID, TripID } = req.body;
        const files = req.files;

        if (!GuideID || !TripID) {
            return res.status(400).send('GuideID and TripID are required');
        }




        const insertPromises = files.map(async (file) => {
            const Url = `${req.protocol}://${req.get('host')}/${file.path}`;
            const document = {
                GuideID,
                TripID,
                DocumentType: 'Bills',
                DocumentFile: Url, // Path of the uploaded file
                UploadDate: new Date(),
            };
            await connection.query('INSERT INTO GuideDocument SET ?', document);
        });

        await Promise.all(insertPromises);

        res.send('Files uploaded and data saved successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

// Get uploaded files for a TripID
router.get('/files/:TripID', async (req, res) => {
    const TripID = req.params.TripID;
    const tripDir = path.join('guideuploads', TripID);

    if (!fs.existsSync(tripDir)) {
        return res.status(404).send('No files found for this TripID');
    }

    fs.readdir(tripDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }

        const fileUrls = files.map(file => {
            const filePath = path.join(tripDir, file);
            return {
                name: file,
                url: `${req.protocol}://${req.get('host')}/${filePath}`
            };
        });

        res.json(fileUrls);
    });
});

// Delete a specific file
router.delete('/files/:TripID/:filename', async (req, res) => {
    const { TripID, filename } = req.params;
    const filePath = path.join('guideuploads', TripID, filename);
    const file = `${req.protocol}://${req.get('host')}/${filePath}`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    fs.unlink(filePath, async (err) => { // mark the callback as async
        if (err) {
            return res.status(500).send('Error deleting file');
        }

        // Remove the database entry
        try {
            await connection.query('DELETE FROM GuideDocument WHERE TripID = ? AND DocumentFile = ?', [TripID, file]);
            res.send('File deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error deleting file from database');
        }
    });
});


router.get('/getGuideId/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        connection.query('SELECT GuideID FROM Guide WHERE UserID = ?', [userId], (err, rows) => {
            if (err) {
                console.error('Guide not found for this user id:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).json(rows);
        });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/daily-distances', (req, res) => {
    const { TripID, selectedDay, StartPlace, EndPlace, Distance } = req.body;

    const selectedDate = new Date(selectedDay);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns zero-based month index
    const day = String(selectedDate.getDate() + 1).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;


    const query = 'INSERT INTO DailyDistance (TripID, Date, StartPlace, EndPlace, Distance) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [TripID, formattedDate, JSON.stringify(StartPlace), JSON.stringify(EndPlace), Distance], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(201).send(results);
        }
    });
});

router.get('/track-points', (req, res) => {
    const selectedDay = req.query.selectedDay;
    const TripID = req.query.TripID;
    const dateObject = new Date(selectedDay);

    // Increase the date by one day
    dateObject.setDate(dateObject.getDate() + 1);

    // Format the date as "YYYY-MM-DD"
    const formattedDate = dateObject.toISOString().slice(0, 10);

    // Construct SQL query to fetch track points data based on selected day
    const query = `SELECT * FROM DailyDistance WHERE Date = ? AND TripID=? ORDER BY DailyDistanceID`;

    // Execute SQL query with selectedDay as parameter
    connection.query(query, [formattedDate,TripID], (err, results) => {
        if (err) {
            console.error('Error fetching track points:', err);
            res.status(500).json({ error: 'Failed to fetch track points data' });
            return;
        }

        res.json(results);
    });
});


router.delete('/daily-distances/:id', (req, res) => {
    const dailyDistanceIndex = req.params.id;
    const selectedDay = req.body.selectedDay;
    const TripID = req.body.TripID;
    

    const dateObject = new Date(selectedDay);
    dateObject.setDate(dateObject.getDate() + 1);
    const formattedDate = dateObject.toISOString().slice(0, 10);

    // Execute the SELECT SQL statement to get the DailyDistanceID for the selected date and trip
    const selectSql = 'SELECT DailyDistanceID FROM DailyDistance WHERE Date = ? AND TripID=? ORDER BY DailyDistanceID';
    connection.query(selectSql, [formattedDate, TripID], (err, results) => {
        if (err) {
            console.error('Error selecting DailyDistanceID:', err);
            res.sendStatus(500); // Send an error response
            return;
        }

        // Extract the DailyDistanceID from the results
        const dailyDistanceIds = results.map(result => result.DailyDistanceID);

        // Find the index of the provided dailyDistanceIndex within the array of selected IDs
        const index = parseInt(dailyDistanceIndex);
        if (index < 0 || index >= dailyDistanceIds.length) {
            console.error('Invalid DailyDistance index for the selected date');
            res.sendStatus(404); // Send a not found response
            return;
        }

        // Get the corresponding DailyDistanceID from the array
        const dailyDistanceId = dailyDistanceIds[index];

        // Execute the DELETE SQL statement to delete the record
        const deleteSql = 'DELETE FROM DailyDistance WHERE DailyDistanceID = ? AND Date = ?';
        connection.query(deleteSql, [dailyDistanceId, formattedDate], (err, result) => {
            if (err) {
                console.error('Error deleting DailyDistance record:', err);
                res.sendStatus(500); // Send an error response
                return;
            }

            console.log('DailyDistance record deleted successfully');
            res.sendStatus(204); // Send a success response
        });
    });
});

router.get('/total-distance', (req, res) => {
    const { tripId } = req.query;

    // Query the database to retrieve data for the trip
    const sql = 'SELECT SUM(distance) AS totalDistance FROM DailyDistance WHERE TripID = ?';
    connection.query(sql, [tripId], (err, results) => {
        if (err) {
            console.error('Error fetching total distance:', err);
            res.status(500).json({ error: 'Failed to fetch total distance' });
            return;
        }

        // Extract the total distance from the query results
        const totalDistance = results[0].totalDistance || 0;

        // Send the total distance as a response
        res.json({ totalDistance });
    });
});




module.exports = router;
