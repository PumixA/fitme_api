const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const mongoConnect = require('./config/mongo');
const { mysqlConnect } = require('./config/db');

const userRoutes = require('./routes/userRoute');
const demandesInvitationRoutes = require('./routes/demandesInvitationRoute');
const { APIToolkit } = require('apitoolkit-express');

const app = express();
const port = process.env.PORT || 4000;

const apitoolkitClient = APIToolkit.NewClient({ apiKey: process.env.APITOOLKIT_API_KEY });

app.use(bodyParser.json());
app.use(cors());

app.use(apitoolkitClient.expressMiddleware);

mongoConnect();
mysqlConnect();

app.use('/api/users', userRoutes);
app.use('/api/invitations', demandesInvitationRoutes);

app.use(apitoolkitClient.errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
