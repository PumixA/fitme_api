const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

const mysqlConnect = () => {
    connection.connect(err => {
        if (err) {
            console.error('MySQL connection error:', err);
            return;
        }
        console.log('MySQL connected');
    });
};

module.exports = mysqlConnect;
module.exports.connection = connection;
