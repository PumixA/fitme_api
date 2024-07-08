const mongoose = require('mongoose');

const statusSeanceSchema = new mongoose.Schema({
    id_utilisateur: { type: String, required: true },
    id_seance: { type: mongoose.Schema.Types.ObjectId, ref: 'Seance', required: true },
    status: { type: String, required: true, default: 'en_cours' },
    date_start: { type: Date, default: Date.now },
    date_end: { type: Date, default: null }
});

const StatusSeance = mongoose.model('StatusSeance', statusSeanceSchema, 'status_seance');

module.exports = StatusSeance;
