const mongoose = require('mongoose');

const statusSeanceSchema = new mongoose.Schema({
    id_utilisateur: { type: String, required: true },
    id_seance: { type: mongoose.Schema.Types.ObjectId, ref: 'Seance', required: true },
    status: { type: String, required: true },
    date_start: { type: Date },
    date_end: { type: Date },
    temps_effectue: { type: Number }
});

const StatusSeance = mongoose.model('StatusSeance', statusSeanceSchema, 'status_seance');

module.exports = StatusSeance;
