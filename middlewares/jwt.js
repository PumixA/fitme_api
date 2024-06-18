const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const header = req.headers.authorization;

    if (header) {
        const token = header.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json('Token is not valid');
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json('Authorization header is missing');
    }
};

module.exports = authenticateJWT;
