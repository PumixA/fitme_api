const mongoose = require('mongoose');

const statusExerciceSchema = new mongoose.Schema({
    id_utilisateur: { type: String, required: true },
    id_exercice_custom: { type: mongoose.Schema.Types.ObjectId, ref: 'ExerciceCustom', required: true },
    id_status_seance: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusSeance', required: true },
    nombre_rep: { type: [Number], required: true },
    poids: { type: [Number], required: true },
    temps_repos: { type: [Number], required: true },
    numero_serie: { type: Number, required: true, default: 0 },
    temps_effectue: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: 'non_effectue' },
    date_start: { type: Date },
    date_end: { type: Date }
});

const StatusExercice = mongoose.model('StatusExercice', statusExerciceSchema, 'status_exercice');

module.exports = StatusExercice;
