const mongoose = require('mongoose');

const groupeMusculaireSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    date_modification: { type: Date, required: true }
});

const GroupeMusculaire = mongoose.model('groupe_musculaire', groupeMusculaireSchema, 'groupe_musculaire');

module.exports = GroupeMusculaire;
