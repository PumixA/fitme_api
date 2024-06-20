const Seance = require('../models/seanceModel');

exports.getFilteredSeance = async (req, res) => {
    try {
        const today = new Date().getDay();
        const userId = req.user.id;

        const seances = await Seance.find({
            status: 'actif',
            jour_seance: today,
            id_utilisateur: userId
        }).sort({ date_modification: -1 });

        if (seances.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json([seances[0]]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
