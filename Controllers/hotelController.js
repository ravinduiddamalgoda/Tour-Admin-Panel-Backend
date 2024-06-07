const connection = require('../Config/db');

const addHotel = (req, res) => {
    const { Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email } = req.body;
    const query = 'INSERT INTO Hotel (Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            res.status(500).send('Internal DB Error');
            return;
        }
        res.send("Hotel added successfully");
    });
}

const getLastHotelID = () => {
    connection.query('SELECT * FROM Hotel ORDER BY HotelID DESC LIMIT 1', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        return rows[0].HotelID;
    });
}

const getALLHotels = (req, res) => {
    connection.query('SELECT * FROM Hotel', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).send('Internal DB Error');
        }
        res.json(rows);
    });
}

const deleteHotel = (req, res) => {
    const { HotelID } = req.params;
    const query = 'DELETE FROM Hotel WHERE HotelID = ?';
    connection.query(query, [HotelID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Hotel deleted successfully");
    });
}

const getHotelByID = (req, res) => {
    const { HotelID } = req.params;
    const query = 'SELECT * FROM Hotel WHERE HotelID = ?';
    connection.query(query, [HotelID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows[0]);
    });
}

const updateHotel = (req, res) => {
    const { Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email } = req.body;
    const { HotelID } = req.params;
    const query = 'UPDATE Hotel SET Name = ?, Hotype = ?, PhoneNumber = ?, HotDesc = ?, Packages = ?, Address = ?, Email = ? WHERE HotelID = ?';
    connection.query(query, [Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email, HotelID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Hotel updated successfully");
    });
}

module.exports = {
    addHotel,
    getALLHotels,
    deleteHotel,
    getHotelByID,
    updateHotel
}