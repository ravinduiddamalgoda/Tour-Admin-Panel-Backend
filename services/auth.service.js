const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const APP_SECRET = 'travel-API-secret';
const APP_ACCESS_TOKEN_EXP_SECS = 3600;
const JWT_OPTIONS = {
    algorithm: "HS256",
    issuer: "travelAPI.com/api",
    audience: "travelAPI.com",
    expiresIn: APP_ACCESS_TOKEN_EXP_SECS,
};

function createPasswordHash(password) {
    return bcrypt.hash(password, 10);
}

function validatePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

async function signToken(password, hash, payload) {
    const isValidPassword = await validatePassword(password, hash);

    if (!isValidPassword) {
        throw new Error('Invalid Password');
    }

    const token = jwt.sign(payload, APP_SECRET, JWT_OPTIONS);
    return {
        token,
        life: APP_ACCESS_TOKEN_EXP_SECS,
    };
}

async function verifyToken(token) {
    const payload = jwt.verify(token, APP_SECRET, JWT_OPTIONS);
    return payload;
}

module.exports = {
    createPasswordHash,
    validatePassword,
    signToken,
    verifyToken
};
