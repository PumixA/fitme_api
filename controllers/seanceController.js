const Seance = require('../models/seanceModel');

exports.addSeance = async (req, res) => {
    const { nom, jour_seance } = req.body;

    try {
        if (!Array.isArray(jour_seance) || jour_seance.some(day => day < 1 || day > 7)) {
            return res.status(400).json({ message: 'Invalid days. Days should be an array of numbers between 1 and 7.' });
        }

        const newSeance = new Seance({
            nom,
            jour_seance,
            status: 'actif',
            id_utilisateur: req.user.id,
            date_creation: Date.now(),
            date_modification: Date.now()
        });

        await newSeance.save();

        res.status(201).json({ message: 'Seance created successfully', newSeance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllSeances = async (req, res) => {
    const { nom, jour_seance } = req.query;
    const userId = req.user.id;

    let filter = { status: 'actif', id_utilisateur: userId };

    if (nom) {
        filter.nom = { $regex: nom, $options: 'i' }; // Case-insensitive search
    }

    if (jour_seance) {
        filter.jour_seance = { $in: jour_seance.split(',').map(Number) }; // Convert to array of numbers
    }

    try {
        const seances = await Seance.find(filter).sort({ date_creation: -1 });
        res.status(200).json(seances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
