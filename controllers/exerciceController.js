const Exercice = require('../models/exerciceModel');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

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

exports.addExercise = async (req, res) => {
    const { nom, description, id_groupe_musculaire, lien_video } = req.body;
    const file = req.file;

    try {
        const newExercice = new Exercice({
            nom,
            description,
            id_groupe_musculaire,
            lien_video,
            date_creation: Date.now(),
            date_modification: Date.now()
        });

        await newExercice.save();

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);
                return res.status(400).json({ message: 'Uniquement JPG ou PNG' });
            }

            const photoFile = `${newExercice._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercices', photoFile);
            const tempCropPath = path.join(__dirname, '..', 'uploads', 'exercices', `temp_${photoFile}`);

            await fs.rename(file.path, uploadPath);

            await sharp(uploadPath)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(tempCropPath);

            await fs.rename(tempCropPath, uploadPath);

            newExercice.photo = photoFile;
            newExercice.photo_original_name = file.originalname;
            newExercice.photo_extension = fileExtension;

            await newExercice.save();
        }

        res.status(201).json({ message: 'Exercice créé avec succès', newExercice });
    } catch (err) {
        if (file) {
            await fs.unlink(file.path).catch(console.error);
        }
        res.status(500).json({ message: err.message });
    }
};

exports.editExercise = async (req, res) => {
    const { id } = req.params;
    const { nom, description, id_groupe_musculaire, lien_video } = req.body;
    const file = req.file;

    try {
        const exercice = await Exercice.findById(id);
        if (!exercice) {
            if (file) {
                await fs.unlink(file.path).catch(console.error);
            }
            return res.status(404).json({ message: 'Exercice non trouvé' });
        }

        exercice.nom = nom;
        exercice.description = description;
        exercice.id_groupe_musculaire = id_groupe_musculaire;
        exercice.lien_video = lien_video;
        exercice.date_modification = Date.now();

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);
                return res.status(400).json({ message: 'Uniquement JPG ou PNG' });
            }

            const photoFile = `${exercice._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercices', photoFile);
            const tempCropPath = path.join(__dirname, '..', 'uploads', 'exercices', `temp_${photoFile}`);

            await fs.rename(file.path, uploadPath);

            await sharp(uploadPath)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(tempCropPath);

            await fs.rename(tempCropPath, uploadPath);

            exercice.photo = photoFile;
            exercice.photo_original_name = file.originalname;
            exercice.photo_extension = fileExtension;
        }

        await exercice.save();

        res.status(200).json({ message: 'Exercice mis à jour avec succès', exercice });
    } catch (err) {
        if (file) {
            await fs.unlink(file.path).catch(console.error);
        }
        res.status(500).json({ message: err.message });
    }
};
