const mongoose = require('mongoose');

const exerciceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String },
    photo: { type: String },
    id_groupe_musculaire: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groupe_musculaire' }],
    lien_video: { type: String },
    date_modification: { type: Date, required: true, default: Date.now }
});

const Exercice = mongoose.model('exercice', exerciceSchema, 'exercice');

module.exports = Exercice;
