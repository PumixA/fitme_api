const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    jour_seance: { type: [Number], required: true },
    status: { type: String, required: true },
    id_utilisateur: { type: Number, required: true },
    date_creation: { type: Date, required: true },
    date_modification: { type: Date, required: true }
});

const Seance = mongoose.model('seance', seanceSchema, 'seance');

module.exports = Seance;
