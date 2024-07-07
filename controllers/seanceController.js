const Seance = require('../models/seanceModel');
const ExerciceCustom = require('../models/exerciceCustomModel');
const ExerciceCustomSeance = require('../models/exerciceCustomSeanceModel');

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
        const seance = await Seance.findById(seanceId);
        if (!seance) {
            return res.status(404).json({ message: 'Seance non trouvée' });
        }

        if (seance.status !== 'actif') {
            return res.status(400).json({ message: 'Seance inactive' });
        }

        seance.nom = nom || seance.nom;
        seance.jour_seance = jour_seance || seance.jour_seance;
        seance.date_modification = Date.now();

        await seance.save();

        if (exercices && exercices.length) {
            for (const ex of exercices) {
                const exerciceCustom = await ExerciceCustom.findById(ex.id_exercice_custom);
                if (!exerciceCustom || exerciceCustom.categorie !== 'actif') {
                    return res.status(400).json({ message: `Exercice custom with id ${ex.id_exercice_custom} is not active or does not exist` });
                }

                let existingExercice = await ExerciceCustomSeance.findOne({ id_exercice_custom: ex.id_exercice_custom, id_seance: seanceId });
                if (existingExercice) {
                    existingExercice.ordre = ex.ordre;
                    existingExercice.status = 'actif';
                    await existingExercice.save();
                } else {
                    const newExerciceCustomSeance = new ExerciceCustomSeance({
                        id_exercice_custom: ex.id_exercice_custom,
                        id_seance: seanceId,
                        ordre: ex.ordre,
                        status: 'actif'
                    });
                    await newExerciceCustomSeance.save();
                }
            }

            const exerciceList = await ExerciceCustomSeance.find({ id_seance: seanceId }).sort('ordre');
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

        res.status(200).json({ message: 'Seance mise a jour avec succés !', seance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const adjustExerciseOrder = async (seanceId, exerciceId, newOrder) => {
    const exerciceList = await ExerciceCustomSeance.find({ id_seance: seanceId }).sort('ordre');

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
        const seance = await Seance.findById(seanceId);
        if (!seance || seance.status !== 'actif') {
            return res.status(404).json({ message: 'Seance non trouvée' });
        }

        const exercicesCustomSeance = await ExerciceCustomSeance.find({ id_seance: seanceId }).populate('id_exercice_custom');
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
        const seance = await Seance.findById(seanceId);
        if (!seance) {
            return res.status(404).json({ message: 'Seance not found' });
        }

        seance.status = 'supprime';
        await seance.save();

        res.status(200).json({ message: 'Seance supprimée avec succés !' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
