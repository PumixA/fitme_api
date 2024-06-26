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
