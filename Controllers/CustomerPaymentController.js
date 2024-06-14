const connection = require('../Config/db');
const { sendMailWithAttachment } = require('../services/SendEmail');

// Add a new payment record
const addPayment = (req, res) => {
    const { TripID, Amount, Date, PaymentType, TransactionNo } = req.body;
    const file = req.file ? req.file.path : '';
    console.log(file);
    let email = '';
    const CustomerIDQuery = 'SELECT CustomerID FROM Trip WHERE TripID = ?';
    connection.query(CustomerIDQuery, [TripID], (err, rows) => {
        if (err) {
            console.error('Error querying customer:', err);
            return;
        }
        const CustomerID = rows[0].CustomerID;
        const EmailQuery = 'SELECT UserID FROM Customer WHERE CustomerID = ?';
        connection.query(EmailQuery, [CustomerID], (err, rows) => {
            if (err) {
                console.error('Error querying email:', err);
                return;
            }
            const UserID = rows[0].UserID;
            const EmailQuery = 'SELECT Email FROM User WHERE UserID = ?';
            connection.query(EmailQuery, [UserID], (err, rows) => {
                if (err) {
                    console.error('Error querying email:', err);
                    return;
                }
                email = rows[0].Email;
                console.log(rows[0].Email);
                sendMailWithAttachment(rows[0].Email, 'Payment Receipt', 'Thank you for your payment', file);
                connection.query(
                    'INSERT INTO CustomerPayment (TripID, Amount, Date, PaymentType, TransactionNo) VALUES (?, ?, ?, ?, ?)',
                    [TripID, Amount, Date, PaymentType, TransactionNo],
                    (err, result) => {
                        if (err) {
                            console.error('Error inserting payment:', err);
                            return res.status(500).send('Internal Server Error');
                        }

                        // Update Trip status based on PaymentType
                        let newStatus = '';
                        if (PaymentType === 'Advance') {
                            newStatus = 'Pending';
                        } else if (PaymentType === 'Full') {
                            newStatus = 'Active';
                        } else if (PaymentType === 'Balance') {
                            // Check if total payments for the trip are >= trip price
                            const TotalPaymentsQuery = `
                                SELECT SUM(Amount) AS TotalPayments
                                FROM CustomerPayment
                                WHERE TripID = ?
                            `;
                            connection.query(TotalPaymentsQuery, [TripID], (err, rows) => {
                                if (err) {
                                    console.error('Error querying total payments:', err);
                                    return res.status(500).send('Internal Server Error');
                                }
                                const TotalPayments = rows[0].TotalPayments;
                                const TripPriceQuery = 'SELECT Price FROM Trip WHERE TripID = ?';
                                connection.query(TripPriceQuery, [TripID], (err, rows) => {
                                    if (err) {
                                        console.error('Error querying trip price:', err);
                                        return res.status(500).send('Internal Server Error');
                                    }
                                    const TripPrice = rows[0].Price;
                                    if (TotalPayments >= TripPrice) {
                                        newStatus = 'Active';
                                    }
                                    if (newStatus) {
                                        connection.query(
                                            'UPDATE Trip SET Status = ? WHERE TripID = ?',
                                            [newStatus, TripID],
                                            (err, result) => {
                                                if (err) {
                                                    console.error('Error updating trip status:', err);
                                                    return res.status(500).send('Internal Server Error');
                                                }
                                                res.status(201).json({ message: 'Payment added and trip status updated successfully' });
                                            }
                                        );
                                    } else {
                                        res.status(201).json({ message: 'Payment added successfully' });
                                    }
                                });
                            });
                        } else {
                            res.status(201).json({ message: 'Payment added successfully' });
                        }
                    }
                );
            });
        });
    });
};


function getEmailInTrip (TripID)  {
    const CustomerIDQuery = 'SELECT CustomerID FROM Trip WHERE TripID = ?';
    connection.query(CustomerIDQuery, [TripID], (err, rows) => {
        if (err) {
            console.error('Error querying customer:', err);
            return;
        }
        const CustomerID = rows[0].CustomerID;
        // console.log(CustomerID)
        const EmailQuery = 'SELECT UserID FROM Customer WHERE CustomerID = ?';
        connection.query(EmailQuery, [CustomerID], (err, rows) => {
            if (err) {
                console.error('Error querying email:', err);
                return;
            }
            const UserID =  rows[0].UserID;
            // console.log(UserID)
            const EmailQuery = 'SELECT Email FROM User WHERE UserID = ?';
            connection.query(EmailQuery, [UserID], (err, rows) => {
                if (err) {
                    console.error('Error querying email:', err);
                    return;
                }
                // console.log(rows[0].Email)
                return rows[0].Email;
            });
        });
    }); 
}

const getTtalPaymentByTripID = (req, res) => {
    const { TripID } = req.params;

    connection.query('SELECT SUM(Amount) as TotalPayment FROM CustomerPayment WHERE TripID = ?', [TripID], (err, rows) => {
        if (err) {
            console.error('Error querying payment:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (rows.length === 0) {
            return res.status(200).send('Payment record not found');
        }
        res.status(200).json(rows[0]);
    });
};


// Get all payment records
const getAllPayments = (req, res) => {
    connection.query('SELECT * FROM CustomerPayment', (err, rows) => {
        if (err) {
            console.error('Error querying payments:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json(rows);
    });
};

// Get payment by PaymentID
const getPaymentById = (req, res) => {
    const { PaymentID } = req.params;

    connection.query('SELECT * FROM CustomerPayment WHERE PaymentID = ?', [PaymentID], (err, rows) => {
        if (err) {
            console.error('Error querying payment:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (rows.length === 0) {
            return res.status(404).send('Payment record not found');
        }
        res.status(200).json(rows[0]);
    });
};

// Update payment by PaymentID
const updatePayment = (req, res) => {
    const { PaymentID } = req.params;
    const { TripID, Amount, Date, PaymentType } = req.body;

    connection.query(
        'UPDATE CustomerPayment SET TripID = ?, Amount = ?, Date = ?, PaymentType = ? WHERE PaymentID = ?',
        [TripID, Amount, Date, PaymentType, PaymentID],
        (err, result) => {
            if (err) {
                console.error('Error updating payment:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Payment record not found');
            }
            res.status(200).json({ message: 'Payment updated successfully' });
        }
    );
};

// Delete payment by PaymentID
const deletePayment = (req, res) => {
    const { PaymentID } = req.params;

    connection.query('DELETE FROM CustomerPayment WHERE PaymentID = ?', [PaymentID], (err, result) => {
        if (err) {
            console.error('Error deleting payment:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Payment record not found');
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    });
};

const getPaymentByCustomerID = (req, res) => {
    const { UserID } = req.params;
    console.log(UserID);
    // Step 1: Get CustomerID using UserID
    connection.query('SELECT * FROM Customer WHERE UserID = ?', [UserID], (err, customerRows) => {
        if (err) {
            console.error('Error querying customer:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (customerRows.length === 0) {
            return res.status(404).send('Customer not found');
        }
        const CustomerID = customerRows[0].CustomerID;

        // Step 2: Get TripIDs using CustomerID
        connection.query('SELECT TripID FROM Trip WHERE CustomerID = ?', [CustomerID], (err, tripRows) => {
            if (err) {
                console.error('Error querying trips:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (tripRows.length === 0) {
                return res.status(404).send('No trips found for this customer');
            }

            const tripIDs = tripRows.map(trip => trip.TripID);
            console.log(tripIDs);
            // Step 3: Get Payments using TripIDs
            connection.query('SELECT * FROM CustomerPayment WHERE TripID IN (?)', [tripIDs], (err, paymentRows) => {
                if (err) {
                    console.error('Error querying payments:', err);
                    return res.status(500).send('Internal Server Error');
                }
                if (paymentRows.length === 0) {
                    return res.status(404).send('No payments found for these trips');
                }

                res.status(200).json(paymentRows);
            });
        });
    });
};


module.exports = {
    addPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getTtalPaymentByTripID,
    getPaymentByCustomerID
};
