const Seance = require('../models/seanceModel');
const ExerciceCustom = require('../models/exerciceCustomModel');
const ExerciceCustomSeance = require('../models/exerciceCustomSeanceModel');
const StatusSeance = require('../models/statusSeanceModel');
const StatusExercice = require('../models/statusExerciceModel');
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
        // Find the seance and ensure it belongs to the logged-in user and is active
        const seance = await Seance.findOne({ _id: seanceId, id_utilisateur: userId, status: 'actif' });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée ou non autorisée' });
        }

        // Create a new status_seance entry
        const newStatusSeance = new StatusSeance({
            id_utilisateur: userId,
            id_seance: seanceId,
            status: 'en_cours',
            date_start: Date.now(),
            date_end: null
        });

        await newStatusSeance.save();

        // Update the user's id_status_seance to the new status_seance's id
        try {
            await UserModel.updateUserSeance(userId, newStatusSeance._id.toString());

            // Find all exercice_custom_seance entries related to the seanceId
            const exercicesCustomSeance = await ExerciceCustomSeance.find({ id_seance: seanceId, status: 'actif' });

            // Create status_exercice entries for each exercice_custom_seance
            for (const exercice of exercicesCustomSeance) {
                const newStatusExercice = new StatusExercice({
                    id_utilisateur: userId,
                    id_exercice_custom: exercice.id_exercice_custom,
                    id_status_seance: newStatusSeance._id,
                    nombre_rep: exercice.nombre_rep,
                    temps_repos: exercice.temps_repos,
                    numero_serie: 0, // Initialize to zero
                    temps_effectue: 0,
                    status: 'non_effectue',
                    date_start: null,
                    date_end: null
                });
                await newStatusExercice.save();
            }

            res.status(201).json({ message: 'Séance commencée avec succès', statusSeance: newStatusSeance });
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de l\'utilisateur', error: err });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getChrono = async (req, res) => {
    const seanceId = req.params.id;
    const userId = req.user.id;

    try {
        // Find the status_seance entry
        const statusSeance = await StatusSeance.findOne({ id_seance: seanceId, id_utilisateur: userId, status: 'en_cours' });

        if (!statusSeance || !statusSeance.date_start) {
            return res.status(404).json({ message: 'Séance non trouvée ou non en cours' });
        }

        // Calculate the time difference
        const dateStart = new Date(statusSeance.date_start);
        const now = new Date();
        const timeDifference = Math.floor((now - dateStart) / 1000); // Difference in seconds

        res.status(200).json({
            date_start: statusSeance.date_start,
            elapsed_time_seconds: timeDifference
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSeanceExercices = async (req, res) => {
    const seanceId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if the seance is active and belongs to the user
        const seance = await Seance.findOne({ _id: seanceId, id_utilisateur: userId, status: 'actif' });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée ou non autorisée' });
        }

        // Get the active status_seance
        const statusSeance = await StatusSeance.findOne({ id_seance: seanceId, id_utilisateur: userId, status: 'en_cours' });
        if (!statusSeance) {
            return res.status(404).json({ message: 'Statut de la séance non trouvé ou non en cours' });
        }

        // Get active exercice_custom_seance in the correct order
        const exercicesCustomSeance = await ExerciceCustomSeance.find({ id_seance: seanceId, status: 'actif' }).sort('ordre').populate('id_exercice_custom');

        // Filter out inactive exercises
        const exercices = exercicesCustomSeance.filter(ex => ex.id_exercice_custom.categorie === 'actif').map(ex => ({
            exercice: ex.id_exercice_custom,
            ordre: ex.ordre,
            status: 'non effectué'
        }));

        // Check each exercise status
        for (let i = 0; i < exercices.length; i++) {
            const statusExercice = await StatusExercice.findOne({
                id_utilisateur: userId,
                id_exercice_custom: exercices[i].exercice._id,
                id_status_seance: statusSeance._id
            });

            if (statusExercice) {
                exercices[i].status = statusExercice.status;
            }
        }

        res.status(200).json({
            seance,
            exercices
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editExercice = async (req, res) => {
    const exerciceCustomId = req.params.id;
    const userId = req.user.id;

    try {
        const exerciceCustom = await ExerciceCustom.findOne({ _id: exerciceCustomId, id_utilisateur: userId, categorie: 'actif' });
        if (!exerciceCustom) {
            return res.status(404).json({ message: 'Exercice customisé non trouvé ou non autorisé' });
        }

        const statusSeance = await StatusSeance.findOne({ id_utilisateur: userId, status: 'en_cours' });
        if (!statusSeance) {
            return res.status(404).json({ message: 'Aucune séance en cours trouvée pour l\'utilisateur' });
        }

        const statusExercice = await StatusExercice.findOne({
            id_exercice_custom: exerciceCustomId,
            id_status_seance: statusSeance._id,
            id_utilisateur: userId
        });

        if (!statusExercice) {
            return res.status(404).json({ message: 'Statut de l\'exercice non trouvé' });
        }

        if (statusExercice.status === 'non_effectue') {
            statusExercice.status = 'en_cours';
            statusExercice.date_start = Date.now();
            await statusExercice.save();
            return res.status(200).json({ message: 'Exercice commencé', statusExercice });
        }

        if (statusExercice.status === 'en_cours') {
            const numeroSerie = statusExercice.numero_serie;

            // Check if there are more series to complete
            if (numeroSerie < exerciceCustom.nombre_series) {
                // Check if this is the start of a new series
                if (!statusExercice.nombre_rep[numeroSerie]) {
                    // Update the current series information
                    statusExercice.nombre_rep[numeroSerie] = exerciceCustom.nombre_rep[numeroSerie];
                    statusExercice.poids[numeroSerie] = exerciceCustom.poids[numeroSerie];
                    statusExercice.temps_repos[numeroSerie] = Date.now();
                } else {
                    // Calculate and store the rest time for the current series
                    const now = Date.now();
                    const restTime = now - statusExercice.temps_repos[numeroSerie];
                    statusExercice.temps_repos[numeroSerie] = restTime;

                    // Increment the series number
                    statusExercice.numero_serie += 1;

                    // Check if all series are completed
                    if (statusExercice.numero_serie >= exerciceCustom.nombre_series) {
                        statusExercice.status = 'effectue';
                        statusExercice.date_end = now;
                        statusExercice.temps_effectue = statusExercice.date_end - statusExercice.date_start;
                    }
                }

                await statusExercice.save();
                return res.status(200).json({ message: 'Exercice mis à jour', statusExercice });
            }
        }

        if (statusExercice.status === 'effectue') {
            return res.status(200).json({ message: 'Exercice déjà effectué' });
        }

        return res.status(400).json({ message: 'Statut de l\'exercice invalide' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.endSeance = async (req, res) => {
    const seanceId = req.params.id;
    const userId = req.user.id;

    try {
        // Vérifier que la séance appartient à l'utilisateur connecté et est active
        const seance = await Seance.findOne({ _id: seanceId, id_utilisateur: userId, status: 'actif' });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée ou non autorisée' });
        }

        // Trouver le status_seance correspondant
        const statusSeance = await StatusSeance.findOne({ id_seance: seanceId, id_utilisateur: userId, status: 'en_cours' });
        if (!statusSeance) {
            return res.status(404).json({ message: 'Statut de la séance non trouvé ou déjà terminé' });
        }

        // Mettre à jour la date de fin et le statut de la séance
        statusSeance.date_end = Date.now();
        statusSeance.status = 'effectue';
        statusSeance.temps_effectue = statusSeance.date_end - statusSeance.date_start;
        await statusSeance.save();

        // Mettre à jour le statut de tous les exercices liés à la séance
        const statusExercices = await StatusExercice.find({ id_status_seance: statusSeance._id, status: { $ne: 'effectue' } });
        for (const statusExercice of statusExercices) {
            if (statusExercice.status === 'en_cours') {
                statusExercice.date_end = Date.now();
                statusExercice.temps_effectue = statusExercice.date_end - statusExercice.date_start;
                statusExercice.status = 'effectue';
            } else if (statusExercice.status === 'non_effectue') {
                statusExercice.status = 'effectue';
            }
            await statusExercice.save();
        }

        // Mettre à jour l'utilisateur pour passer id_status_seance à null
        await UserModel.updateUserSeance(userId, null);

        res.status(200).json({ message: 'Séance terminée avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneExercice = async (req, res) => {
    const { seanceId, exerciceId } = req.params;
    const userId = req.user.id;

    try {
        // Récupérer l'id_status_seance de l'utilisateur connecté
        const user = await UserModel.getUserById(userId);
        if (!user.id_status_seance) {
            return res.status(400).json({ message: "Aucune séance en cours pour cet utilisateur." });
        }

        // Vérifier si id_status_seance correspond à seanceId
        const statusSeance = await StatusSeance.findOne({ _id: user.id_status_seance });
        if (!statusSeance || statusSeance.id_seance.toString() !== seanceId) {
            return res.status(400).json({ message: "L'ID de la séance en cours ne correspond pas à celui fourni dans l'URL." });
        }

        // Vérifier si un exercice avec le même id_status_seance existe dans status_exercices
        const statusExercice = await StatusExercice.findOne({ id_status_seance: user.id_status_seance, id_exercice_custom: exerciceId });
        if (!statusExercice) {
            return res.status(404).json({ message: "Exercice non trouvé pour la séance en cours." });
        }

        // Récupérer les détails de l'exercice dans exercice_custom
        const exerciceCustom = await ExerciceCustom.findOne({ _id: exerciceId });
        if (!exerciceCustom) {
            return res.status(404).json({ message: "Exercice customisé non trouvé." });
        }

        // Renvoyer les informations combinées
        res.status(200).json({
            exerciceCustom,
            statusExercice
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
