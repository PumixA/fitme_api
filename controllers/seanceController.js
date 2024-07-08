const Seance = require('../models/seanceModel');
const ExerciceCustom = require('../models/exerciceCustomModel');
const ExerciceCustomSeance = require('../models/exerciceCustomSeanceModel');
const StatusSeance = require('../models/statusSeanceModel');
const UserModel = require('../models/userModel');

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
        filter.nom = { $regex: nom, $options: 'i' };
    }

    if (jour_seance) {
        filter.jour_seance = { $in: jour_seance.split(',').map(Number) };
    }

    try {
        const seances = await Seance.find(filter).sort({ date_creation: -1 });
        res.status(200).json(seances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editSeance = async (req, res) => {
    const { nom, jour_seance, exercices } = req.body;
    const seanceId = req.params.id;

    try {
        const seance = await Seance.findOne({ _id: seanceId, id_utilisateur: req.user.id, status: 'actif' });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée' });
        }

        seance.nom = nom || seance.nom;
        seance.jour_seance = jour_seance || seance.jour_seance;
        seance.date_modification = Date.now();

        await seance.save();

        if (exercices && exercices.length) {
            for (const ex of exercices) {
                const exerciceCustom = await ExerciceCustom.findOne({ _id: ex.id_exercice_custom, id_utilisateur: req.user.id, categorie: 'actif' });
                if (!exerciceCustom) {
                    return res.status(400).json({ message: `Exercice custom with id ${ex.id_exercice_custom} is not active, does not exist, or does not belong to the user` });
                }

                let existingExercice = await ExerciceCustomSeance.findOne({ id_exercice_custom: ex.id_exercice_custom, id_seance: seanceId });
                if (existingExercice) {
                    existingExercice.ordre = ex.ordre;
                    existingExercice.status = 'actif';
                } else {
                    existingExercice = new ExerciceCustomSeance({
                        id_exercice_custom: ex.id_exercice_custom,
                        id_seance: seanceId,
                        ordre: ex.ordre,
                        status: 'actif'
                    });
                }
                await existingExercice.save();
            }

            const exerciceList = await ExerciceCustomSeance.find({ id_seance: seanceId, status: 'actif' }).sort('ordre');
            for (let i = 0; i < exerciceList.length; i++) {
                exerciceList[i].ordre = i + 1;
                await exerciceList[i].save();
            }

            for (const ex of exercices) {
                let exerciceToUpdate = await ExerciceCustomSeance.findOne({ id_exercice_custom: ex.id_exercice_custom, id_seance: seanceId });
                if (exerciceToUpdate) {
                    await adjustExerciseOrder(seanceId, exerciceToUpdate._id, ex.ordre);
                }
            }
        }

        res.status(200).json({ message: 'Séance mise à jour avec succès !', seance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const adjustExerciseOrder = async (seanceId, exerciceId, newOrder) => {
    const exerciceList = await ExerciceCustomSeance.find({ id_seance: seanceId, status: 'actif', ordre: { $ne: null } }).sort('ordre');

    const exerciceToUpdate = exerciceList.find(ex => ex._id.toString() === exerciceId.toString());

    if (!exerciceToUpdate) return;

    exerciceList.splice(exerciceList.indexOf(exerciceToUpdate), 1);

    exerciceList.splice(newOrder - 1, 0, exerciceToUpdate);

    for (let i = 0; i < exerciceList.length; i++) {
        exerciceList[i].ordre = i + 1;
        await exerciceList[i].save();
    }
};

exports.getOneSeance = async (req, res) => {
    const seanceId = req.params.id;

    try {
        const seance = await Seance.findOne({ _id: seanceId, id_utilisateur: req.user.id, status: 'actif' });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée' });
        }

        const exercicesCustomSeance = await ExerciceCustomSeance.find({ id_seance: seanceId, status: 'actif' }).populate('id_exercice_custom');
        const exercices = exercicesCustomSeance.filter(ex => ex.id_exercice_custom.categorie === 'actif');

        res.status(200).json({
            seance,
            exercices
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSeance = async (req, res) => {
    const seanceId = req.params.id;

    try {
        const seance = await Seance.findOne({ _id: seanceId, id_utilisateur: req.user.id });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée ou non autorisée' });
        }

        seance.status = 'supprime';
        await seance.save();

        const exercicesCustomSeance = await ExerciceCustomSeance.find({ id_seance: seanceId });

        for (const ex of exercicesCustomSeance) {
            ex.status = 'supprime';
            ex.ordre = null;
            await ex.save();
        }

        res.status(200).json({ message: 'Séance et exercices associés supprimés avec succès !' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteExerciceFromSeance = async (req, res) => {
    const { id_seance, id_exercice_custom } = req.params;

    try {
        const seance = await Seance.findOne({ _id: id_seance, id_utilisateur: req.user.id });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée ou non autorisée' });
        }

        const exerciceCustomSeance = await ExerciceCustomSeance.findOne({ id_seance, id_exercice_custom });
        if (!exerciceCustomSeance) {
            return res.status(404).json({ message: 'Exercice customisé non trouvé dans la séance' });
        }

        exerciceCustomSeance.status = 'supprime';
        exerciceCustomSeance.ordre = null;
        await exerciceCustomSeance.save();

        // Adjust the order of remaining exercises
        const remainingExercices = await ExerciceCustomSeance.find({ id_seance, status: 'actif' }).sort('ordre');
        for (let i = 0; i < remainingExercices.length; i++) {
            remainingExercices[i].ordre = i + 1;
            await remainingExercices[i].save();
        }

        res.status(200).json({ message: 'Exercice customisé supprimé de la séance avec succès !' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.startSeance = async (req, res) => {
    const seanceId = req.params.id;
    const userId = req.user.id;

    try {
        const seance = await Seance.findById(seanceId);
        if (!seance || seance.status !== 'actif') {
            return res.status(404).json({ message: 'Séance non trouvée ou inactive' });
        }

        const newStatusSeance = new StatusSeance({
            id_utilisateur: userId,
            id_seance: seanceId,
            status: 'en_cours',
            date_start: Date.now(),
            date_end: null
        });

        await newStatusSeance.save();

        try {
            await UserModel.updateUserStatusSeance(userId, newStatusSeance._id);
            res.status(201).json({ message: 'Séance commencée avec succès', statusSeance: newStatusSeance });
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de l\'utilisateur', error: err });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
