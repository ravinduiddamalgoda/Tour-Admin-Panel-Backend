const connection = require('../Config/db');

const addTourPackage = (req, res) => {
    const { Name, Description, Price, Itinerary, NoOfDates } = req.body;
    const data = getLastPackageID();
    let packageID = 1;
    if (!(data === undefined || data === null)) {
        packageID = data + 1;
    }
    const query = 'INSERT INTO TourPackages VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [packageID, Name, Description, Price, Itinerary, NoOfDates], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Tour package added successfully");
    });
}

const getLastPackageID = () => {
    connection.query('SELECT * FROM TourPackages ORDER BY PackageID DESC LIMIT 1', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        return rows[0].PackageID;
    });
}

const getAllTourPackages = (req, res) => {
    connection.query('SELECT * FROM TourPackages', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows);
    });
}

const deleteTourPackage = (req, res) => {
    const { PackageID } = req.params;
    const query = 'DELETE FROM TourPackages WHERE PackageID = ?';
    connection.query(query, [PackageID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Tour package deleted successfully");
    });
}

const getTourPackageByID = (req, res) => {
    const { PackageID } = req.params;
    const query = 'SELECT * FROM TourPackages WHERE PackageID = ?';
    connection.query(query, [PackageID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows[0]);
    });
}

module.exports = {
    addTourPackage,
    getAllTourPackages,
    deleteTourPackage,
    getTourPackageByID
}
