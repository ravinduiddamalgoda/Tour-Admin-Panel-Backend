const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../Config/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { signToken } = require('../services/auth.service');
const { authGuard } = require('../utils/validator');

const router = express.Router();

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    try {

        connection.query('SELECT UserID, Password, role, email,FirstName FROM User WHERE email = ? AND Status = "Active"', [email], async (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length > 0) {
                const hashedPassword = rows[0].Password;

                const result = await bcrypt.compare(password, hashedPassword);

                if (result) {
                    const playload = await signToken(password, hashedPassword, {
                        id: rows[0].UserID,
                        role: rows[0].role,
                        name: rows[0].FirstName,
                        email: rows[0].email
                    });
                    // console.log(playload);
                    // console.log("login done");
                    res.status(200).json(playload);

                } else {
                    res.status(401).json({ error: 'Invalid email or password' });
                }

                // if (result) {
                //     const { role } = rows[0];
                //     res.json({ role });
                // } else {
                //     res.status(401).json({ error: 'Invalid email or password' });
                // }
            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        });
    } catch (err) {
        console.error('Error querying MySQL database:', err);
        // next(err);
    }
});

router.get('/current-user', authGuard, (req, res) => {
    const user = req.user;
    try {
        if (!user) {
            return res.status(400).send({ err: 'User not logged in' });
        }
        connection.query('SELECT * FROM User WHERE UserID = ?', [user.id], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length === 1) {
                //const { UserID, Email, Role } = rows[0];
                res.json({ user });
            } else {
                res.status(404).send({ err: 'User not found' });
            }
        });


    } catch (err) {
        res.status(400).send({ err: err });
    }
});

router.post('/search', (req, res) => {
    const { email } = req.body;
    connection.query('SELECT UserID FROM `User` WHERE Email = ? AND Status = ?', [email, 'Active'], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (rows.length === 0) {
            res.status(200).send('Internal Server Error');
        } else {
            res.status(200).json({ user: rows });
        }

    });

});

router.post('/sendotp', async (req, res) => {
    const { value, genotp } = req.body;

    // Function to send email
    function sendEmail(email, subject, body) {
        // Create a transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'vstrapy@gmail.com', // Your Gmail address
                pass: 'fyokbtjwbpvwbnpk' // Your Gmail password
            }
        });

        // Define email options
        let mailOptions = {
            from: 'vstrapy@gmail.com', // Your Gmail address
            to: email,
            subject: subject,
            html: body // Using HTML format for the email body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }

    try {

        const subject = 'Your OTP for Password Reset';
        // HTML body with inline CSS styles
        const body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <p>Your OTP for password reset is: <strong>${genotp}</strong></p>
                        <p>Please do not share this OTP with anyone.</p>
                        <p></p>
                        <p>Thank you,</p>
                        <p>Swen Tours and Travels(Pvt) Ltd.</p>
                    </div>
                `;

        // Send OTP via email
        sendEmail(value, subject, body);
        res.json({ status: 'success', message: 'OTP sent via Email' });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send OTP' });
    }
});

router.post('/resetpass/:userID', async (req, res) => {
    const userID = req.params.userID;
    const { newPassword } = req.body;
    try {

        // Query the database to get the user's current password
        connection.query('SELECT Password FROM User WHERE UserID = ?', [userID], async (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentPassword = rows[0].Password;

            // Compare the current password with the new password
            const passwordsMatch = await bcrypt.compare(newPassword, currentPassword);
            if (passwordsMatch) {
                return res.status(400).json({ message: 'New password cannot be the same as the current password' });
            }

            // Hash the new password
            bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing password:', hashErr);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                // Update the user's password
                connection.query('UPDATE User SET Password = ? WHERE UserID = ?', [hashedPassword, userID], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Error updating password:', updateErr);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    return res.status(200).json({ message: 'Password reset successfully', UserId: userID });
                });
            });
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
