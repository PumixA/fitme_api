const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const mongoConnect = require('./config/mongo');
const { mysqlConnect } = require('./config/db');

const userRoutes = require('./routes/userRoute');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());

mongoConnect();
mysqlConnect();

app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
