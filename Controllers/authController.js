const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../Config/db');
const bcrypt = require('bcrypt');
const { signToken } = require('../services/auth.service');
const { authGuard } = require('../utils/validator');

const router = express.Router();

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    try {

        connection.query('SELECT UserID, Password, role, email FROM User WHERE email = ?', [email], async (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

        if (rows.length > 0) {
            const hashedPassword = rows[0].Password;

            const result = await bcrypt.compare(password, hashedPassword);
            
            if(result){
               const playload = await signToken(password , hashedPassword, {
                    id: rows[0].UserID , 
                    role:rows[0].role, 
                    email:rows[0].email});
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
        // console.log(user)
        connection.query('SELECT * FROM User WHERE UserID = ?', [user.id], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length === 1) {
                const { UserID, Email, Role } = rows[0];
                res.json({ user});
            } else {
                res.status(404).send({ err: 'User not found' });
            }
        });

        
    } catch (err) {
        res.status(400).send({ err: err });
    }
});

module.exports = router;
