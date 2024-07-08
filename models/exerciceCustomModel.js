const mongoose = require('mongoose');

const exerciceCustomSchema = new mongoose.Schema({
    id_utilisateur: { type: String, required: true },
    nom: { type: String, required: true },
    description: { type: String },
    photo: { type: String },
    id_groupe_musculaire: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groupe_musculaire' }],
    lien_video: { type: String },
    nombre_series: { type: Number },
    nombre_rep: { type: [Number] },
    temps_repos: { type: Number },
    poids: { type: [Number] },
    categorie: { type: String, default: 'actif' },
    date_creation: { type: Date, default: Date.now },
    date_modification: { type: Date, default: Date.now }
});

const ExerciceCustom = mongoose.model('ExerciceCustom', exerciceCustomSchema, 'exercice_custom');

module.exports = ExerciceCustom;
