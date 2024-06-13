const connection = require('../Config/db');
const mysql = require('mysql2/promise');
const { sendmail } = require('../services/SendEmail');

const addTrip = async (req, res) => {
    const { CustomerID, GuideID, Price, StartDate, EndDate, AdultsCount, ChildrenCount, Description, SpecialNotes, TotalDistance } = req.body;
    let CustomerEmailAdd = '';
    let GuideEmailAdd = '';

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
        const [CustomerEmailQuery] = await pool.query('SELECT * FROM User WHERE UserID = ?', [CustomerID]);
        CustomerEmailAdd = CustomerEmailQuery[0].Email;

        const [GuideEmailQuery] = await pool.query('SELECT * FROM User WHERE UserID = ?', [GuideID]);
        GuideEmailAdd = GuideEmailQuery[0].Email;

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
        sendmail(CustomerEmailAdd, "Trip Added", "Your trip has been added successfully");
        sendmail(GuideEmailAdd, "New Trip", "You have a new trip to guide");
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

const getTripByGuideIDCustomer = (req, res) => {
    let GuideID = req.params.GuideID;
    const UserQuery = 'SELECT GuideID FROM Guide WHERE UserID = ?';

    connection.query(UserQuery, [GuideID], (err, guideRows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (guideRows.length === 0) {
            return res.status(404).json({ error: 'Guide not found' });
        }

        GuideID = guideRows[0].GuideID;

        const query = `
            SELECT 
                Trip.*,
                User.FirstName,
                User.LastName,
                User.Email,
                User.PhoneNumber,
                Customer.Country
            FROM 
                Trip
            JOIN 
                Customer ON Trip.CustomerID = Customer.CustomerID
            JOIN 
                User ON Customer.UserID = User.UserID
            WHERE 
                Trip.GuideID = ?`;

        connection.query(query, [GuideID], (err, tripRows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            res.json(tripRows);
        });
    });
};




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

const getOngoingTrips = (req, res) => {
    const query = 'SELECT * FROM Trip WHERE Status != "Completed"';
    connection.query(query, (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(rows);
    });
};

const getPreviousTrips = (req, res) => {
    const query = 'SELECT * FROM Trip WHERE Status = "Completed"';
    connection.query(query, (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(rows);
    });
};

const updateTripStatus = (req, res) => {
    const { TripID, Status } = req.body;
    const query = 'UPDATE Trip SET Status = ? WHERE TripID = ?';
    connection.query(query, [Status, TripID], (err, result) => {
        if (err) {
            console.error('Error updating MySQL database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Trip status updated successfully' });
    });
};

module.exports = {
    addTrip,
    getAllTrips,
    deleteTrip,
    getTripByID,
    getTripByGuideID,
    getTripByCustomerIDNew,
    getTripByCustomerIDOLD,
    getOngoingTrips,
    getPreviousTrips,
    updateTripStatus,
    getTripByGuideIDCustomer
}
