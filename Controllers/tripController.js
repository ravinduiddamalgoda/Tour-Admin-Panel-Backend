const connection = require('../Config/db');
const mysql = require('mysql2/promise');

const addTrip = async (req, res) => {
    const { CustomerID, GuideID, Price, StartDate, EndDate, AdultsCount, ChildrenCount, Description, SpecialNotes, TotalDistance } = req.body;

    try {
        // Create a connection pool
        const pool = mysql.createPool({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        });

        // Fetch CustomerID
        const [customerRows] = await pool.query('SELECT CustomerID FROM Customer WHERE UserID = ?', [CustomerID]);
        if (customerRows.length === 0) {
            return res.status(400).json({ message: 'Customer not found' });
        }
        const CusID = customerRows[0].CustomerID;

        // Fetch GuideID
        const [guideRows] = await pool.query('SELECT GuideID FROM Guide WHERE UserID = ?', [GuideID]);
        if (guideRows.length === 0) {
            return res.status(400).json({ message: 'Guide not found' });
        }
        const GuidID = guideRows[0].GuideID;

        // Insert trip data
        const Status = "Pending";
        const query = 'INSERT INTO Trip (CustomerID, GuideID, Price, StartDate, EndDate, AdultsCount, ChildrenCount, Description, Status, SpecialNotes, TotalDistance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [CusID, GuidID, Price, StartDate, EndDate, AdultsCount, ChildrenCount, Description, Status, SpecialNotes, TotalDistance]);

        console.log("Trip added successfully");
        res.send("Trip added successfully");

        // Close the connection pool
        await pool.end();
    } catch (error) {
        console.error('Error querying MySQL database:', error);
        res.status(500).send('Internal DB Error');
    }
}


const getLastTripID = () => {
    connection.query('SELECT * FROM Trip ORDER BY TripID DESC LIMIT 1', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        return rows[0].TripID;
    });
}

const getAllTrips = (req, res) => {
    connection.query('SELECT * FROM Trip', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows);
    });
}

const deleteTrip = (req, res) => {
    const { TripID } = req.params;
    const query = 'DELETE FROM Trip WHERE TripID = ?';
    connection.query(query, [TripID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Trip deleted successfully");
    });
}

const getTripByID = (req, res) => {
    const { TripID } = req.params;
    const query = 'SELECT * FROM Trip WHERE TripID = ?';
    connection.query(query, [TripID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows[0]);
    });
}

const getTripByGuideID = (req, res) => {
    let GuideID = req.params.GuideID;
    const UserQuery = 'SELECT GuideID FROM Guide WHERE UserID = ?';
    connection.query(UserQuery, [GuideID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        GuideID = rows[0].GuideID;
        const query = 'SELECT * FROM Trip WHERE GuideID = ?';
        connection.query(query, [GuideID], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return;
            }
            res.json(rows);
        });  
    });  
    
}



const getTripByCustomerIDNew = (req, res) => {
    let CustomerID = req.params.CustomerID;
    const UserQuery = 'SELECT * FROM Customer WHERE UserID = ?';
    connection.query(UserQuery, [CustomerID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        CustomerID = rows[0].CustomerID;
        const query = 'SELECT * FROM Trip WHERE CustomerID = ? AND EndDate > CURDATE()';
        connection.query(query, [CustomerID], (err, result) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json(result);
        });  
    });  
};
const getTripByCustomerIDOLD = (req, res) => {
    let CustomerID = req.params.CustomerID;
    const UserQuery = 'SELECT * FROM Customer WHERE UserID = ?';
    connection.query(UserQuery, [CustomerID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        CustomerID = rows[0].CustomerID;
        const query = 'SELECT * FROM Trip WHERE CustomerID = ? AND EndDate < CURDATE()';
        connection.query(query, [CustomerID], (err, result) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json(result);
        });  
    });  
};




module.exports = {
    addTrip,
    getAllTrips,
    deleteTrip,
    getTripByID,
    getTripByGuideID,
    getTripByCustomerIDNew,
    getTripByCustomerIDOLD  
}
