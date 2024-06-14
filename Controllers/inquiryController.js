const connection = require('../Config/db');
const bcrypt = require('bcrypt');
const { sendmail } = require('../services/SendEmail');

const addInquiry = (req, res) => {
    const { arrivalDate, departureDate, message, numAdults, numChildren, email, mobile, firstName, lastName, country } = req.body;

    let ChildrenCount;
    if (numChildren === '') {
        ChildrenCount = 0;
    } else {
        ChildrenCount = numChildren;
    }

    const UserQuery = 'SELECT * FROM User WHERE email = ?';
    connection.query(UserQuery, [email], (err, userRows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (userRows.length === 0) {
            res.status(200).send("Customer does not exist");
            return;
        }

        const CustomerQuery = 'SELECT CustomerID FROM Customer WHERE UserID = ?';
        connection.query(CustomerQuery, [userRows[0].UserID], (err, customerRows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send("Internal Server Error");
                return;
            }

            const InquiryDate = new Date().toISOString().split('T')[0];
            const Status = 'Pending';
            const CustomerID = customerRows[0].CustomerID;

            const InquiryQuery = 'INSERT INTO Inquiry (InquiryDate, ArrivalDate, DepartureDate, Message, AdultsCount, ChildrenCount, Status, CustomerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            connection.query(InquiryQuery, [InquiryDate, arrivalDate, departureDate, message, numAdults, ChildrenCount, Status, CustomerID], (err, result) => {
                if (err) {
                    console.error('Error querying MySQL database:', err);
                    res.status(500).send("Internal Server Error");
                    return;
                }

                const InquiryID = result.insertId;
                const ChatSessionQuery = 'INSERT INTO ChatSession (InquiryID, CustomerID, Status, CreatedDate) VALUES (?, ?, ?, NOW())';
                connection.query(ChatSessionQuery, [InquiryID, CustomerID, 'Active'], (err, result) => {
                    if (err) {
                        console.error('Error creating chat session:', err);
                        res.status(500).send("Internal Server Error");
                        return;
                    }

                    res.status(201).send("Inquiry and chat session added successfully");
                });
            });
        });
    });
}




const addInquiryNewUser = (req, res) => {
    const { arrivalDate, departureDate, message, numAdults, numChildren, email, mobile, firstName, lastName, country, password } = req.body;

    const AddUserQuery = 'INSERT INTO User(Email, Password, FirstName, LastName, PhoneNumber, Role) VALUES (?, ?, ?, ?, ?, ?)';
    const CustomerQuery = 'INSERT INTO Customer(UserID, Country) VALUES (?, ?)';
    const InquiryQuery = 'INSERT INTO Inquiry(InquiryDate, ArrivalDate, DepartureDate, Message, AdultsCount, ChildrenCount, Status, CustomerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const ChatSessionQuery = 'INSERT INTO ChatSession (InquiryID, CustomerID, Status, CreatedDate) VALUES (?, ?, ?, NOW())';

    let ChildrenCount;
    if (numChildren === '') {
        ChildrenCount = 0;
    } else {
        ChildrenCount = numChildren;
    }

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

                connection.query(InquiryQuery, [inquiryDate, arrivalDate, departureDate, message, numAdults, ChildrenCount, status, customerId], (err, result) => {
                    if (err) {
                        console.error('Error querying MySQL database:', err);
                        res.status(400).send("Error adding inquiry");
                        return;
                    }

                    const inquiryId = result.insertId;

                    // Create ChatSession after Inquiry is added
                    connection.query(ChatSessionQuery, [inquiryId, customerId, 'Active'], (err, result) => {
                        if (err) {
                            console.error('Error creating chat session:', err);
                            res.status(400).send("Error creating chat session");
                            return;
                        }

                        res.status(201).send("Inquiry and chat session added successfully");
                    });
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
    connection.query('SELECT * FROM Inquiry WHERE Status != "cancel"', (err, rows) => {
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

const updateInquiryStatus = (req, res) => {
    const { InquiryID } = req.params;
    const { Status } = req.body;
    const query = 'UPDATE Inquiry SET Status = ? WHERE InquiryID = ?';
    connection.query(query, [Status, InquiryID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Inquiry status updated successfully");
    });
}  

const getInquiryByUserID = (req, res) => {
    const { UserID } = req.params;
    const query = 'SELECT CustomerID FROM Customer WHERE UserID = ?';
    connection.query(query, [UserID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        const CustomerID = rows[0].CustomerID;
        const InquiryQuery = 'SELECT * FROM Inquiry WHERE CustomerID = ?';
        connection.query(InquiryQuery, [CustomerID], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return;
            }
            res.json(rows);
        });
    });
};
module.exports = {
    addInquiry,
    getAllInquiries,
    deleteInquiry,
    getInquiryByID,
    addInquiryNewUser,
    updateInquiryStatus,
    getInquiryByUserID
} 
