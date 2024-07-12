const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const mongoConnect = require('./config/mongo');
const { mysqlConnect } = require('./config/db');

const userRoutes = require('./routes/userRoute');
const demandesInvitationRoutes = require('./routes/demandesInvitationRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const exerciceRoutes = require('./routes/exerciceRoute');
const exerciceCustomRoutes = require('./routes/exerciceCustomRoute');
const seanceRoutes = require('./routes/seanceRoute');
const statRoutes = require('./routes/statRoutes');
const groupeMusculaireRoutes = require('./routes/groupeMusculaireRoute');

const adminUserRoutes = require('./routes/administrateur/userRoute');
const adminDemandesInvitaionRoutes = require('./routes/administrateur/demandesInvitationRoute');
const adminGroupeMusculaireRoutes = require('./routes/administrateur/groupeMusculaireRoute');
const adminExerciceRoutes = require('./routes/administrateur/exerciceRoute');

const { APIToolkit } = require('apitoolkit-express');

const app = express();
const port = process.env.PORT || 4000;

const apitoolkitClient = APIToolkit.NewClient({ apiKey: process.env.APITOOLKIT_API_KEY });

app.use(bodyParser.json());
app.use(cors());

app.use(apitoolkitClient.expressMiddleware);

mongoConnect();
mysqlConnect();

// Utilisateur
app.use('/api/users', userRoutes);
app.use('/api/invitations', demandesInvitationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exercice', exerciceRoutes);
app.use('/api/exercice_custom', exerciceCustomRoutes);
app.use('/api/seance', seanceRoutes);
app.use('/api/stat/seance', statRoutes);
app.use('/api/groupe_musculaire', groupeMusculaireRoutes);

// Administrateur
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/demandes_invitation', adminDemandesInvitaionRoutes);
app.use('/api/admin/groupe_musculaire', adminGroupeMusculaireRoutes);
app.use('/api/admin/exercice', adminExerciceRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(apitoolkitClient.errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
