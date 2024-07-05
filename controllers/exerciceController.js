const Exercice = require('../models/exerciceModel');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

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
        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const validExtensions = ['.jpg', '.png'];

            if (!validExtensions.includes(fileExtension)) {
                await fs.unlink(file.path);  // Delete the invalid file
                return res.status(400).json({ message: 'Invalid file extension. Only .jpg and .png are allowed.' });
            }

            const newExercice = new Exercice({
                nom,
                description,
                id_groupe_musculaire,
                lien_video,
                date_creation: Date.now(),
                date_modification: Date.now()
            });

            await newExercice.save();

            const newFileName = `${newExercice._id}${fileExtension}`;
            const uploadPath = path.join(__dirname, '..', 'uploads', 'exercices', newFileName);

            // Crop and resize the image to 500x500 pixels
            await sharp(file.path)
                .resize(500, 500, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .toFile(uploadPath);

            // Delete the temporary file
            await fs.unlink(file.path);

            newExercice.photo = newFileName;
            await newExercice.save();

            res.status(201).json({ message: 'Exercice created successfully', newExercice });
        } else {
            const newExercice = new Exercice({
                nom,
                description,
                id_groupe_musculaire,
                lien_video,
                date_creation: Date.now(),
                date_modification: Date.now()
            });

            await newExercice.save();

            res.status(201).json({ message: 'Exercice created successfully', newExercice });
        }
    } catch (err) {
        if (file) {
            // Ensure the file is closed before attempting to delete it
            await fs.open(file.path, 'r').then(fd => fd.close()).catch(console.error);
            await fs.unlink(file.path).catch(console.error);  // Ensure the temporary file is deleted in case of an error
        }
        res.status(500).json({ message: err.message });
    }
};
