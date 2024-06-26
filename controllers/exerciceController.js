const Exercice = require('../models/exerciceModel');

// Get all exercises with optional filtering by muscle group
exports.getAllExercises = async (req, res) => {
    const { id_groupe_musculaire } = req.query;

    let filter = {};
    if (id_groupe_musculaire) {
        filter.id_groupe_musculaire = id_groupe_musculaire;
    }

    try {
        const exercises = await Exercice.find(filter).populate('id_groupe_musculaire', 'nom');
        res.status(200).json(exercises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getOneExercise = async (req, res) => {
    try {
        const exercise = await Exercice.findById(req.params.id).populate('id_groupe_musculaire', 'nom');
        if (!exercise) {
            return res.status(404).json({ message: 'Exercice not found' });
        }
        res.status(200).json(exercise);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
