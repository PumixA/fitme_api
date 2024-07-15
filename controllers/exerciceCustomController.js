const Exercice = require('../models/exerciceModel');
const ExerciceCustom = require('../models/exerciceCustomModel');
const ExerciceCustomSeance = require('../models/exerciceCustomSeanceModel');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

exports.addCustomExercise = async (req, res) => {
    const { nom, description, id_groupe_musculaire, lien_video, nombre_series, nombre_rep, temps_repos, poids } = req.body;
    const file = req.file;

    try {
        const parsedNombreRep = nombre_rep ? JSON.parse(nombre_rep) : [0];
        const parsedPoids = poids ? JSON.parse(poids) : [0];
        const parsedNombreSeries = nombre_series ? parseInt(nombre_series, 10) : 1;
        const parsedTempsRepos = temps_repos ? parseInt(temps_repos, 10) : 0;

        const newCustomExercise = new ExerciceCustom({
            id_utilisateur: req.user.id,
            nom,
            description,
            id_groupe_musculaire,
            lien_video,
            nombre_series: parsedNombreSeries,
            nombre_rep: parsedNombreRep,
            temps_repos: parsedTempsRepos,
            poids: parsedPoids,
            date_creation: Date.now(),
            date_modification: Date.now(),
            categorie: 'actif'
        });

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);
                return res.status(400).json({ message: 'Uniquement JPG ou PNG' });
            }

            const photoFile = `${newCustomExercise._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', photoFile);
            const tempCropPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', `temp_${photoFile}`);

            await newCustomExercise.save();
            await fs.rename(file.path, uploadPath);

            await sharp(uploadPath)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(tempCropPath);

            await fs.rename(tempCropPath, uploadPath);

            newCustomExercise.photo = photoFile;
            await newCustomExercise.save();
        } else {
            await newCustomExercise.save();
        }

        res.status(201).json({ message: 'Exercice customisé créé avec succès', newCustomExercise });
    } catch (err) {
        if (file) {
            await fs.unlink(file.path).catch(console.error);
        }
        res.status(500).json({ message: err.message });
    }
};

exports.addCustomExerciseFromExercice = async (req, res) => {
    try {
        const exercice = await Exercice.findById(req.params.id).populate('id_groupe_musculaire', 'nom');
        if (!exercice) {
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        const newCustomExercise = new ExerciceCustom({
            id_utilisateur: req.user.id,
            nom: exercice.nom,
            description: exercice.description,
            photo: exercice.photo,
            id_groupe_musculaire: exercice.id_groupe_musculaire,
            lien_video: exercice.lien_video,
            nombre_series: exercice.nombre_series || 1,
            nombre_rep: exercice.nombre_rep && exercice.nombre_rep.length ? exercice.nombre_rep : [0],
            temps_repos: exercice.temps_repos || 0,
            poids: exercice.poids && exercice.poids.length ? exercice.poids : [0],
            date_creation: Date.now(),
            date_modification: Date.now(),
            categorie: 'actif'
        });

        await newCustomExercise.save();

        if (exercice.photo) {
            const fileExtension = path.extname(exercice.photo);
            const newPhotoFileName = `${newCustomExercise._id}${fileExtension}`;
            const oldPhotoPath = path.join(__dirname, '..', 'uploads', 'exercices', exercice.photo);
            const newPhotoPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', newPhotoFileName);

            try {
                await fs.copyFile(oldPhotoPath, newPhotoPath);
                newCustomExercise.photo = newPhotoFileName;
                await newCustomExercise.save();
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.warn('Original photo file not found, skipping photo duplication');
                } else {
                    console.error('Failed to copy photo file:', error);
                    return res.status(500).json({ message: 'Failed to copy photo file' });
                }
            }
        }

        res.status(201).json({ message: 'Exercice importé avec succès', newCustomExercise });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editCustomExercise = async (req, res) => {
    const { nom, description, id_groupe_musculaire, lien_video, nombre_series, nombre_rep, temps_repos, poids, categorie } = req.body;
    const file = req.file;

    try {
        const exerciceCustom = await ExerciceCustom.findOne({ _id: req.params.id, id_utilisateur: req.user.id });
        if (!exerciceCustom || exerciceCustom.categorie !== 'actif') {
            if (file) {
                await fs.unlink(file.path).catch(console.error);
            }
            return res.status(404).json({ message: 'Exercice custom non trouvé ou inactif' });
        }

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);
                return res.status(400).json({ message: 'Uniquement JPG ou PNG' });
            }

            const photoFile = `${exerciceCustom._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', photoFile);
            const tempCropPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', `temp_${photoFile}`);

            await fs.rename(file.path, uploadPath);

            await sharp(uploadPath)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(tempCropPath);

            await fs.rename(tempCropPath, uploadPath);

            exerciceCustom.photo = photoFile;
        }

        let parsedNombreRep = JSON.parse(nombre_rep);
        let parsedPoids = JSON.parse(poids);

        exerciceCustom.nom = nom;
        exerciceCustom.description = description;
        exerciceCustom.id_groupe_musculaire = id_groupe_musculaire;
        exerciceCustom.lien_video = lien_video;
        exerciceCustom.nombre_series = nombre_series;
        exerciceCustom.nombre_rep = parsedNombreRep;
        exerciceCustom.temps_repos = temps_repos;
        exerciceCustom.poids = parsedPoids;
        exerciceCustom.date_modification = Date.now();

        if (categorie) {
            exerciceCustom.categorie = categorie;
        }

        await exerciceCustom.save();

        res.status(200).json({ message: 'Exercice customisé modifié avec succès', exerciceCustom });
    } catch (err) {
        if (file) {
            await fs.unlink(file.path).catch(console.error);
        }
        res.status(500).json({ message: err.message });
    }
};

exports.getAllCustomExercises = async (req, res) => {
    try {
        const exercises = await ExerciceCustom.find({ categorie: 'actif', id_utilisateur: req.user.id }).populate('id_groupe_musculaire', 'nom');
        res.status(200).json(exercises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneCustomExercise = async (req, res) => {
    try {
        const exercise = await ExerciceCustom.findOne({ _id: req.params.id, id_utilisateur: req.user.id }).populate('id_groupe_musculaire', 'nom');
        if (!exercise || exercise.categorie !== 'actif') {
            return res.status(404).json({ message: 'Exercice customisé non trouvé' });
        }
        res.status(200).json(exercise);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCustomExercise = async (req, res) => {
    try {
        const exercise = await ExerciceCustom.findOne({ _id: req.params.id, id_utilisateur: req.user.id });
        if (!exercise) {
            return res.status(404).json({ message: 'Exercice customisé non trouvé' });
        }

        exercise.categorie = 'supprime';
        await exercise.save();

        // Find all related ExerciceCustomSeance entries and update them
        const exercicesCustomSeance = await ExerciceCustomSeance.find({ id_exercice_custom: exercise._id });

        for (const ex of exercicesCustomSeance) {
            ex.status = 'supprime';
            ex.ordre = null;
            await ex.save();

            // Adjust the order of remaining exercises in the same seance
            await adjustExerciseOrder(ex.id_seance);
        }

        res.status(200).json({ message: 'Exercice customisé supprimé avec succès !' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const adjustExerciseOrder = async (seanceId) => {
    const exerciceList = await ExerciceCustomSeance.find({ id_seance: seanceId, status: 'actif' }).sort('ordre');

    for (let i = 0; i < exerciceList.length; i++) {
        exerciceList[i].ordre = i + 1;
        await exerciceList[i].save();
    }
};


