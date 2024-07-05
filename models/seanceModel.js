const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    jour_seance: { type: [Number], required: true },
    status: { type: String, required: true, default: 'actif' },
    id_utilisateur: { type: String, required: true },
    date_creation: { type: Date, required: true, default: Date.now },
    date_modification: { type: Date, required: true, default: Date.now }
});

const Seance = mongoose.model('Seance', seanceSchema, 'seance');

module.exports = Seance;
