const connection = require('../Config/db');

// Add a new payment record
const addPayment = (req, res) => {
    const { TripID, Amount, Date, PaymentType } = req.body;

    connection.query(
        'INSERT INTO CustomerPayment (TripID, Amount, Date, PaymentType) VALUES (?, ?, ?, ?)',
        [TripID, Amount, Date, PaymentType],
        (err, result) => {
            if (err) {
                console.error('Error inserting payment:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({ message: 'Payment added successfully' });
        }
    );
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

module.exports = {
    addPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment
};
