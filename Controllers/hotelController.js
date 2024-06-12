const connection = require('../Config/db');

const addHotel = (req, res) => {
    const { Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email } = req.body;
    const query = 'INSERT INTO Hotel (Name, HotType, PhoneNumber, HotDesc, Packages, Address, Email, Status) VALUES (?, ?, ?, ?, ?, ?, ?, "Active")';
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
    connection.query('SELECT * FROM Hotel WHERE status = "Active"', (err, rows) => {
        if (err) {
            console.error('Error querying hotels:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ hotels: rows });
    });
};



const deleteHotel = (req, res) => {
    const { HotelID } = req.params;
    const query = 'UPDATE Hotel SET Status = ? WHERE HotelID = ?';
    const status = 'Inactive';
    connection.query(query, [status, HotelID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).send('Internal Server Error');
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
    const query = 'UPDATE Hotel SET Name = ?, HotType = ?, PhoneNumber = ?, HotDesc = ?, Packages = ?, Address = ?, Email = ? WHERE HotelID = ?';
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