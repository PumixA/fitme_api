const mongoose = require('mongoose');

const exerciceCustomSchema = new mongoose.Schema({
    id_utilisateur: { type: String, required: true },
    nom: { type: String, required: true },
    description: { type: String },
    photo: { type: String },
    id_groupe_musculaire: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groupe_musculaire', required: true }],
    lien_video: { type: String },
    nombre_series: { type: Number, required: true },
    nombre_rep: [{ type: Number, required: true }],
    temps_repos: { type: Number, required: true },
    poids: [{ type: Number, required: true }],
    categorie: { type: String, default: 'actif' },
    date_creation: { type: Date, required: true, default: Date.now },
    date_modification: { type: Date, required: true, default: Date.now }
});

const ExerciceCustom = mongoose.model('exercice_custom', exerciceCustomSchema, 'exercice_custom');

module.exports = ExerciceCustom;
