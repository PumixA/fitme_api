const Exercice = require('../models/exerciceModel');
const ExerciceCustom = require('../models/exerciceCustomModel');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

exports.addCustomExercise = async (req, res) => {
    const { nom, description, id_groupe_musculaire, lien_video, nombre_series, nombre_rep, temps_repos, poids } = req.body;
    const file = req.file;

    try {
        let parsedNombreRep = JSON.parse(nombre_rep);
        let parsedPoids = JSON.parse(poids);

        const newCustomExercise = new ExerciceCustom({
            id_utilisateur: req.user.id,
            nom,
            description,
            id_groupe_musculaire,
            lien_video,
            nombre_series,
            nombre_rep: parsedNombreRep,
            temps_repos,
            poids: parsedPoids,
            date_creation: Date.now(),
            date_modification: Date.now(),
            categorie: 'actif'
        });

        await newCustomExercise.save();

        let photoFile = null;

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);  // Delete the invalid file
                return res.status(400).json({ message: 'Invalid file extension. Only .jpg and .png are allowed.' });
            }

            photoFile = `${newCustomExercise._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', photoFile);

            // Resize and crop the image to 500x500 pixels
            await sharp(file.path)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(uploadPath);

            // Delete the temporary file
            await fs.unlink(file.path);

            newCustomExercise.photo = photoFile;
            await newCustomExercise.save();
        }

        res.status(201).json({ message: 'Custom exercise created successfully', newCustomExercise });
    } catch (err) {
        if (file) {
            await fs.open(file.path, 'r').then(fd => fd.close()).catch(console.error);
            await fs.unlink(file.path).catch(console.error);  // Ensure the temporary file is deleted in case of an error
        }
        res.status(500).json({ message: err.message });
    }
};

exports.addCustomExerciseFromExercice = async (req, res) => {
    try {
        const exercice = await Exercice.findById(req.params.id).populate('id_groupe_musculaire', 'nom');
        if (!exercice) {
            return res.status(404).json({ message: 'Exercice not found' });
        }

        const newCustomExercise = new ExerciceCustom({
            id_utilisateur: req.user.id,
            nom: exercice.nom,
            description: exercice.description,
            photo: exercice.photo,
            id_groupe_musculaire: exercice.id_groupe_musculaire,
            lien_video: exercice.lien_video,
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

        res.status(201).json({ message: 'Custom exercise created successfully from existing exercise', newCustomExercise });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editCustomExercise = async (req, res) => {
    const { nom, description, id_groupe_musculaire, lien_video, nombre_series, nombre_rep, temps_repos, poids, categorie } = req.body;
    const file = req.file;

    try {
        const exerciceCustom = await ExerciceCustom.findById(req.params.id);
        if (!exerciceCustom) {
            return res.status(404).json({ message: 'Exercice custom not found' });
        }

        if (categorie && categorie !== 'actif') {
            return res.status(400).json({ message: 'Invalid category. Only "actif" category is allowed.' });
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

        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);  // Delete the invalid file
                return res.status(400).json({ message: 'Invalid file extension. Only .jpg and .png are allowed.' });
            }

            const photoFile = `${exerciceCustom._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercice_custom', photoFile);

            // Resize and crop the image to 500x500 pixels
            await sharp(file.path)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(uploadPath);

            // Delete the temporary file
            await fs.unlink(file.path);

            exerciceCustom.photo = photoFile;
        }

        await exerciceCustom.save();

        res.status(200).json({ message: 'Custom exercise updated successfully', exerciceCustom });
    } catch (err) {
        if (file) {
            await fs.open(file.path, 'r').then(fd => fd.close()).catch(console.error);
            await fs.unlink(file.path).catch(console.error);  // Ensure the temporary file is deleted in case of an error
        }
        res.status(500).json({ message: err.message });
    }
};
