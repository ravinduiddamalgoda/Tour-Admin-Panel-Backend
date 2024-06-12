const connection = require('../Config/db');
const bcrypt = require('bcrypt');
const { sendmail } = require('../services/SendEmail');

const addInquiry = (req, res) => {
    const { arrivalDate, departureDate, message, numAdults, numChildren: rawNumChildren, email, mobile, firstName, lastName, country } = req.body;

    const numChildren = rawNumChildren === "" ? null : rawNumChildren;

    const UserQuery = 'SELECT * FROM User WHERE email = ?';
    connection.query(UserQuery, [email], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        if (rows.length === 0) {
            res.send("Customer does not exist");
            return;
        }


        const CustomerQuery = 'SELECT CustomerID FROM Customer WHERE UserID = ?';
        connection.query(CustomerQuery, [rows[0].UserID], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return;
            }
            const InquiryDate = new Date().toISOString().split('T')[0];
            const Status = 'Pending';
            const CustomerID = rows[0].CustomerID;

            const query = 'INSERT INTO Inquiry( InquiryDate, ArrivalDate, DepartureDate, Message, AdultsCount, ChildrenCount, Status, CustomerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

            connection.query(query, [InquiryDate, arrivalDate, departureDate, message, numAdults, numChildren, Status, CustomerID], (err, result) => {
                if (err) {
                    console.error('Error querying MySQL database:', err);
                    return;
                }
                res.send("Inquiry added successfully");
            });
        });
    });
}



const addInquiryNewUser = (req, res) => {
    const { arrivalDate, departureDate, message, numAdults, numChildren, email, mobile, firstName, lastName, country, password } = req.body;

    const AddUserQuery = 'INSERT INTO User(Email, Password, FirstName, LastName, PhoneNumber, Role) VALUES (?, ?, ?, ?, ?, ?)';
    const CustomerQuery = 'INSERT INTO Customer(UserID, Country) VALUES (?, ?)';
    const InquiryQuery = 'INSERT INTO Inquiry(InquiryDate, ArrivalDate, DepartureDate, Message, AdultsCount, ChildrenCount, Status, CustomerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send("Internal server error");
            return;
        }

        connection.query(AddUserQuery, [email, hash, firstName, lastName, mobile, 'Customer'], (err, result) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(400).send("Error adding user");
                return;
            }

            const userId = result.insertId;
            connection.query(CustomerQuery, [userId, country], (err, result) => {
                if (err) {
                    console.error('Error querying MySQL database:', err);
                    res.status(400).send("Error adding customer");
                    return;
                }
                const currentURL = 'http://localhost:3000';
                const loginURL = currentURL + '/login';
                sendmail(email, "Welcome to SWEN Tours & Travels (Pvt) Ltd.", `Thank you for registering with SWEN Tours. We look forward to serving you.\nYou can Login to your dashboard and chat with our Customer Assistant.\n\n${loginURL}`);
                const customerId = result.insertId;
                const inquiryDate = new Date().toISOString().split('T')[0];
                const status = 'Pending';

                connection.query(InquiryQuery, [inquiryDate, arrivalDate, departureDate, message, numAdults, numChildren, status, customerId], (err, result) => {
                    if (err) {
                        console.error('Error querying MySQL database:', err);
                        res.status(400).send("Error adding inquiry");
                        return;
                    }
                    res.status(201).send("Inquiry added successfully");
                });
            });
        });
    });
};

const getLastInquiryID = () => {
    connection.query('SELECT * FROM Inquiry ORDER BY InquiryID DESC LIMIT 1', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        return rows[0].InquiryID;
    });
}

const getAllInquiries = (req, res) => {
    connection.query('SELECT * FROM Inquiry', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows);
    });
}

const deleteInquiry = (req, res) => {
    const { InquiryID } = req.params;
    const query = 'DELETE FROM Inquiry WHERE InquiryID = ?';
    connection.query(query, [InquiryID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Inquiry deleted successfully");
    });
}

const getInquiryByID = (req, res) => {
    const { InquiryID } = req.params;
    const query = 'SELECT * FROM Inquiry WHERE InquiryID = ?';
    connection.query(query, [InquiryID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows[0]);
    });
}

module.exports = {
    addInquiry,
    getAllInquiries,
    deleteInquiry,
    getInquiryByID,
    addInquiryNewUser
}
