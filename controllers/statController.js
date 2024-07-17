const StatusSeance = require('../models/statusSeanceModel');
const Seance = require('../models/seanceModel');
const StatusExercice = require('../models/statusExerciceModel');
const mongoose = require('mongoose');

exports.getSeanceStats = async (req, res) => {
    const { exercice, filter, startDate, endDate } = req.query;
    const userId = req.user.id;

    try {
        // Convertir les dates en format ISO pour les requêtes MongoDB
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end date to end of the day

        // Construire la requête pour status_seance
        const seanceQuery = { id_utilisateur: userId, status: 'effectue', date_end: { $gte: start, $lte: end } };
        const seances = await StatusSeance.find(seanceQuery).populate('id_seance', 'nom');

        // Initialiser un tableau pour stocker les statistiques
        const stats = [];

        // Parcourir chaque séance pour obtenir les statistiques des exercices
        for (const seance of seances) {
            // Construire la requête pour status_exercice
            const exerciceQuery = { id_status_seance: seance._id, status: 'effectue' };
            if (exercice) {
                exerciceQuery.id_exercice_custom = new mongoose.Types.ObjectId(exercice);
            }

            const statusExercices = await StatusExercice.find(exerciceQuery).populate('id_exercice_custom');

            // Collecter les statistiques pour chaque exercice
            for (const statusExercice of statusExercices) {
                const exerciceStats = {
                    seance: seance.id_seance.nom,
                    date: seance.date_end.toISOString().split('T')[0], // Format de la date en 'YYYY-MM-DD'
                    exercice: statusExercice.id_exercice_custom.nom,
                    stats: {}
                };

                switch (filter) {
                    case 'poids':
                        exerciceStats.stats.poids = statusExercice.poids;
                        break;
                    case 'rep':
                        exerciceStats.stats.nombre_rep = statusExercice.nombre_rep.reduce((sum, rep) => sum + rep, 0);
                        break;
                    case 'serie':
                        exerciceStats.stats.numero_serie = statusExercice.numero_serie;
                        break;
                    default:
                        break;
                }

                stats.push(exerciceStats);
            }
        }

        // Grouper les exercices par date et appliquer les calculs nécessaires
        const groupedStats = stats.reduce((acc, stat) => {
            const date = stat.date;
            if (!acc[date]) {
                acc[date] = {
                    seance: stat.seance,
                    date: stat.date,
                    exercice: stat.exercice,
                    stats: {
                        poids: [],
                        nombre_rep: 0,
                        numero_serie: 0
                    }
                };
            }
            if (filter === 'poids') {
                acc[date].stats.poids.push(...stat.stats.poids);
            } else if (filter === 'rep') {
                acc[date].stats.nombre_rep += stat.stats.nombre_rep;
            } else if (filter === 'serie') {
                acc[date].stats.numero_serie += stat.stats.numero_serie;
            }
            return acc;
        }, {});

        // Calculer la moyenne pour le poids
        if (filter === 'poids') {
            for (const date in groupedStats) {
                const totalPoids = groupedStats[date].stats.poids.reduce((sum, poids) => sum + poids, 0);
                const countPoids = groupedStats[date].stats.poids.length;
                groupedStats[date].stats.poids = countPoids > 0 ? (totalPoids / countPoids) : 0;
            }
        }

        res.status(200).json(groupedStats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};