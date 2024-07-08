-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 08 juil. 2024 à 23:32
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `fitme`
--

-- --------------------------------------------------------

--
-- Structure de la table `demandes_invitation`
--

CREATE TABLE `demandes_invitation` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `date_invitation` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `invitations`
--

CREATE TABLE `invitations` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `nombre_utilisation` int(11) DEFAULT NULL,
  `limite_utilisation` int(11) NOT NULL,
  `date_creation` date DEFAULT NULL,
  `date_utilisation` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `invitations`
--

INSERT INTO `invitations` (`id`, `email`, `token`, `nombre_utilisation`, `limite_utilisation`, `date_creation`, `date_utilisation`) VALUES
(20, NULL, '600b8beff2653a68d2a0ff3e374355b99a94d21e', 2, 3, '2024-07-08', '2024-07-08'),
(21, 'melvin.delorme12@gmail.com', '94982962878b1ef0a79463ccf0bb0a5719db6e91', 0, 1, '2024-07-08', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `pseudo` varchar(255) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `genre` enum('homme','femme','autre') DEFAULT NULL,
  `photo_profil` varchar(255) DEFAULT NULL,
  `id_status_seance` int(11) DEFAULT NULL,
  `role` enum('admin','utilisateur','banni') NOT NULL,
  `date_inscription` date NOT NULL,
  `date_modification` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `email`, `password`, `pseudo`, `nom`, `prenom`, `age`, `genre`, `photo_profil`, `id_status_seance`, `role`, `date_inscription`, `date_modification`) VALUES
(19, 'fitme-superadmin@gmail.com', '$2b$10$dSqg4lKM3AWm973aFeh9peXeaVz5pmEha9yLREq/ZDDYWZ/RLDJC2', 'Fitme Superadmin', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', '2024-07-07', '2024-07-08'),
(20, 'fitme-administrateur@gmail.com', '$2b$10$mf2ANcLFwL/9Tqq51OPpbOT/xCYIFzNjEgIbIRYft4zF8HA02JdNy', 'Fitme Administrateur', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', '2024-07-07', '2024-07-08'),
(21, 'fitme-utilisateur@gmail.com', '$2b$10$EZ9YSfp2Ok8LtXHBiKqbWOQB5GXemvmQ0AmXX6D8/iT.B2swkcK.S', 'Fitme Utilisateur', 'Fit Me', 'Utilisateur', 22, 'homme', '21.jpg', NULL, 'utilisateur', '2024-07-07', '2024-07-08'),
(22, 'fitme-test.com', '$2b$10$ZlzBUtM90eVLur/s9XAYzuUk2noJlkfTOy/i7TSyZCplMD31OmNxy', 'Fitme Test', NULL, NULL, NULL, NULL, NULL, NULL, 'utilisateur', '2024-07-08', NULL),
(23, 'fitme-test2.com', '$2b$10$zAzLAYHJWmO7iD68754T8el/pcjDSegYUsyify251R6vJ2ON7hnkO', 'Fitme Test 2', NULL, NULL, NULL, NULL, NULL, NULL, 'banni', '2024-07-08', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `demandes_invitation`
--
ALTER TABLE `demandes_invitation`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `invitations`
--
ALTER TABLE `invitations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `demandes_invitation`
--
ALTER TABLE `demandes_invitation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `invitations`
--
ALTER TABLE `invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
