const mongoose = require('mongoose');

const exerciceCustomSeanceSchema = new mongoose.Schema({
    id_exercice_custom: { type: mongoose.Schema.Types.ObjectId, ref: 'ExerciceCustom', required: true },
    id_seance: { type: mongoose.Schema.Types.ObjectId, ref: 'Seance', required: true },
    ordre: { type: Number },
    status: { type: String, required: true, default: 'actif' }
});

const ExerciceCustomSeance = mongoose.model('ExerciceCustomSeance', exerciceCustomSeanceSchema, 'exercice_custom_seance');

module.exports = ExerciceCustomSeance;
