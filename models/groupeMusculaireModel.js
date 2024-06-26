const mongoose = require('mongoose');

const groupeMusculaireSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    date_creation: { type: Date, required: true, default: Date.now },
    date_modification: { type: Date, required: true, default: Date.now }
});

const GroupeMusculaire = mongoose.model('groupe_musculaire', groupeMusculaireSchema, 'groupe_musculaire');

module.exports = GroupeMusculaire;
