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
