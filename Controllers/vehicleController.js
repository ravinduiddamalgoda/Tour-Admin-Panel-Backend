const connection = require('../Config/db');

const addVehicle = (req, res) => {
    const { Type, Capacity, VehicleNumber, Description } = req.body;
    const data = getLastVehicleID();
    let vehicleID = 1;
    if (!(data === undefined || data === null)) {
        vehicleID = data + 1;
    }
    const query = 'INSERT INTO Vehicle VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [vehicleID, Type, Capacity, VehicleNumber, Description], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Vehicle added successfully");
    });
}

const getLastVehicleID = () => {
    connection.query('SELECT * FROM Vehicle ORDER BY VehicleID DESC LIMIT 1', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        return rows[0].VehicleID;
    });
}

const getAllVehicles = (req, res) => {
    connection.query('SELECT * FROM Vehicle', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows);
    });
}

const deleteVehicle = (req, res) => {
    const { VehicleID } = req.params;
    const query = 'DELETE FROM Vehicle WHERE VehicleID = ?';
    connection.query(query, [VehicleID], (err, result) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.send("Vehicle deleted successfully");
    });
}

const getVehicleByID = (req, res) => {
    const { VehicleID } = req.params;
    const query = 'SELECT * FROM Vehicle WHERE VehicleID = ?';
    connection.query(query, [VehicleID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return;
        }
        res.json(rows[0]);
    });
}

// Update vehicle
const updateVehicle = (req, res) => {
    const { VehicleID } = req.params;
    const { Type, Make, Capacity, VehicleNumber, Description } = req.body;

    connection.query(
        'UPDATE Vehicle SET Type = ?, Make = ? , Capacity = ?, VehicleNumber = ?, Description = ? WHERE VehicleID = ?',
        [Type, Make, Capacity, VehicleNumber, Description, VehicleID],
        (err, result) => {
            if (err) {
                console.error('Error updating availability:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Vehicle record not found');
            }
            res.status(200).json({ message: 'Vehicle updated successfully' });
        }
    );
};

module.exports = {
    addVehicle,
    getAllVehicles,
    deleteVehicle,
    getVehicleByID,
    updateVehicle
}
