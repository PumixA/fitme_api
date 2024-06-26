const GroupeMusculaire = require('../models/groupeMusculaireModel');

// Add the new controller function for getting all muscle groups
exports.getAllGroupeMusculaire = async (req, res) => {
    try {
        const groupesMusculaires = await GroupeMusculaire.find();
        res.status(200).json(groupesMusculaires);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneGroupeMusculaire = async (req, res) => {
    try {
        const groupeMusculaire = await GroupeMusculaire.findById(req.params.id);
        if (!groupeMusculaire) {
            return res.status(404).json({ message: 'Groupe musculaire not found' });
        }
        res.status(200).json(groupeMusculaire);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Edit a muscle group by ID
exports.editGroupeMusculaire = async (req, res) => {
    const { nom } = req.body;
    try {
        const groupeMusculaire = await GroupeMusculaire.findByIdAndUpdate(
            req.params.id,
            { nom, date_modification: Date.now() },
            { new: true }
        );
        if (!groupeMusculaire) {
            return res.status(404).json({ message: 'Groupe musculaire not found' });
        }
        res.status(200).json({ message: 'Groupe musculaire updated successfully', groupeMusculaire });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a new muscle group
exports.addGroupeMusculaire = async (req, res) => {
    const { nom } = req.body;
    try {
        const newGroupeMusculaire = new GroupeMusculaire({
            nom,
            date_creation: Date.now(),
            date_modification: Date.now()
        });
        await newGroupeMusculaire.save();
        res.status(201).json({ message: 'Groupe musculaire created successfully', newGroupeMusculaire });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
